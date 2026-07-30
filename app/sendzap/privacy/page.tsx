import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "SendZap — Privacy Policy",
  description:
    "Privacy policy for the SendZap Android app by Voltair Tech: what data is stored on your device, what Google AdMob collects, and your choices.",
  alternates: {
    canonical: "https://www.voltairtech.com/sendzap/privacy",
  },
  robots: { index: true, follow: true },
};

export default function SendZapPrivacyPage() {
  return (
    <LegalLayout title="SendZap — Privacy Policy" lastUpdated="June 2026">
      <p>
        This Privacy Policy applies to the <strong>SendZap</strong> mobile application
        (Android package <strong>com.SendZap.app</strong>, the &quot;App&quot;), published by{" "}
        <strong>Voltair Tech</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), an AI
        services studio based in Mumbai, Maharashtra, India. SendZap lets you open a WhatsApp chat
        with any phone number without first saving it to your contacts. It explains what data the
        App handles and what is collected by the third-party advertising service we use. We comply
        with the applicable provisions of the Digital Personal Data Protection (DPDP) Act, 2023 of
        India and with Google Play&apos;s User Data policy.
      </p>

      <h2>1. Summary</h2>
      <ul>
        <li>SendZap has <strong>no account, no login, and no Voltair Tech server</strong>. We do not operate a backend that receives your data.</li>
        <li>The country you select and the message templates you create are stored <strong>only on your device</strong>.</li>
        <li>Phone numbers you type and messages you send are used <strong>solely to open WhatsApp</strong>. We never store, transmit, or read them, and we have no access to your WhatsApp chats.</li>
        <li>The App displays ads through <strong>Google AdMob</strong>, which collects device identifiers and related data as described below.</li>
      </ul>

      <h2>2. Data Stored On Your Device Only</h2>
      <p>
        To make the App work, the following is saved locally on your device using the operating
        system&apos;s standard storage (AsyncStorage). This information never leaves your device
        and is never sent to us or any third party:
      </p>
      <ul>
        <li><strong>Selected country / dialing code</strong>:so the correct prefix is applied.</li>
        <li><strong>Message templates</strong>:the up to nine reusable messages you create.</li>
      </ul>
      <p>
        You can erase all of this at any time by clearing the App&apos;s storage in your device
        settings or by uninstalling the App. Once removed, it is permanently deleted.
      </p>

      <h2>3. Phone Numbers and Messages</h2>
      <p>
        When you enter a phone number and optional message, the App uses them only to construct a
        WhatsApp deep link (for example, <code>whatsapp://send?phone=…&amp;text=…</code>) and hand it
        to WhatsApp on your device. We do <strong>not</strong> store this number or message, we do{" "}
        <strong>not</strong> transmit it to our servers (we have none for this App), and we do{" "}
        <strong>not</strong> access, read, or store your WhatsApp conversations. Once WhatsApp opens,
        your use of WhatsApp is governed by{" "}
        <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
          WhatsApp&apos;s own Privacy Policy
        </a>
        . SendZap is not affiliated with or endorsed by WhatsApp Inc.
      </p>

      <h2>4. Advertising (Google AdMob)</h2>
      <p>
        The App is free and is supported by ads served through{" "}
        <strong>Google AdMob</strong>, a Google service. To serve and measure ads, the AdMob SDK
        may collect and process the following from your device:
      </p>
      <ul>
        <li><strong>Advertising ID</strong> and other device or app identifiers.</li>
        <li><strong>Device information</strong>:device model, operating system version, language, and similar technical details.</li>
        <li><strong>IP address</strong> and coarse (approximate) location derived from it.</li>
        <li><strong>Ad interaction data</strong>:ad views, taps, and similar engagement signals.</li>
      </ul>
      <p>
        Google uses this data to deliver, personalize, cap, and measure advertising and to detect
        fraud, in accordance with{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google&apos;s Privacy Policy
        </a>{" "}
        and{" "}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          how Google uses information from sites or apps that use its services
        </a>
        . Under Google Play&apos;s taxonomy, the Advertising ID is treated as personal data; this
        data is <strong>collected and shared</strong> with Google for advertising purposes.
      </p>

      <h2>5. Data Safety Summary</h2>
      <p>This table mirrors the declarations in our Google Play Data safety form:</p>
      <ul>
        <li><strong>Device or other IDs</strong> (e.g., Advertising ID):collected and shared, for advertising and analytics. Via Google AdMob.</li>
        <li><strong>Approximate location</strong> (derived from IP):collected, for advertising. Via Google AdMob.</li>
        <li><strong>App activity</strong> (ad interactions):collected, for advertising and analytics. Via Google AdMob.</li>
        <li><strong>Locally stored preferences</strong> (country, templates):stored on device only; <strong>not</strong> collected by us or transmitted off the device.</li>
      </ul>
      <p>
        We do not sell your personal data. We do not collect names, email addresses, phone numbers,
        contacts, or message content through the App.
      </p>

      <h2>6. Your Choices and Controls</h2>
      <ul>
        <li><strong>Reset or limit your Advertising ID</strong>:on Android, go to Settings → Google → Ads to reset your advertising ID or opt out of ad personalization.</li>
        <li><strong>Erase local data</strong>:clear the App&apos;s storage or uninstall the App.</li>
        <li><strong>Ad choices</strong>:learn more or opt out of personalized advertising at{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>.
        </li>
      </ul>

      <h2>7. Children</h2>
      <p>
        SendZap is a general-audience utility and is not directed to children under 13 (or the
        equivalent minimum age in your jurisdiction). We do not knowingly collect personal data
        from children. Ads served by AdMob are configured to be suitable for a general audience.
      </p>

      <h2>8. Data Security</h2>
      <p>
        Because preferences are stored only on your device and we operate no backend for this App,
        your locally stored data is protected by your device&apos;s own security. Data transmitted
        to Google for advertising is protected in transit by Google using TLS encryption.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this policy to reflect changes in the App, the advertising services we use,
        or applicable law. The &quot;Last updated&quot; date above will change accordingly. Material
        changes will be reflected in an App update and on this page.
      </p>

      <h2>10. Contact</h2>
      <div className="legal-page__contact">
        <p>
          For any privacy question or request regarding SendZap, contact:
          <br /><br />
          <strong>Voltair Tech</strong><br />
          Andheri West, Mumbai, Maharashtra 400053, India<br />
          Email: <a href="mailto:business@voltairtech.com">business@voltairtech.com</a><br />
          Response time: within 30 days of receipt.
        </p>
      </div>
    </LegalLayout>
  );
}
