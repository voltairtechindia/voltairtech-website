import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "SendZap — Terms & Conditions",
  description:
    "Terms & Conditions for the SendZap Android app by Voltair Tech: acceptable use, ads, user responsibility, trademarks, and governing law.",
  alternates: {
    canonical: "https://www.voltairtech.com/sendzap/terms",
  },
  robots: { index: true, follow: true },
};

export default function SendZapTermsPage() {
  return (
    <LegalLayout title="SendZap — Terms & Conditions" lastUpdated="June 2026">
      <p>
        These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of the{" "}
        <strong>SendZap</strong> mobile application (Android package{" "}
        <strong>com.SendZap.app</strong>, the &quot;App&quot;), published by{" "}
        <strong>Voltair Tech</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), based in
        Mumbai, Maharashtra, India. By installing or using the App, you agree to these Terms. If you
        do not agree, please do not use the App.
      </p>

      <h2>1. The Service</h2>
      <p>
        SendZap is a utility that lets you open a WhatsApp chat with any phone number without first
        saving it to your contacts. It builds a WhatsApp deep link from the number and optional
        message you enter and hands it to WhatsApp on your device. SendZap does not send messages on
        your behalf and does not access your WhatsApp account or conversations.
      </p>

      <h2>2. Free Service &amp; Advertising</h2>
      <ul>
        <li>The App is provided <strong>100% free of charge</strong>.</li>
        <li>The App displays advertisements (via Google AdMob) to support ongoing development and maintenance. By using the App you acknowledge and accept that ads are shown.</li>
      </ul>

      <h2>3. User Responsibility</h2>
      <ul>
        <li>You must have an active WhatsApp account on your device to use the App.</li>
        <li>You agree not to use the App for spam, bulk messaging, harassment, fraud, or any unlawful purpose, and to comply with WhatsApp&apos;s own Terms of Service.</li>
        <li>You are responsible for any mobile data or messaging charges incurred while using the App or WhatsApp.</li>
        <li>You are solely responsible for the content of any messages you choose to send.</li>
      </ul>

      <h2>4. Intellectual Property &amp; Trademarks</h2>
      <p>
        &quot;SendZap&quot; and the App&apos;s source code are the property of Voltair Tech.
        &quot;WhatsApp&quot; is a trademark of WhatsApp LLC. SendZap is an independent utility and is{" "}
        <strong>not affiliated with, endorsed by, or sponsored by WhatsApp LLC or Meta</strong>.
      </p>

      <h2>5. Privacy</h2>
      <p>
        Your use of the App is also governed by our{" "}
        <a href="/sendzap/privacy">SendZap Privacy Policy</a>, which explains what data is stored on
        your device and what is collected by Google AdMob for advertising.
      </p>

      <h2>6. Disclaimer &amp; Limitation of Liability</h2>
      <p>
        The App is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without
        warranties of any kind, express or implied. We do not guarantee that the App will be
        uninterrupted, error-free, or compatible with every device or version of WhatsApp. To the
        maximum extent permitted by law, Voltair Tech shall not be liable for any indirect,
        incidental, or consequential damages arising out of your use of the App.
      </p>

      <h2>7. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. The latest version is always available at
        voltairtech.com/sendzap/terms. Continued use of the App after changes constitutes acceptance
        of the revised Terms.
      </p>

      <h2>8. Governing Law</h2>
      <p>
        These Terms are governed by the laws of India. Any disputes shall be subject to the
        exclusive jurisdiction of the courts in Mumbai, Maharashtra.
      </p>

      <h2>Contact</h2>
      <div className="legal-page__contact">
        <p>
          For any questions about these Terms, reach us at:
          <br /><br />
          <strong>Voltair Tech</strong><br />
          Andheri West, Mumbai, Maharashtra 400053, India<br />
          Email: <a href="mailto:business@voltairtech.com">business@voltairtech.com</a>
        </p>
      </div>
    </LegalLayout>
  );
}
