import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Voltair Tech's terms of service: fixed-price engagements, IP ownership, deliverables, support, and governing law for AI services in India.",
  alternates: {
    canonical: "https://www.voltairtech.com/terms",
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="May 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your engagement with Voltair Tech
        (&quot;we&quot;, &quot;us&quot;, or &quot;Voltair Tech&quot;) for AI development services. By initiating
        a project with us, whether via email, WhatsApp, phone, or web form, you agree to
        these Terms. Please read them before proceeding.
      </p>

      <h2>1. Services</h2>
      <p>
        Voltair Tech provides AI product development services including, but not limited to:
        website development, AI automation, chatbot and voice agent development, document assistant
        configuration, mobile app development, and custom AI software. The specific scope,
        deliverables, timeline, and price for each engagement are agreed in a written Statement
        of Work (SoW) or project proposal before work begins.
      </p>

      <h2>2. Fixed-Price Engagements</h2>
      <p>
        All standard engagements are quoted at a fixed price covering the agreed scope. No
        charges are added during a sprint unless the scope changes with your written consent.
        Change requests outside the original SoW are scoped and priced separately.
      </p>
      <p>
        Typical payment terms: 50% advance on project confirmation, 50% on delivery. For
        projects exceeding ₹5 lakh, milestone-based billing schedules are agreed in the SoW.
      </p>

      <h2>3. Timelines</h2>
      <p>
        Timeline commitments (including the 48-hour website delivery) are contingent on
        receiving all required inputs (content, assets, credentials, and approvals) from
        you within the agreed time windows. Delays caused by late content delivery or
        unavailability of stakeholders extend the timeline by a corresponding period.
      </p>

      <h2>4. Intellectual Property</h2>
      <p>
        Upon full payment of the agreed fees, all custom code, designs, and written content
        produced for your project are assigned to you. You own 100% of the deliverables.
        We retain the right to mention the project in our portfolio unless you request
        confidentiality in writing before project start.
      </p>
      <p>
        Third-party libraries, frameworks, and tools (e.g., Next.js, React, and workflow tools) included in
        deliverables are subject to their own open-source or commercial licences. We will
        identify and document these in the project handover notes.
      </p>

      <h2>5. Post-Ship Support</h2>
      <p>
        Every project includes 30 days of free post-ship support covering bug fixes,
        monitoring, and minor tweaks (changes that take under 2 hours). Feature additions
        and scope expansions are quoted separately. After 30 days, ongoing support is available
        under a monthly retainer agreement.
      </p>

      <h2>6. Confidentiality</h2>
      <p>
        We treat all project details, business information, and user data shared with us as
        strictly confidential. We will sign a mutual NDA at your request before the first
        scoping call. We do not share your code, data, or business information with third
        parties without your written consent.
      </p>

      <h2>7. Data Handling</h2>
      <p>
        Any personal data we process on your behalf in the course of delivering services is
        governed by our <a href="/privacy">Privacy Policy</a> and, where applicable, a Data
        Processing Agreement. We handle personal data in line with applicable Indian data
        protection law.
      </p>

      <h2>8. Warranties and Limitations</h2>
      <p>
        We warrant that deliverables will materially conform to the agreed SoW at the time of
        delivery. We do not warrant that AI-generated outputs will be error-free or suitable
        for regulated use cases (medical, legal, financial advice) without additional safeguards.
      </p>
      <p>
        To the maximum extent permitted by law, our total liability for any claim arising out
        of an engagement is limited to the fees paid for that engagement. We are not liable for
        indirect, incidental, or consequential losses.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms are governed by the laws of India. Any disputes shall be subject to the
        exclusive jurisdiction of the courts in Mumbai, Maharashtra.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these Terms periodically. The latest version is always at
        voltairtech.com/terms. Continued use of our services after a material change
        constitutes acceptance of the revised Terms.
      </p>

      <h2>Contact</h2>
      <div className="legal-page__contact">
        <p>
          For any questions about these Terms, reach us at:
          <br /><br />
          <strong>Voltair Tech</strong><br />
          Andheri West, Mumbai, Maharashtra 400053, India<br />
          Email: <a href="mailto:business@voltairtech.com">business@voltairtech.com</a><br />
          Phone: +91 70210 00764
        </p>
      </div>
    </LegalLayout>
  );
}
