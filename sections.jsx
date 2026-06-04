/* sections.jsx — all page sections */

const C = window.VT_CONTENT;

/* ============ NAV ============ */
function Brand({ size = 18 }) {
  return (
    <span className="brand-word" style={{ fontSize: size }}>
      VOLT<span className="ai-glow">AI</span>R&nbsp;TECH
    </span>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="nav__row">
        <a className="nav__brand" href="#top">
          <VMark size={36} />
          <Brand size={18} />
        </a>
        <nav className="nav__links">
          {C.nav.map((n) => (
            <a key={n.href} href={n.href}>{n.label}</a>
          ))}
        </nav>
        <div className="nav__right">
          <span className="nav__avail"><span className="pulse" />Booking · 1 slot this week</span>
          <a className="btn btn-primary btn-sm" href="#footer">Contact us <Arr /></a>
        </div>
      </div>
    </header>
  );
}

/* ============ HERO ============ */
function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero__mesh" />
      <div className="hero__grain" />
      <div className="hero__grid">
        <div className="hero__copy">
          <div className="hero__eyebrow">
            <Kicker>[ 01 ] AI Services Studio · Mumbai</Kicker>
            <span className="tag"><span className="pulse" />en-IN · hi-IN · mr-IN</span>
          </div>
          <h1 className="hero__h">
            Build <span className="red">AI</span><br/>for India.
          </h1>
          <p className="hero__sub">
            <strong>Apps, automations, chatbots, RAG, full software</strong> — engineered with AI by a Mumbai team. <strong className="red-strong">Websites ship in 48 hours.</strong> Larger products on a fixed timeline.
          </p>
          <div className="hero__ctas">
            <a className="btn btn-primary" href="#footer">Start a project <Arr /></a>
            <a className="btn btn-ghost" href="#work">See what we build</a>
          </div>
          <div className="hero__proof">
            <div className="hero__proof-item"><b>42+</b>shipped since 2024</div>
            <div className="hero__proof-item"><b>28</b>clients · IN / EU / APAC</div>
            <div className="hero__proof-item"><b>99.9%</b>uptime · last 90d</div>
            <div className="hero__proof-item"><b>10+</b>languages · voice + text</div>
          </div>
        </div>
        <div className="hero__art"><Monogram /></div>
      </div>
    </section>
  );
}

/* ============ SERVICES ============ */
function ServiceGlyph({ kind }) {
  // Refined geometric glyphs — no emoji
  const stroke = "#E63946"; const sw = 1.5;
  switch (kind) {
    case "web": return (
      <svg viewBox="0 0 56 56" fill="none">
        <rect x="6" y="10" width="44" height="32" rx="3" stroke={stroke} strokeWidth={sw} />
        <line x1="6" y1="18" x2="50" y2="18" stroke={stroke} strokeWidth={sw} />
        <circle cx="11" cy="14" r="1" fill={stroke} /><circle cx="15" cy="14" r="1" fill={stroke} /><circle cx="19" cy="14" r="1" fill={stroke} />
        <rect x="12" y="24" width="22" height="3" rx="1" fill="#F5F5F0" opacity="0.5" />
        <rect x="12" y="30" width="14" height="3" rx="1" fill="#F5F5F0" opacity="0.3" />
      </svg>
    );
    case "auto": return (
      <svg viewBox="0 0 56 56" fill="none">
        <circle cx="10" cy="14" r="4" stroke={stroke} strokeWidth={sw} />
        <circle cx="46" cy="14" r="4" stroke={stroke} strokeWidth={sw} />
        <circle cx="28" cy="42" r="4" stroke={stroke} strokeWidth={sw} />
        <path d="M13 18 L26 38 M43 18 L30 38 M14 14 L42 14" stroke="#F5F5F0" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
      </svg>
    );
    case "chat": return (
      <svg viewBox="0 0 56 56" fill="none">
        <rect x="6" y="12" width="44" height="26" rx="6" stroke={stroke} strokeWidth={sw} />
        <path d="M18 38 L22 46 L28 38" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="20" cy="25" r="1.8" fill="#F5F5F0" />
        <circle cx="28" cy="25" r="1.8" fill="#F5F5F0" />
        <circle cx="36" cy="25" r="1.8" fill="#F5F5F0" />
      </svg>
    );
    case "rag": return (
      <svg viewBox="0 0 56 56" fill="none">
        <rect x="8" y="8" width="40" height="40" rx="2" stroke={stroke} strokeWidth={sw} />
        <path d="M8 20 H48 M8 32 H48 M20 8 V48 M32 8 V48" stroke="#F5F5F0" strokeWidth="1" opacity="0.4" />
        <circle cx="14" cy="14" r="2" fill="#D9FF00" />
        <circle cx="26" cy="26" r="2" fill="#D9FF00" />
        <circle cx="38" cy="20" r="2" fill="#D9FF00" />
        <circle cx="42" cy="38" r="2" fill="#D9FF00" />
      </svg>
    );
    case "mobile": return (
      <svg viewBox="0 0 56 56" fill="none">
        <rect x="18" y="6" width="20" height="44" rx="4" stroke={stroke} strokeWidth={sw} />
        <line x1="18" y1="14" x2="38" y2="14" stroke={stroke} strokeWidth={sw} />
        <line x1="18" y1="42" x2="38" y2="42" stroke={stroke} strokeWidth={sw} />
        <circle cx="28" cy="46" r="1.5" fill={stroke} />
        <rect x="22" y="18" width="12" height="3" rx="1" fill="#F5F5F0" opacity="0.5" />
        <rect x="22" y="24" width="8" height="3" rx="1" fill="#F5F5F0" opacity="0.3" />
      </svg>
    );
    case "soft": return (
      <svg viewBox="0 0 56 56" fill="none">
        <path d="M18 6 L8 28 L18 50" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
        <path d="M38 6 L48 28 L38 50" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
        <path d="M32 8 L24 48" stroke="#F5F5F0" strokeWidth={sw} strokeLinecap="round" opacity="0.6" />
      </svg>
    );
    default: return null;
  }
}

function Services() {
  return (
    <section id="services" className="section section--ink">
      <div className="container">
        <        SectionHead
          kicker="[ 02 ] What we build"
          title={<>Six services,<br/>one team.</>}
          right={<span className="tag"><span className="pulse" />websites ship in 48 hrs</span>}
        />
        <div className="svc-grid">
          {C.services.map((s) => (
            <article key={s.n} className="svc-card">
              <span className="svc-card__num">[ {s.n} ]</span>
              <span className="svc-card__arrow">↗</span>
              <div style={{ width: 56, height: 56, marginTop: 22 }}>
                <ServiceGlyph kind={s.glyph} />
              </div>
              <h3 className="svc-card__title">{s.title}</h3>
              <ul className="svc-card__bullets">
                {s.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
              {s.eta ? <div className="svc-card__eta">ETA — <b>{s.eta}</b></div> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ TIMELINE ============ */
function Timeline() {
  return (
    <section id="timeline" className="section">
      <div className="container">
        <SectionHead
          kicker="[ 03 ] The 48-hour website timeline"
          title={<>Discovery to deployed.<br/>Forty-eight hours flat.</>}
          right={<span className="meta mono-lbl">marketing websites · fixed timeline</span>}
        />
        <div className="tl">
          <div className="tl__rail" />
          <div className="tl__grid">
            {C.timeline.map((t, i) => (
              <div key={t.n} className={"tl__node " + (i < 3 ? "tl__node--done" : "")}>
                <div className="tl__dot" />
                <div className="tl__hr">{t.hr}</div>
                <div className="tl__num">{t.n}<sup>hr</sup></div>
                <div className="tl__lbl">{t.label}</div>
                <div className="tl__desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ RAG ============ */
function RagShowcase() {
  const [i, setI] = React.useState(3);
  const stages = C.rag;
  const cur = stages[i];
  return (
    <section id="rag" className="section section--ink">
      <div className="container">
        <SectionHead
          kicker="[ 04 ] RAG showcase"
          title={<>Citation-grade answers,<br/>grounded in <em style={{ color: "var(--v-red)", fontStyle: "normal" }}>your</em> data.</>}
          right={<span className="tag"><span className="pulse" />click each stage</span>}
        />
        <div className="rag__diag">
          {stages.map((s, idx) => (
            <React.Fragment key={s.name}>
              <button
                className="rag__chip"
                aria-pressed={idx === i}
                onClick={() => setI(idx)}
              >
                <span className="n">0{idx + 1}</span>{s.name}
              </button>
              {idx < stages.length - 1 ? <span className="rag__arr">→</span> : null}
            </React.Fragment>
          ))}
        </div>
        <div className="rag__panel">
          <div className="rag__panel-name">
            <span className="n">STAGE 0{i + 1} / 0{stages.length}</span>
            {cur.name}
          </div>
          <div className="rag__panel-body">
            <p>{cur.desc}</p>
            <p style={{ marginTop: 12 }}><code>{cur.code}</code></p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ BIG INPUT ============ */
function BigInput() {
  const [val, setVal] = React.useState("");
  const [chan, setChan] = React.useState("whatsapp");
  return (
    <section className="section">
      <div className="container">
        <div className="bi">
          <div className="bi__hd">
            <div>
              <Kicker>[ 05 ] Tell us what you want</Kicker>
              <h2 className="bi__h" style={{ marginTop: 12 }}>
                We'll <em>build it.</em>
              </h2>
            </div>
            <p className="lead" style={{ maxWidth: 360 }}>
              Type one line. We reply within an hour with a 48-hour plan. No forms, no decks, no fluff.
            </p>
          </div>
          <div className="bi__field">
            <textarea
              className="bi__textarea"
              placeholder="A WhatsApp bot that answers questions over our 800-page policy doc, in Hindi and English…"
              value={val}
              onChange={(e) => setVal(e.target.value)}
            />
            <div className="bi__row">
              <div className="bi__channels">
                <span className="meta mono-lbl" style={{ marginRight: 6 }}>reply on</span>
                {["whatsapp", "email"].map((c) => (
                  <button key={c} className={"bi__channel " + (chan === c ? "on" : "")} onClick={() => setChan(c)}>
                    {c === "whatsapp" ? "WhatsApp" : "Email"}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary">Ship it <Arr /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ MARQUEE ============ */
function Marquee() {
  const items = [...C.stack, ...C.stack];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {items.map((s, i) => (
          <span key={i} className="marquee__item">
            {s}<span className="dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============ PROCESS ============ */
function Process() {
  return (
    <section className="section">
      <div className="container">
        <SectionHead
          kicker="[ 06 ] Process"
          title={<>Four steps. No buzzwords.</>}
          right={<span className="meta mono-lbl">scope → lock → ship → hand off</span>}
        />
        <div className="proc-grid">
          {C.process.map((p) => (
            <div key={p.n} className="proc-step">
              <div className="proc-step__n">{p.n}</div>
              <div className="proc-step__t">{p.t}.</div>
              <p className="proc-step__d">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ WHY INDIA / COMPARISON ============ */
function WhyIndia() {
  return (
    <section id="work" className="section">
      <div className="container">
        <SectionHead
          kicker="[ 07 ] Why VOLTAIRTECH / why India"
          title={<>Indian operators,<br/>global standards.</>}
          right={<span className="tag"><span className="pulse" />DPDP Act 2023 · day one</span>}
        />
        <div className="cmp">
          <div className="cmp__row cmp__row--head">
            <div className="cmp__cell">{/* spacer */}</div>
            <div className="cmp__cell us">VOLTAIRTECH</div>
            <div className="cmp__cell">In-house hire</div>
            <div className="cmp__cell">Upwork freelancer</div>
          </div>
          {C.compare.map((r) => (
            <div key={r.label} className="cmp__row">
              <div className="cmp__cell label">{r.label}</div>
              <div className="cmp__cell us"><span className="ok">{r.us}</span></div>
              <div className="cmp__cell bad">{r.inhouse}</div>
              <div className="cmp__cell bad">{r.upwork}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ FAQ ============ */
function Faq() {
  // All items expanded by default; click toggles individual close/open.
  const [closed, setClosed] = React.useState(new Set());
  const toggle = (i) => {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };
  return (
    <section id="faq" className="section section--ink">
      <div className="container">
        <SectionHead
          kicker="[ 08 ] Frequently asked"
          title={<>Answers, not<br/>brochures.</>}
          right={<span className="meta mono-lbl">FAQPage schema · AEO-ready</span>}
        />
        <div className="faq">
          {C.faq.map((f, i) => {
            const open = !closed.has(i);
            return (
              <div
                key={i}
                className="faq__item"
                aria-expanded={open}
                onClick={() => toggle(i)}
              >
                <div className="faq__q">
                  <div className="faq__q-text">{f.q}</div>
                  <div className="faq__q-mark">+</div>
                </div>
                <p className="faq__a">{f.a}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============ FOOTER CTA ============ */
function FooterCta() {
  return (
    <section id="footer" className="foot">
      <div className="foot__mesh" />
      <div className="container">
        <div className="foot__grid">
          <div>
            <Kicker>[ 09 ] Start</Kicker>
            <h2 className="foot__h" style={{ marginTop: 16 }}>
              Pick a channel.<br/>We reply <em>in under an hour.</em>
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28 }}>
              <VMark size={44} bg="#1A1A1A" />
              <div>
                <Brand size={22} />
                <div className="mono-lbl" style={{ marginTop: 4 }}>AI services · Mumbai</div>
              </div>
            </div>
            <p className="foot__sub">
              Mon–Sat, 10:00 to 20:00 IST. WhatsApp is fastest. Email if you want a paper trail. Call if you're in a hurry.
            </p>
            <div className="foot__chans">
              <a className="foot__chan" href={"https://wa.me/917021000764"}>
                <div className="l">
                  <div className="foot__icon">
                    <svg viewBox="0 0 32 32" width="20" height="20" fill="#25D366"><path d="M16 0C7.2 0 0 7.2 0 16c0 2.8.7 5.6 2.1 8L0 32l8-2.1c2.4 1.4 5.2 2.1 8 2.1 8.8 0 16-7.2 16-16S24.8 0 16 0zm0 29.5c-2.5 0-4.9-.6-7.1-1.9l-.5-.3-4.7 1.3 1.3-4.7-.3-.5C3.4 21.5 2.5 18.8 2.5 16 2.5 8.5 8.5 2.5 16 2.5S29.5 8.5 29.5 16 23.5 29.5 16 29.5z"/></svg>
                  </div>
                  <div><b>WhatsApp</b><br/><span>fastest · usually &lt; 5 min</span></div>
                </div>
                <div className="r">+91 70210 00764 →</div>
              </a>
              <a className="foot__chan" href={"mailto:business@voltairtech.com"}>
                <div className="l">
                  <div className="foot__icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F5F5F0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7 L12 13 L21 7"/></svg>
                  </div>
                  <div><b>Email</b><br/><span>paper trail · &lt; 1 hr reply</span></div>
                </div>
                <div className="r">business@voltairtech.com →</div>
              </a>
              <a className="foot__chan" href={"tel:+917021000764"}>
                <div className="l">
                  <div className="foot__icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F5F5F0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div><b>Phone</b><br/><span>direct line · founder picks up</span></div>
                </div>
                <div className="r">+91 70210 00764 →</div>
              </a>
            </div>
            <div className="foot__addr">
              <b>Andheri West, Mumbai</b>
              <span>Maharashtra · 400053 · India</span>
              <span>Mon–Sat · 10:00 – 20:00 IST</span>
            </div>
          </div>
          <div className="foot__map">
            <div className="foot__map-art">
              <div className="foot__pin">
                <div className="ring" />
                <div className="dot" />
              </div>
              <div className="foot__pin-label">VOLTAIRTECH HQ · ANDHERI W</div>
            </div>
            <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between" }}>
              <span className="mono-lbl">19.13°N · 72.83°E</span>
              <span className="mono-lbl">open map →</span>
            </div>
          </div>
        </div>
        <div className="foot__legal">
          <span>© 2026 VOLTAIRTECH · Andheri West, Mumbai · voltairtech.com</span>
          <span style={{ display: "flex", gap: 18 }}>
            <a href="#">privacy</a>
            <a href="#">terms</a>
            <a href="#">dpdp</a>
            <a href="#">sitemap</a>
          </span>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, Hero, Services, Timeline, RagShowcase, BigInput, Marquee, Process, WhyIndia, Faq, FooterCta });
