import { Metadata } from "next"
import { EMAIL, WA } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "Refund Policy | SYSmoAI",
  description: "SYSmoAI Refund Policy — our guarantees and refund terms for AI systems services.",
  alternates: { canonical: "https://sysmoai.com/refund" },
}

export default function RefundPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen px-6 py-24">
      <div className="max-w-[750px] mx-auto">
        <h1 className="text-4xl font-bold mb-3">Refund Policy</h1>
        <p className="text-[#94A3B8] mb-12 text-sm">Last updated: March 2026</p>

        {[
          { title: "AI Profit Audit — Full Refund Guarantee", body: "If an AI Profit Audit delivers no actionable insights — meaning we cannot identify a bottleneck or produce a fix plan with measurable value — you receive a 100% refund, no questions asked. We have not needed to issue this refund to date, but the guarantee stands unconditionally." },
          { title: "Implementation Sprint — Partial Refund", body: "Sprints are scoped and agreed in writing before work begins. If we fail to deliver the agreed scope within the agreed timeline, you are entitled to a partial refund proportional to undelivered work. We have not failed to deliver a sprint to date." },
          { title: "Monthly Retainer — Cancellation", body: "Retainers can be cancelled at any time with 7 days' written notice via WhatsApp or email. We do not offer refunds for the current billing month once work has begun. No lock-in periods apply." },
          { title: "Requesting a Refund", body: `To request a refund, WhatsApp us or email ${EMAIL.accounts} with your project details and the reason for your request. We will review and respond within 48 hours.` },
          { title: "Exclusions", body: "Refunds are not available for completed and accepted work where the scope was fulfilled as agreed. Change-of-mind refunds are not available after work has commenced." },
        ].map(({ title, body }) => (
          <section key={title} className="mb-10">
            <h2 className="text-xl font-semibold mb-3">{title}</h2>
            <p className="text-[#94A3B8] leading-relaxed">{body}</p>
          </section>
        ))}

        <div className="mt-12 bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6">
          <p className="text-white font-semibold mb-2">Questions about a refund?</p>
          <a href={WA.contact} target="_blank" rel="noopener noreferrer"
            className="text-[#25D366] hover:underline text-sm">Message us on WhatsApp →</a>
        </div>
      </div>
    </div>
  )
}
