import { Metadata } from "next"
import { EMAIL, PHONE_DISPLAY } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "Terms of Service | SYSmoAI",
  description: "SYSmoAI Terms of Service — rules for using our AI systems services.",
  alternates: { canonical: "https://sysmoai.com/terms" },
}

export default function TermsPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen px-6 py-24">
      <div className="max-w-[750px] mx-auto">
        <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
        <p className="text-[#94A3B8] mb-12 text-sm">Last updated: March 2026</p>

        {[
          { title: "Services", body: "SYSmoAI provides AI systems implementation services including AI Profit Audits, Implementation Sprints, and Monthly Retainers. All service scopes are agreed in writing before work begins." },
          { title: "Payment", body: "Payment is accepted via bKash, Nagad, Rocket, or bank transfer. Audit fees are paid in full upfront. Sprint fees are 50% upfront and 50% on delivery. Retainer fees are billed monthly in advance." },
          { title: "Scope & Changes", body: "All projects begin with a written scope document. Changes to scope after agreement may result in revised pricing and timelines, agreed in writing before implementation." },
          { title: "Deliverables", body: "We deliver all work via shared Notion workspaces, Google Drive, or other agreed platforms. We provide documentation and training for all systems we build." },
          { title: "Refund Policy", body: "AI Profit Audits include a full refund guarantee — if the audit delivers no actionable insights, you pay nothing. Sprint and Retainer refunds are governed by our separate Refund Policy." },
          { title: "Intellectual Property", body: "All systems we build on your existing accounts and tools belong to you. Any proprietary methodologies, templates, or frameworks we use remain the property of SYSmoAI." },
          { title: "Limitation of Liability", body: "SYSmoAI is not liable for indirect losses arising from the use of systems we build. Our total liability is limited to the fees paid for the specific engagement in question." },
          { title: "Contact", body: `For any questions about these terms, email ${EMAIL.accounts} or WhatsApp us at ${PHONE_DISPLAY}.` },
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
