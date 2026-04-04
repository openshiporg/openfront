import { Metadata } from "next"
import { EMAIL, PHONE_DISPLAY } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "Privacy Policy | SYSmoAI",
  description: "SYSmoAI Privacy Policy — how we collect, use, and protect your data.",
  alternates: { canonical: "https://sysmoai.com/privacy" },
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen px-6 py-24">
      <div className="max-w-[750px] mx-auto">
        <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-[#94A3B8] mb-12 text-sm">Last updated: March 2026</p>

        {[
          { title: "What We Collect", body: "We collect information you provide when you contact us or use our services — including your name, email address, WhatsApp number, and business details. We also collect basic usage data such as pages visited and browser type to improve our services." },
          { title: "How We Use It", body: "Your information is used to deliver our services, respond to enquiries, and communicate project scope and updates. We do not sell your data to third parties. We do not use advertising networks." },
          { title: "WhatsApp Data", body: "When you contact us via WhatsApp, your messages are processed by Meta (WhatsApp). We use WhatsApp solely for business communication. We do not store WhatsApp conversation data outside of the WhatsApp platform." },
          { title: "Your Rights", body: `You have the right to access, correct, or delete your personal data at any time. Email us at ${EMAIL.accounts} and we will respond within 7 working days.` },
          { title: "Cookies", body: "We use essential cookies only — to maintain basic site functionality. We do not use third-party advertising cookies. You can manage cookie preferences via our Cookie Policy page." },
          { title: "Contact", body: `For any privacy questions, email ${EMAIL.accounts} or WhatsApp us at ${PHONE_DISPLAY}.` },
        ].map(({ title, body }) => (
          <section key={title} className="mb-10">
            <h2 className="text-xl font-semibold mb-3">{title}</h2>
            <p className="text-[#94A3B8] leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
