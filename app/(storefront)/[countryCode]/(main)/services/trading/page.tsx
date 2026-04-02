import { Metadata } from "next"
import { WA } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "AI Systems for Trading Businesses | SYSmoAI",
  description: "Stop tracking inventory in Excel. SYSmoAI builds inventory OS, stock movement tracking, supplier/customer management, and weekly reporting for Bangladesh trading businesses.",
  alternates: { canonical: "https://sysmoai.com/services/trading" },
  openGraph: { title: "AI Systems for Trading Businesses | SYSmoAI", description: "Inventory and supplier chaos fixed. AI systems for trading businesses in Bangladesh.", url: "https://sysmoai.com/services/trading", type: "website" },
}

const WA_SVG = <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" /></svg>

const FAQS = [
  { q: "Do you replace our existing accounting software?", a: "No. We build the operational inventory and communication layer. Accounting software integration can be discussed case by case." },
  { q: "Can you handle multiple product categories?", a: "Yes. We design inventory systems for multi-category trading businesses — with filtering and search by category, SKU, supplier, or warehouse." },
  { q: "What about supplier credit tracking?", a: "Yes. We build supplier ledgers that track credit extended, payments made, and outstanding balances for each supplier." },
  { q: "Can sales staff check stock on mobile?", a: "Yes. Notion-based systems are fully mobile-accessible. Sales staff can check live stock on their phone before quoting." },
  { q: "How long does a sprint take?", a: "5 working days. You get a fully operational inventory and reporting system with team training." },
]

export default function TradingPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/40 border border-[#2563EB]/30 text-[#60A5FA] text-sm font-medium px-4 py-2 rounded-full mb-8">📦 For Trading</div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">Your stock is in Excel. Your sales team can&apos;t see it.</h1>
        <p className="text-lg text-[#94A3B8] mb-8 leading-relaxed">We build a live inventory OS, stock movement tracker, and weekly reporting dashboard — so your whole team works from the same numbers.</p>
        <a href={WA.trading} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors">{WA_SVG} Start on WhatsApp</a>
      </section>

      <section className="px-6 py-16 max-w-[1000px] mx-auto">
        <h2 className="text-2xl font-bold mb-8">Pains We Fix</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["Stock tracked in Excel — outdated the moment a sale is made", "Supplier comms scattered across WhatsApp with no order history", "Customer comms informal — no record of what was promised or delivered", "Sales can't see inventory — quoting from memory or calling the warehouse", "No weekly report — management doesn't know what moved and what didn't", "Pricing inconsistency — different team members quoting different prices"].map(p => (
            <div key={p} className="flex items-start gap-3 bg-[#13131A] border border-[#1E1E2E] rounded-xl p-4"><span className="text-red-400 mt-0.5 flex-shrink-0">✗</span><span className="text-[#94A3B8] text-sm leading-relaxed">{p}</span></div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 bg-[#0D0D1A]">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl font-bold mb-8">What We Install</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Inventory OS", desc: "A live database of every SKU, current stock level, reorder point, and warehouse location — updated in real time as stock moves." },
              { title: "Stock Movement Tracker", desc: "Every inbound shipment and outbound sale recorded systematically — so you can trace any stock discrepancy back to its source." },
              { title: "Supplier & Customer OS", desc: "Structured records for every supplier and customer — contact details, order history, credit terms, and outstanding balances." },
              { title: "Weekly Reporting Dashboard", desc: "A weekly summary of what sold, what moved, what's low, and what's outstanding — prepared automatically from your live data." },
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
            { step: "Build", name: "Implementation Sprint", price: "৳25,000–50,000 · 5 days", desc: "Inventory OS, stock movement tracker, supplier/customer OS, weekly reporting — built and trained.", waKey: "sprint" as const },
            { step: "Maintain", name: "Monthly Retainer", price: "৳8,000–15,000/mo", desc: "Monthly improvements as your product range and volume grows.", waKey: "retainer" as const },
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
        <h2 className="text-2xl font-bold mb-4">Ready to get your inventory under control?</h2>
        <p className="text-white/70 mb-8 max-w-lg mx-auto">Start with an Audit. Know your biggest gap in 1–2 days.</p>
        <a href={WA.trading} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl transition-colors">{WA_SVG} Start on WhatsApp</a>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": FAQS.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) }) }} />
    </div>
  )
}
