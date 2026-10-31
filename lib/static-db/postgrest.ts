/**
 * A small stand-in for Supabase's REST API (PostgREST) that answers from
 * in-memory tables.
 *
 * The site is a static export on GitHub Pages, so there is no database at
 * build time. Pages keep calling the same supabase-js queries they always
 * used; lib/rag/supabase.ts hands them a client whose `fetch` is this module,
 * reading the content snapshot in content/db/*.json.
 *
 * Supported (everything this codebase uses): select=<cols>|*, filters
 * eq/neq/lt/lte/gt/gte/in/is (optionally prefixed with not.), order (several
 * columns, asc/desc, nulls first/last), limit/offset, Prefer: count=exact,
 * single objects, and the writes insert/upsert/update/delete. Writes are only
 * used by the script that rebuilds the snapshot; the site client is read-only.
 */

export type Row = Record<string, unknown>;
export type Tables = Record<string, Row[]>;

export interface RestRequest {
  method: string;
  url: URL;
  headers: Headers;
  body: string | null;
}

export interface RestResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface RestOptions {
  /** Refuse writes (the site's static client). */
  readOnly?: boolean;
  /** Column defaults applied to inserted rows, per table. */
  defaults?: Record<string, Row>;
}

const RESERVED = new Set(["select", "order", "limit", "offset", "on_conflict", "columns"]);
const OBJECT_ACCEPT = "application/vnd.pgrst.object+json";

class RestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

function json(status: number, data: unknown, extra: Record<string, string> = {}): RestResponse {
  return {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
    body: data === undefined ? "" : JSON.stringify(data),
  };
}

function clone<T>(v: T): T {
  return v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T);
}

/** "(a,b,\"c,d\")" -> ["a", "b", "c,d"] */
function parseList(raw: string): string[] {
  const inner = raw.replace(/^\(/, "").replace(/\)$/, "");
  if (inner === "") return [];
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (quoted && ch === "\\" && i + 1 < inner.length) {
      cur += inner[i + 1];
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  const x = String(a);
  const y = String(b);
  return x < y ? -1 : x > y ? 1 : 0;
}

/** Compare a stored value with a filter argument (always a string in the URL). */
function compareArg(value: unknown, arg: string): number {
  if (typeof value === "number") {
    const n = Number(arg);
    if (Number.isFinite(n)) return value - n;
  }
  return compare(String(value), arg);
}

function test(value: unknown, op: string, arg: string): boolean {
  if (op === "is") {
    if (arg === "null") return value === null || value === undefined;
    if (arg === "true") return value === true;
    if (arg === "false") return value === false;
    throw new RestError(400, "PGRST100", `Unsupported "is" value "${arg}"`);
  }
  // SQL: any comparison with NULL is unknown, so the row never matches.
  if (value === null || value === undefined) return false;
  switch (op) {
    case "eq":
      return compareArg(value, arg) === 0;
    case "neq":
      return compareArg(value, arg) !== 0;
    case "lt":
      return compareArg(value, arg) < 0;
    case "lte":
      return compareArg(value, arg) <= 0;
    case "gt":
      return compareArg(value, arg) > 0;
    case "gte":
      return compareArg(value, arg) >= 0;
    case "in":
      return parseList(arg).some((v) => compareArg(value, v) === 0);
    default:
      throw new RestError(400, "PGRST100", `Unsupported filter operator "${op}"`);
  }
}

type Predicate = (row: Row) => boolean;

function filters(params: URLSearchParams): Predicate[] {
  const out: Predicate[] = [];
  params.forEach((raw, column) => {
    if (RESERVED.has(column)) return;
    if (column === "or" || column === "and") {
      throw new RestError(400, "PGRST100", `Unsupported "${column}" filter`);
    }
    let expr = raw;
    let negate = false;
    if (expr.startsWith("not.")) {
      negate = true;
      expr = expr.slice(4);
    }
    const dot = expr.indexOf(".");
    if (dot < 0) throw new RestError(400, "PGRST100", `Bad filter "${column}=${raw}"`);
    const op = expr.slice(0, dot);
    const arg = expr.slice(dot + 1);
    out.push((row) => {
      const value = row[column];
      if (op !== "is" && (value === null || value === undefined)) return false;
      const hit = test(value, op, arg);
      return negate ? !hit : hit;
    });
  });
  return out;
}

function sortRows(rows: Row[], order: string | null): Row[] {
  if (!order) return rows;
  const keys = order.split(",").map((part) => {
    const [column, ...mods] = part.trim().split(".");
    const desc = mods.includes("desc");
    // Postgres puts NULLs last ascending and first descending, unless told.
    const nullsFirst = mods.includes("nullsfirst") ? true : mods.includes("nullslast") ? false : desc;
    return { column, desc, nullsFirst };
  });
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      for (const { column, desc, nullsFirst } of keys) {
        const x = a.row[column];
        const y = b.row[column];
        const xNull = x === null || x === undefined;
        const yNull = y === null || y === undefined;
        if (xNull || yNull) {
          if (xNull && yNull) continue;
          return xNull === nullsFirst ? -1 : 1;
        }
        const c = compare(x, y);
        if (c !== 0) return desc ? -c : c;
      }
      return a.index - b.index;
    })
    .map(({ row }) => row);
}

function project(rows: Row[], select: string | null): Row[] {
  const spec = (select ?? "*").replace(/\s+/g, "");
  if (spec === "" || spec === "*") return rows.map((r) => clone(r));
  const columns = spec.split(",");
  for (const c of columns) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(c)) {
      throw new RestError(400, "PGRST100", `Unsupported select column "${c}"`);
    }
  }
  return rows.map((r) => {
    const out: Row = {};
    for (const c of columns) out[c] = clone(r[c] ?? null);
    return out;
  });
}

function wantsObject(headers: Headers): boolean {
  return (headers.get("accept") ?? "").startsWith(OBJECT_ACCEPT);
}

function respondRows(
  req: RestRequest,
  rows: Row[],
  status: number,
  extra: Record<string, string> = {},
): RestResponse {
  const shaped = project(rows, req.url.searchParams.get("select"));
  if (wantsObject(req.headers)) {
    if (shaped.length !== 1) {
      return json(406, {
        code: "PGRST116",
        message: "JSON object requested, multiple (or no) rows returned",
        details: `The result contains ${shaped.length} rows`,
        hint: null,
      });
    }
    return json(status, shaped[0], extra);
  }
  return json(status, shaped, extra);
}

function prefers(req: RestRequest, token: string): boolean {
  return (req.headers.get("prefer") ?? "")
    .split(",")
    .map((s) => s.trim())
    .includes(token);
}

function newId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  return "00000000-0000-4000-8000-" + Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}

function handle(tables: Tables, req: RestRequest, opts: RestOptions): RestResponse {
  const match = req.url.pathname.match(/\/rest\/v1\/([^/]+)$/);
  if (!match) throw new RestError(404, "PGRST125", `Unknown path ${req.url.pathname}`);
  const name = decodeURIComponent(match[1]);
  const rows = tables[name];
  if (!rows) {
    throw new RestError(404, "PGRST205", `Could not find the table 'public.${name}' in the schema cache`);
  }
  const params = req.url.searchParams;
  const method = req.method.toUpperCase();

  if (method === "GET" || method === "HEAD") {
    const preds = filters(params);
    const matched = sortRows(
      rows.filter((r) => preds.every((p) => p(r))),
      params.get("order"),
    );
    const offset = Math.max(0, Number(params.get("offset") ?? 0) || 0);
    const limitRaw = params.get("limit");
    const limit = limitRaw === null ? Infinity : Math.max(0, Number(limitRaw) || 0);
    const page = matched.slice(offset, offset + limit);
    const extra: Record<string, string> = {};
    if (prefers(req, "count=exact") || prefers(req, "count=planned") || prefers(req, "count=estimated")) {
      extra["content-range"] = page.length
        ? `${offset}-${offset + page.length - 1}/${matched.length}`
        : `*/${matched.length}`;
    }
    const res = respondRows(req, page, 200, extra);
    return method === "HEAD" ? { ...res, body: "" } : res;
  }

  if (opts.readOnly) {
    throw new RestError(405, "PGRST000", "This is a read-only content snapshot");
  }

  const now = new Date().toISOString();
  const representation = prefers(req, "return=representation");

  if (method === "POST") {
    const payload = JSON.parse(req.body ?? "null") as Row | Row[];
    const items = Array.isArray(payload) ? payload : [payload];
    const merge = prefers(req, "resolution=merge-duplicates");
    const ignore = prefers(req, "resolution=ignore-duplicates");
    const conflict = (params.get("on_conflict") ?? "id").split(",").map((s) => s.trim());
    const written: Row[] = [];
    for (const item of items) {
      const existing =
        merge || ignore
          ? rows.find((r) => conflict.every((c) => item[c] !== undefined && r[c] === item[c]))
          : undefined;
      if (existing) {
        if (ignore) continue;
        Object.assign(existing, clone(item), { updated_at: now });
        written.push(existing);
      } else {
        const row: Row = {
          id: newId(),
          ...clone(opts.defaults?.[name] ?? {}),
          created_at: now,
          updated_at: now,
          ...clone(item),
        };
        rows.push(row);
        written.push(row);
      }
    }
    return representation ? respondRows(req, written, 201) : { status: 201, headers: {}, body: "" };
  }

  if (method === "PATCH" || method === "DELETE") {
    const preds = filters(params);
    const matched = rows.filter((r) => preds.every((p) => p(r)));
    if (method === "PATCH") {
      const patch = JSON.parse(req.body ?? "{}") as Row;
      for (const r of matched) Object.assign(r, clone(patch), { updated_at: now });
    } else {
      for (const r of matched) rows.splice(rows.indexOf(r), 1);
    }
    return representation ? respondRows(req, matched, 200) : { status: 204, headers: {}, body: "" };
  }

  throw new RestError(405, "PGRST000", `Unsupported method ${method}`);
}

/** Answer one REST call against `tables`. Never throws: errors come back as PostgREST error bodies. */
export function handleRest(tables: Tables, req: RestRequest, opts: RestOptions = {}): RestResponse {
  try {
    return handle(tables, req, opts);
  } catch (err) {
    if (err instanceof RestError) {
      return json(err.status, { code: err.code, message: err.message, details: null, hint: null });
    }
    return json(400, { code: "PGRST000", message: String((err as Error)?.message ?? err), details: null, hint: null });
  }
}

/** A `fetch` for supabase-js that serves `tables` read-only. */
export function createStaticFetch(tables: Tables): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const res = handleRest(
      tables,
      {
        method: init?.method ?? "GET",
        url: new URL(href),
        headers: new Headers(init?.headers),
        body: typeof init?.body === "string" ? init.body : null,
      },
      { readOnly: true },
    );
    const empty = res.body === "" || res.status === 204;
    return new Response(empty ? null : res.body, { status: res.status, headers: res.headers });
  };
}
