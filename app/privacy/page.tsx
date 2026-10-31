import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Voltair Tech's privacy policy: how we collect, use, and protect your personal data under applicable Indian data protection law.",
  alternates: {
    canonical: "https://www.voltairtech.com/privacy",
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="May 2026">
      <p>
        Voltair Tech (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is an AI services studio incorporated in Mumbai,
        Maharashtra, India. This Privacy Policy explains how we collect, use, and protect
        personal data when you visit <strong>voltairtech.com</strong> or engage us for
        services. We comply with applicable Indian data protection law.
      </p>

      <h2>1. Data We Collect</h2>
      <p>We collect only what we need to deliver our services:</p>
      <ul>
        <li><strong>Contact details</strong>:name, email address, phone number, WhatsApp number, collected when you reach out to start a project.</li>
        <li><strong>Project information</strong>:brief descriptions of your requirements, timelines, and preferences shared during scoping calls.</li>
        <li><strong>Usage data</strong>:anonymised analytics (page views, referral source, session duration) via privacy-preserving tools. No cookies that identify you personally without consent.</li>
        <li><strong>Communications</strong>:messages you send us via email, WhatsApp, or web forms.</li>
      </ul>
      <p>We do <strong>not</strong> collect payment card details directly. Payments are processed by Razorpay or Stripe under their respective privacy policies.</p>

      <h2>2. How We Use Your Data</h2>
      <ul>
        <li>To respond to project inquiries and deliver agreed services.</li>
        <li>To send project updates, invoices, and post-delivery support communications.</li>
        <li>To comply with legal obligations including tax records and contract fulfilment.</li>
        <li>To improve our website and services using aggregated, anonymised analytics.</li>
      </ul>
      <p>We will not send you marketing emails without your explicit consent. You can opt out of any communications at any time by replying &quot;STOP&quot; to any message or emailing <a href="mailto:business@voltairtech.com">business@voltairtech.com</a>.</p>

      <h2>3. Legal Basis for Processing</h2>
      <p>
        We process your personal data on the basis of:
      </p>
      <ul>
        <li><strong>Consent</strong>:when you proactively contact us or fill in a form.</li>
        <li><strong>Contractual necessity</strong>:to perform services you have engaged us for.</li>
        <li><strong>Legitimate interests</strong>:for analytics and security, where these do not override your rights.</li>
        <li><strong>Legal obligation</strong>:for tax, accounting, and regulatory compliance.</li>
      </ul>

      <h2>4. Data Sharing</h2>
      <p>
        We do not sell, rent, or trade your personal data. We may share data with:
      </p>
      <ul>
        <li><strong>Service providers</strong> acting as data processors (e.g., GitHub Pages for hosting, Google Workspace and Google Sheets for email and enquiry records, Razorpay/Stripe for payments), bound by data processing agreements.</li>
        <li><strong>Legal authorities</strong> where required by law or a valid court order.</li>
      </ul>
      <p>We do not sub-contract your project work to third parties without written notice and your consent.</p>

      <h2>5. Data Retention</h2>
      <p>
        We retain project and contact data for 7 years to comply with Indian accounting and tax
        law. Analytics data is retained for 24 months. You may request deletion of marketing
        communications data at any time. Post-deletion, some data may be retained in anonymised
        form for statistical purposes only.
      </p>

      <h2>6. Your Rights</h2>
      <p>As a data principal, you have the right to:</p>
      <ul>
        <li>Access a summary of the personal data we hold about you.</li>
        <li>Correct inaccurate or incomplete personal data.</li>
        <li>Erase personal data where processing was based on consent, unless retention is required by law.</li>
        <li>Withdraw consent at any time without affecting the lawfulness of prior processing.</li>
        <li>Nominate a representative to exercise your rights on your behalf.</li>
        <li>Lodge a grievance with our Grievance Officer (see below) or with the relevant data protection authority.</li>
      </ul>

      <h2>7. Data Security</h2>
      <p>
        We implement reasonable technical and organisational measures to protect personal data,
        including TLS encryption for all data in transit, access controls, and regular security
        reviews. In the event of a data breach that poses a risk to your rights, we will notify
        you and the relevant authority as required by law.
      </p>

      <h2>8. Cookies</h2>
      <p>
        This website uses only essential, anonymous cookies necessary for site functionality.
        We do not use tracking or advertising cookies. You can disable cookies in your browser
        settings without affecting your ability to use the site.
      </p>

      <h2>9. Third-Party Links</h2>
      <p>
        Our website may contain links to third-party services (GitHub, LinkedIn, WhatsApp). We
        are not responsible for the privacy practices of those services and encourage you to
        review their policies.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this policy to reflect changes in law or our practices. The &quot;Last
        updated&quot; date at the top will change. For material changes, we will notify active
        clients via email.
      </p>

      <h2>11. Grievance Officer</h2>
      <div className="legal-page__contact">
        <p>
          To exercise your rights or raise a grievance, contact our Grievance Officer:
          <br /><br />
          <strong>Voltair Tech</strong><br />
          Andheri West, Mumbai, Maharashtra 400053, India<br />
          Email: <a href="mailto:business@voltairtech.com">business@voltairtech.com</a><br />
          Phone: +91 70210 00764<br />
          Response time: within 30 days of receipt.
        </p>
      </div>
    </LegalLayout>
  );
}
