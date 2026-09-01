import type React from "react";

import Image from "next/image";

import { ServiceGlyph } from "./atoms/ServiceGlyph";

/**
 * Hero right column: what the studio builds, drawn as a hub. Eight capability
 * nodes wired back to the mark in the middle. Geometry is fixed in a 480x420
 * viewBox so the SVG wires and the absolutely-placed cards can't drift apart;
 * the whole box scales with its container (cqw units) instead of reflowing.
 */
const CX = 240;
const CY = 210;
const R = 54;
const ROWS = [40, 140, 280, 380];
/** Where each wire leaves the mark, in degrees from horizontal. */
const ANGLES = [-40, -14, 14, 40];
/** Inner edge of a card: 27.5% of 480. */
const EDGE = 132;

type Node = { icon: string; label: string; row: number; side: -1 | 1 };

const NODES: Node[] = [
  { icon: "web", label: "Websites", row: 0, side: -1 },
  { icon: "chat", label: "WhatsApp chatbots", row: 1, side: -1 },
  { icon: "voice", label: "Phone agents", row: 2, side: -1 },
  { icon: "mobile", label: "Mobile apps", row: 3, side: -1 },
  { icon: "auto", label: "Automation", row: 0, side: 1 },
  { icon: "rag", label: "Answers from your files", row: 1, side: 1 },
  { icon: "soft", label: "Custom software", row: 2, side: 1 },
  { icon: "data", label: "Dashboards", row: 3, side: 1 },
];

function wire({ row, side }: Node) {
  const a = (ANGLES[row] * Math.PI) / 180;
  const ax = CX + side * R * Math.cos(a);
  const ay = CY + R * Math.sin(a);
  const ex = side < 0 ? EDGE : 480 - EDGE;
  const ey = ROWS[row];
  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    d: `M ${round(ax)} ${round(ay)} C ${round(ax + side * 26)} ${round(ay)}, ${ex - side * 18} ${ey}, ${ex} ${ey}`,
    ex,
    ey,
  };
}

/**
 * Two staggered clocks per node, shared by the wire and its card: `--in` is the
 * one-off entrance, `--beat` offsets the node's slot in the repeating pulse so
 * the eight of them fire in sequence rather than together.
 */
const beat = (i: number) =>
  ({ "--in": `${i * 70}ms`, "--beat": `${i * 520}ms` }) as React.CSSProperties;

export function HeroHub() {
  return (
    <aside className="hero__aside" aria-hidden="true">
      <div className="hh">
        <svg className="hh__wires" viewBox="0 0 480 420" fill="none">
          {NODES.map((n, i) => {
            const { d, ex, ey } = wire(n);
            return (
              <g
                key={n.label}
                className={n.side < 0 ? "hh__wire hh__wire--a" : "hh__wire hh__wire--b"}
                style={beat(i)}
              >
                <path className="hh__line" d={d} strokeWidth="1.5" strokeLinecap="round" />
                <path className="hh__pulse" d={d} pathLength={100} strokeWidth="2.5" strokeLinecap="round" />
                <circle className="hh__port" cx={ex} cy={ey} r="3.5" />
              </g>
            );
          })}
        </svg>

        <div className="hh__core">
          <Image src="/logo-mark.png" alt="" width={64} height={64} />
        </div>

        {NODES.map((n, i) => (
          <div
            key={n.label}
            className={"hh__node " + (n.side < 0 ? "hh__node--l" : "hh__node--r")}
            style={{ top: `${(ROWS[n.row] / 420) * 100}%`, ...beat(i) }}
          >
            <span className="hh__glyph">
              <ServiceGlyph kind={n.icon} />
            </span>
            <span className="hh__label">{n.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
