import { Metadata } from "next"
import { WA, COMPANY } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "AI Systems for Bangladesh Businesses | SYSmoAI Services",
  description: "We build AI-powered operating systems for Bangladesh businesses. AI Profit Audit, Implementation Sprint, and Monthly Retainer — starting at ৳7,500.",
  alternates: { canonical: "https://sysmoai.com/services" },
  openGraph: {
    title: "AI Systems for Bangladesh Businesses | SYSmoAI",
    description: "We build AI-powered operating systems for Bangladesh businesses.",
    url: "https://sysmoai.com/services",
    type: "website",
  },
}

const SERVICES = [
  {
    id: "audit",
    name: "AI Profit Audit",
    price: "৳7,500–12,000",
    duration: "1–2 days",
    desc: "We diagnose your biggest operational bottleneck and deliver a written fix plan. ROI estimate included. Full refund if no insights found.",
    outcomes: ["Written bottleneck report", "Step-by-step fix plan", "ROI estimate", "Full refund guarantee"],
    waKey: "audit" as const,
    highlight: false,
  },
  {
    id: "sprint",
    name: "Implementation Sprint",
    price: "৳25,000–50,000",
    duration: "5 working days",
    desc: "We build your complete AI system — automations, workflows, and dashboards — fully tested and handed over with documentation.",
    outcomes: ["Full system built and tested", "Team training session", "30-day post-delivery support", "Scope locked in writing"],
    waKey: "sprint" as const,
    highlight: true,
  },
  {
    id: "retainer",
    name: "Monthly Retainer",
    price: "৳8,000–15,000/mo",
    duration: "Ongoing",
    desc: "We run and improve your AI systems every month. Your operations get faster and tighter every cycle.",
    outcomes: ["Monthly system improvements", "Priority WhatsApp support", "Monthly performance report", "Cancel anytime"],
    waKey: "retainer" as const,
    highlight: false,
  },
]

const INDUSTRIES = [
  { emoji: "🏢", name: "Agencies", slug: "agencies", pain: "Client delivery chaos, reporting gaps, onboarding inconsistency" },
  { emoji: "🛒", name: "E-commerce", slug: "ecommerce", pain: "Orders lost in inbox, COD leakage, stock confusion" },
  { emoji: "🎓", name: "Coaching", slug: "coaching", pain: "Leads not followed up, manual onboarding, weak payment tracking" },
  { emoji: "📊", name: "Accounting", slug: "accounting", pain: "Client files scattered, deadline chaos, billing unclear" },
  { emoji: "🏥", name: "Clinics", slug: "clinics", pain: "Appointment leakage, paper billing, staff accountability gaps" },
  { emoji: "📦", name: "Trading", slug: "trading", pain: "Stock in Excel, supplier comms scattered, no daily reporting" },
]

const FAQS = [
  { q: "What do you actually build?", a: "We build operational systems using Notion, Google Workspace, and AI tools — automations, dashboards, workflows, and CRMs. No custom code unless needed." },
  { q: "Do you work with businesses outside Dhaka?", a: "Yes. All our work is delivered remotely via WhatsApp, Google Meet, and shared workspaces. Location doesn't matter." },
  { q: "How do we pay?", a: "bKash, Nagad, Rocket, or bank transfer. 50% upfront, 50% on delivery for sprints. Audits are paid in full upfront." },
  { q: "What tools do you build on?", a: "Notion, Airtable, Zapier, Google Workspace, WhatsApp automation, and custom AI workflows. We build on what you already own when possible." },
  { q: "Is there a contract?", a: "Yes. Every engagement begins with a written scope document that you approve before we start. No surprises." },
]

const WA_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" />
  </svg>
)

export default function ServicesPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/40 border border-[#2563EB]/30 text-[#60A5FA] text-sm font-medium px-4 py-2 rounded-full mb-8">
          🇧🇩 Built for Bangladesh businesses
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
          AI Implementation.<br />Done For You.
        </h1>
        <p className="text-lg text-[#94A3B8] mb-8 leading-relaxed">
          We build AI-powered operating systems — Notion-based delivery, automation, and AI workflows. Built fast, maintained monthly.
        </p>
        <a href={WA.services} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg">
          {WA_SVG} Start on WhatsApp
        </a>
      </section>

      {/* Service Tiers */}
      <section className="px-6 py-16 max-w-[1200px] mx-auto">
        <p className="text-[#60A5FA] text-sm font-semibold uppercase tracking-widest text-center mb-3">Pricing</p>
        <h2 className="text-2xl font-bold text-center mb-12">Choose Your Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map(({ id, name, price, duration, desc, outcomes, waKey, highlight }) => (
            <div key={id} id={id}
              className={`rounded-2xl p-8 border flex flex-col gap-5 ${highlight ? "bg-[#0F1729] border-[#2563EB]/50 ring-1 ring-[#2563EB]/20" : "bg-[#13131A] border-[#1E1E2E]"}`}>
              {highlight && (
                <span className="text-xs font-bold uppercase tracking-widest text-[#60A5FA] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded-full w-fit">Most Popular</span>
              )}
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
                <p className="text-[#60A5FA] text-2xl font-bold">{price}</p>
                <p className="text-slate-500 text-sm">{duration}</p>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              <ul className="flex flex-col gap-2 flex-1">
                {outcomes.map(o => (
                  <li key={o} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-[#25D366] mt-0.5 flex-shrink-0">✓</span>{o}
                  </li>
                ))}
              </ul>
              <a href={WA[waKey]} target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-colors ${highlight ? "bg-[#25D366] hover:bg-[#20b85a] text-white" : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"}`}>
                {WA_SVG} Get Started
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp mid-CTA */}
      <section className="px-6 py-16 text-center bg-[#0D0D1A]">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-2xl font-bold mb-4">Not sure which service fits?</h2>
          <p className="text-slate-400 mb-8">Tell us your situation on WhatsApp. We&apos;ll tell you exactly what you need in plain language.</p>
          <a href={WA.services} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl transition-colors">
            {WA_SVG} Ask on WhatsApp
          </a>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="px-6 py-20 max-w-[1200px] mx-auto">
        <p className="text-[#60A5FA] text-sm font-semibold uppercase tracking-widest text-center mb-3">Industries</p>
        <h2 className="text-2xl font-bold text-center mb-12">Who We Serve</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {INDUSTRIES.map(({ emoji, name, slug, pain }) => (
            <a key={slug} href={`/bd/services/${slug}`}
              className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-5 flex flex-col gap-2 hover:border-[#2563EB]/50 hover:bg-[#0F1729] transition-all group">
              <span className="text-3xl">{emoji}</span>
              <span className="font-bold text-white text-lg">{name}</span>
              <span className="text-sm text-[#94A3B8] leading-relaxed">{pain}</span>
              <span className="text-[#60A5FA] text-sm mt-1 group-hover:underline">See solutions →</span>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 max-w-[800px] mx-auto">
        <p className="text-[#60A5FA] text-sm font-semibold uppercase tracking-widest text-center mb-3">FAQ</p>
        <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group bg-[#13131A] border border-[#1E1E2E] rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-white hover:text-[#60A5FA] transition-colors list-none">
                {q}
                <span className="text-slate-500 group-open:rotate-180 transition-transform text-xl ml-4 flex-shrink-0">+</span>
              </summary>
              <div className="px-6 pb-6 text-[#94A3B8] text-sm leading-relaxed">{a}</div>
            </details>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Service",
        "name": "AI Systems Implementation",
        "provider": { "@type": "Organization", "name": "SYSmoAI", "url": "https://sysmoai.com" },
        "areaServed": "BD",
        "description": "We build AI-powered operating systems for Bangladesh businesses.",
      })}} />
    </div>
  )
}
