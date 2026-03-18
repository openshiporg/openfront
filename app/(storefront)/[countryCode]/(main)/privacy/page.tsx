import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | SYSmoAI",
  description: "SYSmoAI Privacy Policy — how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen px-6 py-24">
      <div className="max-w-[750px] mx-auto">
        <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-[#94A3B8] mb-12 text-sm">Last updated: March 2026</p>

        {[
          {
            title: "What We Collect",
            body: "We collect information you provide when you create an account, place an order, or contact us — including your name, email address, phone number, and payment information. We also collect basic usage data such as pages visited and browser type to improve our services.",
          },
          {
            title: "How We Use It",
            body: "Your information is used to process orders, deliver services, send order confirmations, respond to enquiries, and improve our platform. We do not sell your data to third parties. We may send promotional emails if you have opted in, and you can unsubscribe at any time.",
          },
          {
            title: "Payment Data",
            body: "Payment transactions through bKash, Nagad, Rocket, or card are processed by third-party payment providers. SYSmoAI does not store your full payment credentials. We only retain transaction reference numbers for order verification.",
          },
          {
            title: "Your Rights",
            body: "You have the right to access, correct, or delete your personal data at any time. To exercise these rights, email us at hello@sysmoai.com. We will respond within 7 working days.",
          },
          {
            title: "Cookies",
            body: "We use essential cookies to keep you logged in and to remember your cart. We do not use third-party advertising cookies. You can disable cookies in your browser settings, though some features may not function correctly.",
          },
          {
            title: "Contact Us",
            body: "For any privacy questions or concerns, contact us at hello@sysmoai.com or via WhatsApp at +880 1865-385348.",
          },
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
