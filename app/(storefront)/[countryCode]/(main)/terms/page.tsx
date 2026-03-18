import { Metadata } from "next"
import { PHONE_DISPLAY } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "Terms of Service | SYSmoAI",
  description: "SYSmoAI Terms of Service — please read before using our products and services.",
}

export default function TermsPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen px-6 py-24">
      <div className="max-w-[750px] mx-auto">
        <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
        <p className="text-[#94A3B8] mb-12 text-sm">Last updated: March 2026</p>

        {[
          {
            title: "Service Description",
            body: "SYSmoAI provides AI tool subscriptions and AI implementation services for individuals and businesses in Bangladesh. By using our platform or purchasing our services, you agree to these terms.",
          },
          {
            title: "Payment Terms",
            body: "All prices are listed in Bangladeshi Taka (BDT). We accept bKash, Nagad, Rocket, and bank transfer. Payments must be completed before service delivery begins. Subscriptions renew automatically unless cancelled.",
          },
          {
            title: "Refund Policy",
            body: "Quick Win service engagements include a full refund guarantee if we cannot solve the stated problem within 3 days. For AI tool subscriptions, refunds are available within 24 hours of purchase if the credentials have not been accessed. Sprint and Retainer services are non-refundable once work has begun unless otherwise agreed in writing.",
          },
          {
            title: "Acceptable Use",
            body: "You agree not to resell, redistribute, or share AI tool credentials provided by SYSmoAI. Accounts found sharing credentials will be suspended without refund. Our services may only be used for lawful purposes.",
          },
          {
            title: "Limitation of Liability",
            body: "SYSmoAI is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability in any case is limited to the amount paid for the specific service in question.",
          },
          {
            title: "Changes to Terms",
            body: "We may update these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms. We will notify customers of significant changes via email.",
          },
          {
            title: "Contact",
            body: `For any questions about these terms, contact us at hello@sysmoai.com or via WhatsApp at ${PHONE_DISPLAY}.`,
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
