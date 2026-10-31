import type { Metadata } from "next";

import { LegalLayout } from "@/components/LegalLayout";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Recruitment Privacy Notice",
  description:
    "How Voltair Tech collects, stores and uses your résumé and application data when you apply for a role, including our use of AI screening, retention periods, and your rights under the DPDP Act 2023.",
  alternates: { canonical: `${SITE_URL}/recruitment-privacy` },
  robots: { index: true, follow: true },
};

export default function RecruitmentPrivacyPage() {
  return (
    <LegalLayout title="Recruitment Privacy Notice" lastUpdated="July 2026">
      <p>
        This notice explains what happens to the information you send us when you apply
        for a role at <strong>Voltair Tech</strong> through{" "}
        <strong>voltairtech.com/career</strong>. It sits alongside our{" "}
        <a href="/privacy">Privacy Policy</a> and covers recruitment specifically. We
        process this data under the Digital Personal Data Protection Act, 2023 (DPDP).
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>What you type:</strong> your name, email address, and, only if you
          choose to give them, phone number, location, LinkedIn/portfolio links,
          years of experience and your cover note.
        </li>
        <li>
          <strong>Your résumé:</strong> the PDF or DOCX file you attach, and the text
          and structured details extracted from it (current title, skills, education,
          a short professional summary).
        </li>
        <li>
          <strong>Proof of consent:</strong> that you ticked the consent box, and when.
        </li>
        <li>
          <strong>Our own notes:</strong> the hiring stage you&apos;re at, interview
          feedback, and any emails our team sends you about your application.
        </li>
      </ul>
      <p>
        We do not ask for, and would rather you did not send, sensitive data such as
        your date of birth, government ID numbers, photographs, caste, religion,
        health or salary slips at application stage.
      </p>

      <h2>2. Why we process it</h2>
      <p>
        Solely to assess your suitability for the role you applied to (and, unless you
        tell us otherwise, other roles we open that fit your background), to contact
        you about your application, and to keep a record that our hiring decisions were
        made fairly. We never use recruitment data for marketing, and we never sell it.
      </p>

      <h2>3. Automated screening, and what it does not do</h2>
      <p>
        We use an AI model (Google Gemini) to do two things: read your résumé into a
        structured profile, and score how well that profile matches a specific role&apos;s
        stated requirements and skills. The score comes with the reasoning behind it,
        and it is only ever an input.
      </p>
      <ul>
        <li>
          <strong>No decision about you is made solely by a machine.</strong> A person
          reviews every candidate before any shortlist, interview or rejection.
        </li>
        <li>
          Your résumé is sent to Google&apos;s Gemini API for this processing. It is not
          used to train the model.
        </li>
        <li>
          Your résumé data is kept in a separate, private store used only by our hiring
          team. It is <strong>never</strong> added to the knowledge base behind the
          public chatbot on this site, so it cannot surface to a visitor.
        </li>
        <li>
          You can ask us to review a screening outcome by hand. Just email us.
        </li>
      </ul>

      <h2>4. Where it is stored, and who can see it</h2>
      <p>
        Applications are stored in a <strong>private</strong> Google Sheet, and résumé
        files in a <strong>private</strong> Google Drive folder, both owned by Voltair
        Tech&apos;s Google account with no public access. Access is limited to the
        people at Voltair Tech involved in hiring.
      </p>
      <p>
        Our processors are Google (Sheets and Drive for storage, the Gemini API when we
        screen applications, and Gmail when we email you) and GitHub (website hosting).
        Data may be processed on servers outside India by these providers under their
        own contractual and security commitments.
      </p>

      <h2>5. How long we keep it</h2>
      <ul>
        <li>
          <strong>If we hire you:</strong> your application becomes part of your
          employment record and is retained per our employment record policy.
        </li>
        <li>
          <strong>If we don&apos;t:</strong> we keep your application for up to{" "}
          <strong>24 months</strong> so we can come back to you when a suitable role
          opens, then delete it, file and all.
        </li>
        <li>
          <strong>If you ask us to delete it sooner:</strong> we do, and the résumé file
          is removed from storage at the same time as the record.
        </li>
      </ul>

      <h2>6. Your rights</h2>
      <p>Under the DPDP Act you can ask us to:</p>
      <ul>
        <li>tell you what we hold about you and who we&apos;ve shared it with;</li>
        <li>correct anything that is wrong or out of date;</li>
        <li>erase your application and résumé;</li>
        <li>withdraw the consent you gave when you applied, at any time, and as
          easily as you gave it. Withdrawing consent means we stop considering you and
          delete the application; it does not undo processing already done.</li>
      </ul>
      <p>
        Email <a href="mailto:business@voltairtech.com">business@voltairtech.com</a> with
        the subject &ldquo;Recruitment data request&rdquo; and we&apos;ll action it within 30
        days. If you&apos;re not satisfied with our response, you may complain to the Data
        Protection Board of India.
      </p>

      <h2>7. Changes to this notice</h2>
      <p>
        If we change how we handle recruitment data we&apos;ll update this page and the
        &ldquo;last updated&rdquo; date above. Material changes affecting applications
        already with us will be emailed to the address you applied with.
      </p>

      <div className="legal-page__contact">
        <p>
          <strong>Questions about your application data?</strong> Write to{" "}
          <a href="mailto:business@voltairtech.com">business@voltairtech.com</a>, Voltair
          Tech, Andheri West, Mumbai, Maharashtra 400053, India.
        </p>
      </div>
    </LegalLayout>
  );
}
