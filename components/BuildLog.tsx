"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/** One 48h build story: the brief, five milestones, and the go-live line. */
type Scenario = {
  brief: string;
  steps: [text: string, time: string][];
  live: [text: string, time: string];
};

const SCENARIOS: Scenario[] = [
  {
    brief: "whatsapp sales bot",
    steps: [
      ["scope locked · fixed quote", "00:38"],
      ["next.js scaffold + auth", "02:14"],
      ["rag index · 1,284 docs", "09:47"],
      ["whatsapp api · hindi + english", "21:35"],
      ["evals green · 47/47", "39:12"],
    ],
    live: ["live on client domain", "47:58"],
  },
  {
    brief: "d2c storefront + upi",
    steps: [
      ["scope locked · fixed quote", "00:41"],
      ["storefront scaffold · 214 skus", "03:02"],
      ["razorpay + upi wired", "11:26"],
      ["abandoned-cart nudges on", "24:18"],
      ["evals green · 38/38", "40:05"],
    ],
    live: ["live on custom domain", "46:51"],
  },
  {
    brief: "clinic appointment bot",
    steps: [
      ["scope locked · fixed quote", "00:29"],
      ["calendar sync · 6 doctors", "02:47"],
      ["patient faq rag · 312 docs", "10:12"],
      ["whatsapp reminders wired", "22:50"],
      ["dry-run · 120 test bookings", "38:26"],
    ],
    live: ["booking patients · live", "45:40"],
  },
  {
    brief: "loan lead qualifier",
    steps: [
      ["scope locked · fixed quote", "00:35"],
      ["intake flow · 9 questions", "02:58"],
      ["crm push · zoho wired", "12:33"],
      ["kyc doc checks automated", "25:41"],
      ["evals green · 52/52", "41:07"],
    ],
    live: ["qualifying leads · live", "47:22"],
  },
  {
    brief: "site-visit scheduler",
    steps: [
      ["scope locked · fixed quote", "00:33"],
      ["listing feed · 86 projects", "03:11"],
      ["whatsapp flow · 3 languages", "13:04"],
      ["agent handoff rules set", "26:19"],
      ["dry-run · 200 visits booked", "40:44"],
    ],
    live: ["booking visits · live", "46:37"],
  },
  {
    brief: "school fee reminder bot",
    steps: [
      ["scope locked · fixed quote", "00:27"],
      ["erp sync · 1,840 students", "02:39"],
      ["parent bot · hindi + marathi", "11:52"],
      ["payment links automated", "23:32"],
      ["evals green · 41/41", "38:58"],
    ],
    live: ["nudging parents · live", "44:12"],
  },
  {
    brief: "shipment tracking copilot",
    steps: [
      ["scope locked · fixed quote", "00:36"],
      ["carrier apis · 4 wired", "03:24"],
      ["eta model tuned", "12:58"],
      ["exception alerts on slack", "25:07"],
      ["evals green · 44/44", "40:36"],
    ],
    live: ["tracking 2,100 shipments", "47:03"],
  },
  {
    brief: "restaurant booking bot",
    steps: [
      ["scope locked · fixed quote", "00:26"],
      ["menu rag · 148 items", "02:31"],
      ["table slots synced", "10:44"],
      ["upsell prompts tuned", "22:15"],
      ["dry-run · 90 covers", "37:49"],
    ],
    live: ["taking bookings · live", "43:26"],
  },
  {
    brief: "gst deadline alerts",
    steps: [
      ["scope locked · fixed quote", "00:31"],
      ["client base · 264 gstins", "02:55"],
      ["deadline engine built", "11:38"],
      ["whatsapp digests styled", "23:57"],
      ["evals green · 36/36", "39:31"],
    ],
    live: ["alerting 264 clients", "45:55"],
  },
  {
    brief: "policy renewal bot",
    steps: [
      ["scope locked · fixed quote", "00:34"],
      ["policy book · 5,212 rows", "03:08"],
      ["renewal journeys mapped", "12:21"],
      ["payment links wired", "24:46"],
      ["evals green · 40/40", "40:19"],
    ],
    live: ["renewals running · live", "46:44"],
  },
  {
    brief: "hindi voice receptionist",
    steps: [
      ["scope locked · fixed quote", "00:30"],
      ["ivr tree replaced", "03:17"],
      ["voice model · hindi tuned", "13:29"],
      ["call routing rules set", "25:53"],
      ["dry-run · 340 calls", "41:22"],
    ],
    live: ["answering calls · live", "47:35"],
  },
  {
    brief: "support inbox autopilot",
    steps: [
      ["scope locked · fixed quote", "00:32"],
      ["helpdesk rag · 2,046 docs", "03:05"],
      ["draft-reply mode on", "12:44"],
      ["escalation rules tuned", "24:29"],
      ["evals green · 58/58", "39:53"],
    ],
    live: ["clearing tickets · live", "46:08"],
  },
  {
    brief: "product catalog rag",
    steps: [
      ["scope locked · fixed quote", "00:37"],
      ["catalog parsed · 3,412 skus", "03:19"],
      ["spec search tuned", "13:11"],
      ["dealer portal wired", "26:02"],
      ["evals green · 45/45", "41:39"],
    ],
    live: ["serving dealers · live", "47:14"],
  },
  {
    brief: "hr onboarding assistant",
    steps: [
      ["scope locked · fixed quote", "00:28"],
      ["policy rag · 486 docs", "02:52"],
      ["day-one flows built", "11:15"],
      ["hrms sync wired", "23:08"],
      ["evals green · 33/33", "38:12"],
    ],
    live: ["onboarding staff · live", "44:48"],
  },
  {
    brief: "order status ivr",
    steps: [
      ["scope locked · fixed quote", "00:25"],
      ["oms hooked · live orders", "02:44"],
      ["voice flows · 2 languages", "11:59"],
      ["refund path automated", "24:03"],
      ["dry-run · 500 calls", "39:44"],
    ],
    live: ["deflecting calls · live", "45:29"],
  },
  {
    brief: "legal doc summarizer",
    steps: [
      ["scope locked · fixed quote", "00:39"],
      ["case files · 918 docs", "03:26"],
      ["citation-safe summaries", "13:47"],
      ["review queue built", "26:31"],
      ["evals green · 49/49", "42:01"],
    ],
    live: ["drafting briefs · live", "47:41"],
  },
  {
    brief: "hotel concierge bot",
    steps: [
      ["scope locked · fixed quote", "00:27"],
      ["property rag · 176 docs", "02:36"],
      ["room service flows on", "11:07"],
      ["pms sync wired", "23:19"],
      ["dry-run · 150 requests", "38:41"],
    ],
    live: ["serving guests · live", "44:57"],
  },
  {
    brief: "reorder alert engine",
    steps: [
      ["scope locked · fixed quote", "00:30"],
      ["stock feed · 1,932 skus", "02:58"],
      ["reorder points learned", "12:09"],
      ["supplier pings automated", "24:52"],
      ["evals green · 37/37", "40:27"],
    ],
    live: ["watching stock · live", "46:19"],
  },
  {
    brief: "investor faq rag",
    steps: [
      ["scope locked · fixed quote", "00:24"],
      ["data room · 342 docs", "02:33"],
      ["answer grounding tuned", "11:31"],
      ["access controls set", "23:44"],
      ["evals green · 42/42", "38:36"],
    ],
    live: ["answering lps · live", "44:21"],
  },
  {
    brief: "course doubt solver",
    steps: [
      ["scope locked · fixed quote", "00:29"],
      ["syllabus rag · 1,108 docs", "03:01"],
      ["step-by-step mode tuned", "12:17"],
      ["telegram bot wired", "24:37"],
      ["evals green · 51/51", "40:52"],
    ],
    live: ["solving doubts · live", "46:58"],
  },
  {
    brief: "field service dispatcher",
    steps: [
      ["scope locked · fixed quote", "00:33"],
      ["technician roster synced", "03:13"],
      ["job routing model tuned", "12:52"],
      ["whatsapp job cards on", "25:24"],
      ["dry-run · 80 dispatches", "40:58"],
    ],
    live: ["dispatching crews · live", "47:09"],
  },
  {
    brief: "review reply autopilot",
    steps: [
      ["scope locked · fixed quote", "00:26"],
      ["gbp + zomato hooked", "02:41"],
      ["brand voice tuned", "11:23"],
      ["approval queue built", "23:14"],
      ["evals green · 35/35", "38:49"],
    ],
    live: ["replying daily · live", "44:33"],
  },
  {
    brief: "b2b quote generator",
    steps: [
      ["scope locked · fixed quote", "00:35"],
      ["price book · 764 rows", "03:07"],
      ["quote pdf templated", "12:36"],
      ["crm push wired", "25:12"],
      ["evals green · 39/39", "40:41"],
    ],
    live: ["quoting in minutes · live", "46:26"],
  },
  {
    brief: "claims intake bot",
    steps: [
      ["scope locked · fixed quote", "00:31"],
      ["claim forms digitized", "02:49"],
      ["photo evidence flow on", "11:44"],
      ["fraud flags tuned", "24:21"],
      ["evals green · 46/46", "39:57"],
    ],
    live: ["filing claims · live", "45:44"],
  },
  {
    brief: "48-hour marketing site",
    steps: [
      ["scope locked · fixed quote", "00:23"],
      ["next.js scaffold + cms", "02:05"],
      ["copy + seo drafted", "09:31"],
      ["analytics + pixels wired", "20:48"],
      ["lighthouse 98 · green", "36:15"],
    ],
    live: ["live on client domain", "42:07"],
  },
];

const LINE_COUNT = 7; // cmd + 5 steps + live, every scenario
const STEP_MS = 950;
const HOLD_MS = 4200;
const TYPE_MS = 26;

const cmdFor = (s: Scenario) => `voltair init --brief "${s.brief}"`;

/** "47:58" (HH:MM on the 48h clock) → seconds. */
const toSeconds = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 3600 + m * 60;
};
const fmt = (s: number) => {
  const v = Math.max(0, Math.floor(s));
  const h = String(Math.floor(v / 3600)).padStart(2, "0");
  const m = String(Math.floor((v % 3600) / 60)).padStart(2, "0");
  const ss = String(v % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
};

/**
 * Decorative 48-hour ship-clock terminal in the hero's right column.
 * Rotates through 25 build stories across sectors: the command line types
 * itself, milestones land while the header clock fast-forwards between their
 * timestamps, and a footer meter tracks progress to "shipped". Each loop picks
 * the next scenario. Renders one complete static story under reduced motion.
 */
export function BuildLog() {
  const [scnIdx, setScnIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const [cmdLen, setCmdLen] = useState(0);
  const clockEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const clock = { v: 0 };
    const renderClock = () => {
      if (clockEl.current) clockEl.current.textContent = fmt(clock.v);
    };
    renderClock();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(LINE_COUNT);
      setCmdLen(cmdFor(SCENARIOS[0]).length);
      clock.v = toSeconds(SCENARIOS[0].live[1]);
      renderClock();
      return;
    }

    let idx = Math.floor(Math.random() * SCENARIOS.length);
    setScnIdx(idx);

    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    let typer: ReturnType<typeof setInterval> | undefined;
    let tween: gsap.core.Tween | undefined;

    const typeCmd = (cmd: string) => {
      let n = 0;
      typer = setInterval(() => {
        n += 1;
        setCmdLen(n);
        if (n >= cmd.length && typer) clearInterval(typer);
      }, TYPE_MS);
    };

    const step = () => {
      const scn = SCENARIOS[idx];
      i += 1;
      setShown(i);
      const time = i === LINE_COUNT ? scn.live[1] : i >= 2 ? scn.steps[i - 2][1] : undefined;
      if (i === 1) typeCmd(cmdFor(scn));
      if (time) {
        tween?.kill();
        tween = gsap.to(clock, {
          v: toSeconds(time) + ((i * 17) % 60),
          duration: 0.85,
          ease: "power2.out",
          onUpdate: renderClock,
        });
      }
      if (i < LINE_COUNT) {
        t = setTimeout(step, i === 1 ? Math.max(STEP_MS, cmdFor(scn).length * TYPE_MS + 300) : STEP_MS);
      } else {
        t = setTimeout(() => {
          i = 0;
          idx = (idx + 1) % SCENARIOS.length;
          setScnIdx(idx);
          setShown(0);
          setCmdLen(0);
          tween?.kill();
          clock.v = 0;
          renderClock();
          t = setTimeout(step, 700);
        }, HOLD_MS);
      }
    };
    t = setTimeout(step, 600);

    return () => {
      clearTimeout(t);
      if (typer) clearInterval(typer);
      tween?.kill();
    };
  }, []);

  const scn = SCENARIOS[scnIdx];
  const cmd = cmdFor(scn);
  const lines = [
    { glyph: "$", text: cmd, time: undefined as string | undefined, kind: "cmd" },
    ...scn.steps.map(([text, time]) => ({ glyph: "✓", text, time, kind: "ok" })),
    { glyph: "●", text: scn.live[0], time: scn.live[1], kind: "live" },
  ];
  const typing = shown > 0 && shown < LINE_COUNT;
  const done = shown === LINE_COUNT;
  const pct = Math.round((shown / LINE_COUNT) * 100);

  return (
    <aside className="hero__aside" aria-hidden="true">
      <div className={done ? "bl is-done" : "bl"}>
        <div className="bl__bar">
          <span className="bl__title">
            <span className="bl__pulse" />
            build.log
          </span>
          <span className="bl__clock" ref={clockEl}>
            00:00:00
          </span>
        </div>
        <ol className="bl__lines">
          {lines.map((l, idx2) => (
            <li
              key={`${scnIdx}-${idx2}`}
              className={[
                "bl__line",
                `bl__line--${l.kind}`,
                idx2 < shown ? "on" : "",
                typing && idx2 === shown - 1 ? "is-cur" : "",
              ].join(" ")}
            >
              <span className="bl__glyph">{l.glyph}</span>
              <span className="bl__text">{idx2 === 0 ? cmd.slice(0, cmdLen) : l.text}</span>
              {l.time ? (
                <>
                  <span className="bl__leader" />
                  <span className="bl__time">{l.time}</span>
                </>
              ) : null}
            </li>
          ))}
        </ol>
        <div className="bl__foot">
          <span className="bl__status">
            {done ? `shipped · ${scn.live[1]}` : shown === 0 ? "queued" : `building · step ${shown}/${LINE_COUNT}`}
          </span>
          <span className="bl__meter">
            <i style={{ width: `${pct}%` }} />
          </span>
        </div>
      </div>
    </aside>
  );
}
