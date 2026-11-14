import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { SectionHead } from "@/components/atoms/SectionHead";
import { Kicker } from "@/components/atoms/Kicker";
import { Arr } from "@/components/atoms/Arr";
import { DroneDownload } from "@/components/DroneDownload";
import { SIMULATOR } from "@/lib/drones";
import { SITE_URL, breadcrumbLd } from "@/lib/seo";

const TITLE = "Voltair Drone Simulator Trial Version (DGCA) - Windows and Mac | Voltair";
const DESCRIPTION =
  "Download the Voltair Drone Simulator Trial Version for Windows and Mac. Practise the RPTO test with marks, the 13 DGCA flying exercises and theory lessons, with your RC radio or keyboard. Made in India.";
const URL = `${SITE_URL}/drones/simulator`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "drone simulator",
    "RPTO simulator",
    "DGCA drone simulator",
    "drone pilot training simulator India",
    "drone simulator trial version Windows",
    "drone simulator Mac",
    "RPC drone course",
    "remote pilot certificate practice",
  ],
  alternates: { canonical: URL },
  openGraph: {
    url: URL,
    title: "Voltair Drone Simulator: Trial Version",
    description: DESCRIPTION,
    images: [SIMULATOR.img("v35-home")],
  },
};

const STATS = [
  { n: "180", l: "Marks in the RPTO practice test" },
  { n: "13", l: "DGCA flying exercises (R1.F.3 to R1.F.18)" },
  { n: "11", l: "Theory lessons with quizzes" },
  { n: "Trial", l: "Trial Version for Windows and Mac" },
];

const FEATURES: { img: string; title: string; text: string; isNew?: boolean }[] = [
  {
    img: "exam",
    title: "Take the RPTO test with marks",
    text: "Pre-flight check (25 marks), the 13 DGCA flying exercises (10 marks each) and the post-flight check (25 marks). 180 marks, 108 to pass, exactly how the real test runs.",
  },
  {
    img: "v35-rpto",
    title: "Fly the real exercises",
    text: "Square circuits, circles, figure of 8, night flying, emergencies and more, inside the 60 m by 60 m training area. Live instruments, a drone camera and a map show you what is happening.",
  },
  {
    img: "v35-fpv",
    title: "FPV Racing",
    text: "Fly Acro through 10 gates on a new random course every run, through the FPV camera, with the race clock, gate count and your best time on screen.",
    isNew: true,
  },
  {
    img: "v35-quad",
    title: "A new quad trainer",
    text: "Built from Voltairtech's own drone: carbon arms, cone legs with nav lights, a 2K gimbal camera and a battery hatch you can lift.",
    isNew: true,
  },
  {
    img: "v35-stadium",
    title: "Places that look real",
    text: "New sky and clouds, distant villages and hills, 3D grass and the drone's real sun shadow, at the RPTO ground, a farm and a cricket stadium.",
    isNew: true,
  },
  {
    img: "v35-preflight",
    title: "Check the drone before you fly",
    text: "Walk around the drone and find the problems: a chipped propeller, a worn motor, a cracked arm or a swollen battery under the hatch. Then calibrate the accelerometer and compass (Mission Planner, DJI, Betaflight and INAV methods) and test the motors.",
  },
  {
    img: "v35-night",
    title: "Fly at night",
    text: "The DGCA night flying exercise with pad lights, corner lights and a windsock, under a sky full of stars on a clear night.",
  },
  {
    img: "lesson",
    title: "Study the theory",
    text: "Lessons T1.1 to T1.11 from the DGCA syllabus, each with a 5 question quiz, then a 40 minute theory test with marks and a grade from A to E.",
  },
  {
    img: "v35-graphics",
    title: "Runs on any computer",
    text: "Low, Medium, High or Ultra graphics, plus a setting that keeps the frame rate smooth on ordinary laptops. Text size and screen shape settings suit a TV or projector in a classroom.",
  },
];

const MODES = [
  { k: "1", m: "Stabilize", d: "You control the tilt. The drone levels itself when you let go." },
  { k: "2", m: "Alt Hold", d: "Holds its height. Centre the throttle and it stays put." },
  { k: "3", m: "Loiter", d: "Holds its position using GPS. Let go of the sticks and it brakes." },
  { k: "5", m: "Auto", d: "Flies a mission you plan. You can take over at any time." },
  { k: "6", m: "Return home", d: "Flies back to where it took off and lands." },
];

type Cell = boolean | string;
const COMPARE: { f: string; free: Cell; av3: Cell }[] = [
  { f: "RPTO practice test with marks (180)", free: true, av3: true },
  { f: "Practise any of the 13 flying exercises", free: true, av3: true },
  { f: "Theory lessons, quizzes and theory test", free: true, av3: "188 question bank" },
  { f: "Free flight, drone tuning, radio setup", free: true, av3: true },
  { f: "Pre-flight check and calibration", free: true, av3: true },
  { f: "Full DGCA RPC course, graded A to E", free: false, av3: true },
  { f: "Simulator exercises R1.S.1 to R1.S.11 and test", free: false, av3: true },
  { f: "Every flight logged and replayed in 3D", free: false, av3: true },
  { f: "Trainee records kept for 5 years, sealed", free: false, av3: true },
  { f: "Logbook, skill test and final training reports", free: false, av3: true },
  { f: "Instructor mode: take over, add failures", free: false, av3: true },
  { f: "Assembly and maintenance R1.A.1 to R1.A.6", free: false, av3: true },
  { f: "Edition", free: "Trial Version", av3: "One serial per PC" },
];

const AV3_SHOTS = [
  { img: "course", cap: "The full DGCA RPC course, with each trainee's marks beside every item" },
  { img: "scoreboard", cap: "Every manoeuvre graded A to E, with the measured error shown" },
  { img: "replay", cap: "Replay any flight in 3D with date, time, site and coordinates" },
  { img: "preview", cap: "Records, flight logs and reports, sealed so any change shows" },
];

const FAQS = [
  {
    q: "What is included in the Trial Version?",
    a: "The Trial Version has no sign up. It includes the RPTO practice test with marks, all 13 DGCA flying exercises, the theory lessons and test, free flight and radio setup. Results in the Trial Version are not saved.",
  },
  {
    q: "Is it as per DGCA guidelines?",
    a: "It follows the DGCA RPC syllabus for small rotorcraft (DTC 02 of 2022) and the simulator rules (DTC 01 of 2026). You can download the compliance list, which shows where each DGCA requirement is in the simulator.",
  },
  {
    q: "Can I use my own RC transmitter?",
    a: "Yes. Any radio, USB dongle or gamepad that your computer sees as a game controller works, including EdgeTX and OpenTX radios in USB joystick mode. Radio setup walks you through it in Mode 2. You can also fly with the keyboard.",
  },
  {
    q: "What computer do I need?",
    a: "Windows 10 or 11 (64 bit), or a Mac with Apple silicon (M1 or later) on macOS 11 or newer. A graphics card helps but is not needed: choose Low graphics on a basic laptop.",
  },
  {
    q: "Does it need internet?",
    a: "Only to download it. After that everything works offline. With internet it also shows India drone news and tells you when a new version is out.",
  },
  {
    q: "What is AV3 and who is it for?",
    a: "AV3 is the advanced version for RPTOs, colleges and defence training units. It adds the full DGCA RPC course with grades, flight logs and 3D replay, trainee records, reports and instructor mode. It is switched on inside the same Trial Version download with one serial per PC.",
  },
  {
    q: "The Mac says the app cannot be opened. What do I do?",
    a: "The first time only, right click the app in Applications and choose Open, then click Open again. On the newest macOS, go to System Settings, Privacy and Security, and click Open Anyway. After that it opens normally.",
  },
];

function Tick({ v }: { v: Cell }) {
  if (v === true) return <span className="ok" aria-label="Included">✓</span>;
  if (v === false) return <span aria-label="Not included">·</span>;
  return <>{v}</>;
}

export default function SimulatorPage() {
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SIMULATOR.name,
    softwareVersion: SIMULATOR.version,
    applicationCategory: "GameApplication",
    applicationSubCategory: "Flight simulator",
    operatingSystem: "Windows 10, Windows 11, macOS 11 or later (Apple silicon)",
    description: DESCRIPTION,
    url: URL,
    downloadUrl: [SIMULATOR.windowsUrl, SIMULATOR.macUrl],
    image: `${SITE_URL}${SIMULATOR.img("v35-home")}`,
    screenshot: ["v35-rpto", "v35-fpv", "v35-preflight", "exam"].map((s) => `${SITE_URL}${SIMULATOR.img(s)}`),
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    publisher: { "@type": "Organization", name: "Voltair Tech", url: SITE_URL },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const crumbs = breadcrumbLd([
    { label: "Home", href: "/" },
    { label: "Drones", href: "/drones" },
    { label: "Drone Simulator" },
  ]);

  return (
    <PageLayout footerNum="09">
      {[softwareLd, faqLd, crumbs].map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}

      {/* ── Hero ── */}
      <section className="section section--ink sim-hero">
        <div className="container">
          <nav className="sim-crumbs" aria-label="Breadcrumb">
            <Link href="/drones">Drones</Link> <span aria-hidden="true">/</span> Drone Simulator
          </nav>
          <div className="sim-hero__grid">
            <div>
              <Kicker>Voltair Drone Simulator V3.5</Kicker>
              <h1 className="h-display sim-hero__h">
                Train for your RPTO test. <em>Trial Version.</em>
              </h1>
              <p className="sim-hero__lead">
                A drone flight simulator built as per DGCA guidelines. Take the RPTO practice test with marks,
                fly all 13 DGCA exercises and study the theory, on your own computer, with your RC radio or the keyboard.
              </p>
              <DroneDownload dark />
            </div>
            <div className="sim-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SIMULATOR.img("v35-home")} alt="Voltair Drone Simulator V3.5 home screen: RPTO Test, DGCA Syllabus, FPV Racing, Free Flight, Training and Radio Setup" width={1600} height={748} />
            </div>
          </div>
          <div className="sim-stats">
            {STATS.map((s) => (
              <div key={s.l} className="sim-stat">
                <span className="sim-stat__n">{s.n}</span>
                <span className="sim-stat__l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you can do ── */}
      <section className="section">
        <div className="container">
          <SectionHead
            kicker="In the Trial Version"
            title={<>Everything you need{" "}<br />to practise.</>}
            right={<span className="tag"><span className="pulse" />No sign up</span>}
          />
          <div className="sim-features">
            {FEATURES.map((f) => (
              <article key={f.img} className="sim-feature">
                <div className="sim-feature__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={SIMULATOR.img(f.img)} alt={f.title} width={1600} height={900} loading="lazy" />
                </div>
                {f.isNew ? <span className="sim-feature__new">New in V3.5</span> : null}
                <h3 className="sim-feature__t">{f.title}</h3>
                <p className="sim-feature__d">{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Controls ── */}
      <section className="section section--ink">
        <div className="container">
          <SectionHead
            kicker="Fly it your way"
            title={<>Your radio, a gamepad{" "}<br />or the keyboard.</>}
          />
          <div className="sim-controls">
            <div>
              <p className="sim-controls__p">
                Plug in any RC transmitter, USB dongle or gamepad. The simulator finds it, guesses the channel order
                and walks you through calibration in Mode 2. No radio yet? Fly with the keyboard: W and S for throttle,
                A and D for yaw, the arrow keys for pitch and roll.
              </p>
              <p className="sim-controls__p">
                Practise in three places: an RPTO training ground, a farm and a cricket stadium. Set the wind, gusts
                and time of day, including night flying.
              </p>
            </div>
            <ul className="sim-modes">
              {MODES.map((m) => (
                <li key={m.m} className="sim-mode">
                  <kbd className="sim-mode__k">{m.k}</kbd>
                  <div>
                    <span className="sim-mode__m">{m.m}</span>
                    <span className="sim-mode__d">{m.d}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Trial Version vs AV3 ── */}
      <section className="section" id="av3">
        <div className="container">
          <SectionHead
            kicker="For RPTOs, colleges and defence"
            title={<>Start with the Trial Version.{" "}<br />AV3 to train pilots.</>}
            right={<span className="tag"><span className="pulse" />Same download</span>}
          />
          <p className="sim-av3__lead">
            AV3 is the advanced version for training organisations. It turns the simulator into the full DGCA RPC course,
            with grades, records and reports you can show DGCA. It is switched on inside the same download, one serial per PC.
          </p>
          <div className="cmp sim-cmp" role="table" aria-label="Trial Version and AV3 editions compared">
            <div className="cmp__row cmp__row--head" role="row">
              <div className="cmp__cell" role="columnheader">Feature</div>
              <div className="cmp__cell" role="columnheader">Trial Version</div>
              <div className="cmp__cell us" role="columnheader">AV3</div>
            </div>
            {COMPARE.map((r) => (
              <div key={r.f} className="cmp__row" role="row">
                <div className="cmp__cell label" role="cell">{r.f}</div>
                <div className={"cmp__cell" + (r.free === false ? " bad" : "")} role="cell"><Tick v={r.free} /></div>
                <div className="cmp__cell us" role="cell"><Tick v={r.av3} /></div>
              </div>
            ))}
          </div>

          <div className="sim-shots">
            {AV3_SHOTS.map((s) => (
              <figure key={s.img} className="sim-shot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={SIMULATOR.img(s.img)} alt={s.cap} width={1600} height={900} loading="lazy" />
                <figcaption>{s.cap}</figcaption>
              </figure>
            ))}
          </div>

          <div className="sim-av3__cta">
            <Link className="btn btn-primary" href="/contact">Talk to us about AV3 <Arr /></Link>
            <a className="btn btn-ghost" href="https://wa.me/917021000764?text=Hi%2C%20I%20want%20to%20know%20about%20Voltair%20Drone%20Simulator%20AV3" target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </a>
            <a className="btn btn-ghost" href={SIMULATOR.compliancePdf} target="_blank" rel="noopener">
              DGCA compliance list (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* ── Install ── */}
      <section className="section section--ink">
        <div className="container">
          <SectionHead kicker="Get started" title={<>Install in{" "}<br />two minutes.</>} />
          <div className="sim-install">
            <div className="sim-install__col">
              <h3 className="sim-install__h">Windows 10 and 11</h3>
              <ol className="sim-install__steps">
                <li>Download the installer below.</li>
                <li>Open it. If Windows shows a blue box, click More info, then Run anyway.</li>
                <li>Open Voltair Drone Simulator V3 from the Start menu. F11 makes it full screen.</li>
              </ol>
            </div>
            <div className="sim-install__col">
              <h3 className="sim-install__h">Mac (Apple M1 or later)</h3>
              <ol className="sim-install__steps">
                <li>Download and open the .dmg file.</li>
                <li>Drag Voltair Drone Simulator V3 into Applications.</li>
                <li>The first time only: right click the app, choose Open, then Open again. On the newest macOS use System Settings, Privacy and Security, Open Anyway.</li>
              </ol>
            </div>
          </div>
          <DroneDownload dark />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section">
        <div className="container">
          <SectionHead kicker="Questions" title={<>Before you{" "}<br />download.</>} />
          <div className="sim-faq">
            {FAQS.map((f) => (
              <details key={f.q} className="sim-faq__item">
                <summary className="sim-faq__q">{f.q}</summary>
                <p className="sim-faq__a">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
