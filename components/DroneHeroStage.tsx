"use client";

import { useState } from "react";

interface HeroDrone {
  id: string;
  name: string;
  role: string;
  img: string;
  badge: string;
  specs: { k: string; v: string }[];
}

const HERO_DRONES: HeroDrone[] = [
  {
    id: "trainer",
    name: "PFL TRAINER",
    role: "Quadcopter · Training & Inspection",
    img: "/images/drones/preflight/trainer.webp",
    badge: "UAV PLATFORM 01",
    specs: [
      { k: "FLIGHT", v: "20+ min" },
      { k: "CAMERA", v: "1080p Gimbal" },
      { k: "PAYLOAD", v: "500 g" },
    ],
  },
  {
    id: "talon",
    name: "TALON-1",
    role: "Hybrid VTOL · Day & Night",
    img: "/images/drones/preflight/talon.webp",
    badge: "UAV PLATFORM 02",
    specs: [
      { k: "WINGSPAN", v: "900 mm" },
      { k: "MTOW", v: "1,350 g" },
      { k: "THERMAL", v: "640×512" },
    ],
  },
  {
    id: "cobra",
    name: "COBRA VTOL",
    role: "Long-Endurance Fixed-Wing VTOL",
    img: "/images/drones/preflight/cobra.webp",
    badge: "UAV PLATFORM 03",
    specs: [
      { k: "WINGSPAN", v: "2.0 m" },
      { k: "ENDURANCE", v: "1.5 hr" },
      { k: "MTOW", v: "6 kg" },
    ],
  },
  {
    id: "shrike",
    name: "SHRIKE X8",
    role: "Counter-Drone Net Interceptor",
    img: "/images/drones/preflight/shrike.webp",
    badge: "UAV PLATFORM 04",
    specs: [
      { k: "ROTOR", v: "X8 Octo" },
      { k: "NET", v: "3 × 3 m" },
      { k: "RANGE", v: "10 to 15 m" },
    ],
  },
];

export function DroneHeroStage() {
  const [active, setActive] = useState(0);
  const drone = HERO_DRONES[active];

  return (
    <div className="drone-stage">
      <div className="drone-stage__frame">
        {/* Avionics HUD header bar */}
        <div className="drone-stage__hud-top">
          <span className="drone-stage__hud-pill">
            <span className="drone-stage__led" />
            {drone.badge}
          </span>
          <span className="drone-stage__hud-coords">IN · DGCA READY · TELEMETRY</span>
        </div>

        {/* Main drone visual + clean avionics reticle overlay */}
        <div className="drone-stage__viewport">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={drone.img} alt={`${drone.name} - ${drone.role}`} width={720} height={543} />
          <svg className="drone-stage__reticle" viewBox="0 0 400 260" fill="none" aria-hidden="true">
            <path d="M18 32 V18 H32 M368 18 H382 V32 M18 228 V242 H32 M368 242 H382 V228" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="200" cy="130" r="36" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.55" />
            <path d="M154 130 H176 M224 130 H246 M200 84 V106 M200 154 V176" stroke="currentColor" strokeWidth="1" opacity="0.65" />
          </svg>
        </div>

        {/* Bottom aircraft info + live spec readout */}
        <div className="drone-stage__footer">
          <div>
            <div className="drone-stage__name">{drone.name}</div>
            <div className="drone-stage__role">{drone.role}</div>
          </div>
          <div className="drone-stage__specs">
            {drone.specs.map((s) => (
              <div key={s.k} className="drone-stage__spec">
                <span>{s.k}</span>
                <strong>{s.v}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform selector buttons */}
      <div className="drone-stage__tabs" role="tablist" aria-label="Featured Indian drones">
        {HERO_DRONES.map((d, idx) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={idx === active}
            className={"drone-stage__tab" + (idx === active ? " is-active" : "")}
            onClick={() => setActive(idx)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.img} alt="" width={120} height={90} />
            <span>{d.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

