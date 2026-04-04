import { Metadata } from "next"
import { WA } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "AI Systems for Coaching Businesses | SYSmoAI",
  description: "Stop losing leads to manual follow-up. SYSmoAI builds CRM, onboarding OS, content delivery, and payment tracking systems for Bangladesh coaching businesses.",
  alternates: { canonical: "https://sysmoai.com/services/coaching" },
  openGraph: { title: "AI Systems for Coaching Businesses | SYSmoAI", description: "Lead and onboarding chaos fixed. AI systems for coaching businesses in Bangladesh.", url: "https://sysmoai.com/services/coaching", type: "website" },
}

const WA_SVG = <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" /></svg>

const FAQS = [
  { q: "Can you build a student portal?", a: "Yes. We build Notion-based student portals where students access content, track their progress, and submit assignments." },
  { q: "How do we handle payment tracking?", a: "We build a payment tracker that records every student's enrolment, installments, due dates, and outstanding balances — visible at a glance." },
  { q: "What about WhatsApp follow-up automation?", a: "We set up structured follow-up sequences for leads who expressed interest but didn't enrol — with message templates and timing guides for your team." },
  { q: "Do you build landing pages or sales funnels?", a: "No. We focus on operational systems — CRM, onboarding, delivery, and payment tracking. We don't build marketing assets." },
  { q: "Can you handle batch onboarding for large cohorts?", a: "Yes. We build onboarding systems that scale to large cohorts without manual repetition." },
]

export default function CoachingPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/40 border border-[#2563EB]/30 text-[#60A5FA] text-sm font-medium px-4 py-2 rounded-full mb-8">🎓 For Coaching</div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">Leads are interested. You&apos;re just too busy to follow up.</h1>
        <p className="text-lg text-[#94A3B8] mb-8 leading-relaxed">We install a CRM, onboarding system, and content delivery OS — so your coaching business runs without you manually managing every student.</p>
        <a href={WA.coaching} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors">{WA_SVG} Start on WhatsApp</a>
      </section>

      <section className="px-6 py-16 max-w-[1000px] mx-auto">
        <h2 className="text-2xl font-bold mb-8">Pains We Fix</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["Leads not followed up — interested people lost because no one followed up in time", "Manual onboarding — welcome messages, access, and instructions sent one by one", "Content delivery chaos — modules shared in WhatsApp groups with no structure", "Payment tracking gaps — unclear who has paid, who owes, and who is overdue", "Student progress invisible — no way to see who is engaged and who is dropping off", "High founder dependency — only you know how things work"].map(p => (
            <div key={p} className="flex items-start gap-3 bg-[#13131A] border border-[#1E1E2E] rounded-xl p-4"><span className="text-red-400 mt-0.5 flex-shrink-0">✗</span><span className="text-[#94A3B8] text-sm leading-relaxed">{p}</span></div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 bg-[#0D0D1A]">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl font-bold mb-8">What We Install</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "CRM", desc: "A structured lead pipeline that tracks every enquiry, follow-up, and conversion — so no lead falls through the cracks." },
              { title: "Onboarding OS", desc: "Automated welcome sequence, access provisioning, and first-week checklist for every new student — consistent every time." },
              { title: "Content Delivery System", desc: "A structured Notion workspace where students access modules in order, track completion, and access resources." },
              { title: "Follow-up Automation", desc: "Structured WhatsApp follow-up sequences for warm leads, overdue payments, and students at risk of dropping." },
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
            { step: "Start", name: "AI Profit Audit", price: "৳7,500–12,000 · 1–2 days", desc: "Diagnose your biggest operational gap. Written report, full refund guarantee.", waKey: "audit" as const },
            { step: "Build", name: "Implementation Sprint", price: "৳25,000–50,000 · 5 days", desc: "CRM, onboarding OS, content delivery system, payment tracker — built and trained.", waKey: "sprint" as const },
            { step: "Maintain", name: "Monthly Retainer", price: "৳8,000–15,000/mo", desc: "Monthly improvements as your cohorts grow. Priority support included.", waKey: "retainer" as const },
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
        <h2 className="text-2xl font-bold mb-4">Ready to stop doing everything manually?</h2>
        <p className="text-white/70 mb-8 max-w-lg mx-auto">Start with an Audit. We find your biggest bottleneck in 1–2 days.</p>
        <a href={WA.coaching} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl transition-colors">{WA_SVG} Start on WhatsApp</a>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": FAQS.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) }) }} />
    </div>
  )
}
