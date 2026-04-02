import { Metadata } from "next"
import { WA } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "AI Systems for Accounting Firms | SYSmoAI",
  description: "Stop running your accounting firm on scattered files and manual reminders. SYSmoAI builds client file OS, deadline calendars, billing trackers, and compliance workflows.",
  alternates: { canonical: "https://sysmoai.com/services/accounting" },
  openGraph: { title: "AI Systems for Accounting Firms | SYSmoAI", description: "Client file chaos and deadline stress fixed. AI systems for accounting firms in Bangladesh.", url: "https://sysmoai.com/services/accounting", type: "website" },
}

const WA_SVG = <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" /></svg>

const FAQS = [
  { q: "Do you integrate with accounting software like Tally or QuickBooks?", a: "We don't replace accounting software. We build the operational layer on top — client files, deadline tracking, and communication workflows." },
  { q: "Can you handle document collection from clients?", a: "Yes. We build structured document request workflows with automated follow-up reminders so you stop chasing clients manually." },
  { q: "Is client data kept secure?", a: "We build on Google Workspace or Notion with access controls. Each client's files are visible only to authorised team members." },
  { q: "What about compliance deadline reminders?", a: "We build a deadline calendar with automated internal reminders — tax submissions, audit dates, regulatory filings — so nothing is missed." },
  { q: "How long does setup take?", a: "An audit takes 1–2 days. A full sprint takes 5 working days. You're operational within a week." },
]

export default function AccountingPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/40 border border-[#2563EB]/30 text-[#60A5FA] text-sm font-medium px-4 py-2 rounded-full mb-8">📊 For Accounting Firms</div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">Your clients&apos; files are scattered. Deadlines are in your head.</h1>
        <p className="text-lg text-[#94A3B8] mb-8 leading-relaxed">We build a client file OS, deadline calendar, and billing tracker — so your firm runs on systems, not memory and WhatsApp threads.</p>
        <a href={WA.accounting} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors">{WA_SVG} Start on WhatsApp</a>
      </section>

      <section className="px-6 py-16 max-w-[1000px] mx-auto">
        <h2 className="text-2xl font-bold mb-8">Pains We Fix</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["Client files scattered across email, WhatsApp, and shared drives with no structure", "Deadline chaos — tax and compliance dates tracked in memory or ad-hoc spreadsheets", "Billing and receivables unclear — who has paid, who owes, who is overdue", "Compliance reminders done manually — risking missed filings", "Client document collection is slow — you chase clients individually", "New staff can't find anything without asking the founder"].map(p => (
            <div key={p} className="flex items-start gap-3 bg-[#13131A] border border-[#1E1E2E] rounded-xl p-4"><span className="text-red-400 mt-0.5 flex-shrink-0">✗</span><span className="text-[#94A3B8] text-sm leading-relaxed">{p}</span></div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 bg-[#0D0D1A]">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl font-bold mb-8">What We Install</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Client File OS", desc: "Every client's documents, history, contacts, and engagement details in one structured Notion workspace — accessible instantly by any authorised team member." },
              { title: "Deadline Calendar", desc: "A shared compliance calendar with automatic internal reminders for tax submissions, audit dates, and regulatory deadlines — no deadline missed." },
              { title: "Billing Tracker", desc: "A live receivables dashboard showing every invoice, payment received, amount outstanding, and days overdue — for every client." },
              { title: "Secure Comms Workflow", desc: "A structured client communication system for sending and receiving sensitive documents — with confirmations and audit trails." },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2"><span className="text-[#25D366]">✓</span><h3 className="font-bold text-white">{title}</h3></div>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 max-w-[800px] mx-auto">
        <h2 className="text-2xl font-bold mb-8">Recommended Path</h2>
        <div className="flex flex-col gap-4">
          {[
            { step: "Start", name: "AI Profit Audit", price: "৳7,500–12,000 · 1–2 days", desc: "Find your biggest operational gap. Written report, full refund guarantee.", waKey: "audit" as const },
            { step: "Build", name: "Implementation Sprint", price: "৳25,000–50,000 · 5 days", desc: "Client file OS, deadline calendar, billing tracker, comms workflow — built and trained.", waKey: "sprint" as const },
            { step: "Maintain", name: "Monthly Retainer", price: "৳8,000–15,000/mo", desc: "Monthly improvements as your client base grows. Priority support.", waKey: "retainer" as const },
          ].map(({ step, name, price, desc, waKey }) => (
            <div key={name} className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6 flex flex-col sm:flex-row gap-4 items-start">
              <span className="text-[#2563EB]/40 font-black text-2xl font-mono flex-shrink-0 w-16">{step}</span>
              <div className="flex-1"><h3 className="font-bold text-white text-lg">{name}</h3><p className="text-[#60A5FA] text-sm mb-2">{price}</p><p className="text-[#94A3B8] text-sm leading-relaxed">{desc}</p></div>
              <a href={WA[waKey]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors flex-shrink-0">{WA_SVG} Start</a>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 max-w-[800px] mx-auto">
        <h2 className="text-2xl font-bold mb-8">FAQ</h2>
        <div className="flex flex-col gap-4">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group bg-[#13131A] border border-[#1E1E2E] rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-white hover:text-[#60A5FA] transition-colors list-none">{q}<span className="text-slate-500 group-open:rotate-180 transition-transform text-xl ml-4 flex-shrink-0">+</span></summary>
              <div className="px-5 pb-5 text-[#94A3B8] text-sm leading-relaxed">{a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 bg-[#1E3A8A] text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to stop running your firm from memory?</h2>
        <p className="text-white/70 mb-8 max-w-lg mx-auto">Book an Audit. Know your biggest bottleneck in 1–2 days.</p>
        <a href={WA.accounting} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl transition-colors">{WA_SVG} Start on WhatsApp</a>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": FAQS.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) }) }} />
    </div>
  )
}
