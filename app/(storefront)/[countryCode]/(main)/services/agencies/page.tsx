import { Metadata } from "next"
import { WA } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "AI Systems for Agencies | SYSmoAI",
  description: "Stop losing clients to delivery chaos. SYSmoAI builds AI-powered project pipelines, client portals, SOP wikis, and reporting automation for Bangladesh agencies.",
  alternates: { canonical: "https://sysmoai.com/services/agencies" },
  openGraph: { title: "AI Systems for Agencies | SYSmoAI", description: "Client delivery chaos fixed. AI systems for digital agencies in Bangladesh.", url: "https://sysmoai.com/services/agencies", type: "website" },
}

const WA_SVG = <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" /></svg>

const FAQS = [
  { q: "Do I need to switch tools?", a: "No. We build on Notion, Google Workspace, and what you already use. No forced migrations." },
  { q: "How long does the sprint take?", a: "5 working days for a standard agency system. Complex multi-team builds may run 7–10 days — always agreed upfront." },
  { q: "Can you train my whole team?", a: "Yes. Every sprint includes a team training session. We also provide written SOPs your team can follow without us." },
  { q: "What if clients need to access the system?", a: "We can build client-facing portals in Notion or other tools — client access is commonly included in agency systems." },
  { q: "What does the audit actually deliver?", a: "A written report identifying your biggest delivery bottleneck, a step-by-step fix plan, and an ROI estimate. Full refund if we find nothing actionable." },
]

export default function AgenciesPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/40 border border-[#2563EB]/30 text-[#60A5FA] text-sm font-medium px-4 py-2 rounded-full mb-8">🏢 For Agencies</div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">Your clients are growing. Your delivery system isn't.</h1>
        <p className="text-lg text-[#94A3B8] mb-8 leading-relaxed">We install AI-powered project pipelines, client portals, and reporting systems — so your agency delivers on time, every time.</p>
        <a href={WA.agencies} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors">{WA_SVG} Start on WhatsApp</a>
      </section>

      <section className="px-6 py-16 max-w-[1000px] mx-auto">
        <h2 className="text-2xl font-bold mb-8">Pains We Fix</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["Client delivery chaos — missed deadlines, unclear accountability", "Manual reporting — hours spent copying data into client updates", "Project visibility gaps — nobody knows where anything stands", "Onboarding inconsistency — every client gets a different experience", "SOP gaps — only the founder knows how things work", "Team communication overhead — too many WhatsApp threads, not enough clarity"].map(p => (
            <div key={p} className="flex items-start gap-3 bg-[#13131A] border border-[#1E1E2E] rounded-xl p-4">
              <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
              <span className="text-[#94A3B8] text-sm leading-relaxed">{p}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 bg-[#0D0D1A]">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl font-bold mb-8">What We Install</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Client Portal", desc: "A branded Notion workspace where clients track progress, view deliverables, and leave feedback — no more chasing updates by WhatsApp." },
              { title: "Project Pipeline", desc: "A live view of every active project, who owns each task, what's blocking, and what's due this week — in one place." },
              { title: "SOP Wiki", desc: "All your processes documented, structured, and searchable — so new team members onboard faster and work gets done right." },
              { title: "Reporting Automation", desc: "Client reports generated automatically from your project data — no more manual copy-paste every Friday." },
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
            { step: "Start", name: "AI Profit Audit", price: "৳7,500–12,000 · 1–2 days", desc: "We map your delivery process and find the bottleneck costing you the most. Written report, full refund guarantee.", waKey: "audit" as const },
            { step: "Build", name: "Implementation Sprint", price: "৳25,000–50,000 · 5 days", desc: "We build the full agency OS — client portal, pipeline, SOPs, reporting automation — with team training included.", waKey: "sprint" as const },
            { step: "Maintain", name: "Monthly Retainer", price: "৳8,000–15,000/mo", desc: "We keep improving your systems as you grow. Monthly improvements, priority support, performance report.", waKey: "retainer" as const },
          ].map(({ step, name, price, desc, waKey }) => (
            <div key={name} className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6 flex flex-col sm:flex-row gap-4 items-start">
              <span className="text-[#2563EB]/40 font-black text-2xl font-mono flex-shrink-0 w-16">{step}</span>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">{name}</h3>
                <p className="text-[#60A5FA] text-sm mb-2">{price}</p>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{desc}</p>
              </div>
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
        <h2 className="text-2xl font-bold mb-4">Ready to fix your delivery system?</h2>
        <p className="text-white/70 mb-8 max-w-lg mx-auto">Start with an Audit. Know your biggest problem in 1–2 days.</p>
        <a href={WA.agencies} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl transition-colors">{WA_SVG} Start on WhatsApp</a>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": FAQS.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) }) }} />
    </div>
  )
}
