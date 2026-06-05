import { CONTENT } from "@/lib/content";
import { SectionHead } from "./atoms/SectionHead";

export function WhyIndia() {
  return (
    <section id="work" className="section">
      <div className="container">
        <SectionHead
          kicker="[ 03 ] Why VOLTAIR TECH / why India"
          title={<>Indian operators,<br />global standards.</>}
          right={<span className="tag"><span className="pulse" />Razorpay-native · day one</span>}
        />
        <div className="cmp">
          <div className="cmp__row cmp__row--head">
            <div className="cmp__cell">{/* spacer */}</div>
            <div className="cmp__cell us">VOLTAIR TECH</div>
            <div className="cmp__cell">In-house hire</div>
            <div className="cmp__cell">Upwork freelancer</div>
          </div>
          {CONTENT.compare.map((r) => (
            <div key={r.label} className="cmp__row">
              <div className="cmp__cell label">{r.label}</div>
              <div className="cmp__cell us">
                <span className="ok">{r.us}</span>
              </div>
              <div className="cmp__cell bad">{r.inhouse}</div>
              <div className="cmp__cell bad">{r.upwork}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
