import { Metadata } from "next"
import { EMAIL } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "Cookie Policy | SYSmoAI",
  description: "SYSmoAI Cookie Policy — what cookies we use and how to control them.",
  alternates: { canonical: "https://sysmoai.com/cookie-policy" },
}

export default function CookiePolicyPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen px-6 py-24">
      <div className="max-w-[750px] mx-auto">
        <h1 className="text-4xl font-bold mb-3">Cookie Policy</h1>
        <p className="text-[#94A3B8] mb-12 text-sm">Last updated: March 2026</p>

        {[
          { title: "What Are Cookies", body: "Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and provide basic functionality." },
          { title: "Cookies We Use", body: "We use essential cookies only — these are strictly necessary for the website to function. They do not track you for advertising purposes and are not shared with third parties. No analytics or marketing cookies are used on this site." },
          { title: "Essential Cookies", body: "Essential cookies maintain your session state and remember your cookie consent preference. Without these, the site cannot function correctly. These cookies expire within 30 days." },
          { title: "Third-Party Cookies", body: "We do not use third-party advertising cookies. If you click on a WhatsApp link, you will be directed to WhatsApp's platform, which operates under Meta's privacy policies." },
          { title: "Managing Cookies", body: "You can control cookies through your browser settings. Disabling essential cookies may affect site functionality. You can also update your cookie preference on this site at any time using the cookie consent banner." },
          { title: "Contact", body: `For any questions about our cookie usage, email ${EMAIL.accounts}.` },
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
