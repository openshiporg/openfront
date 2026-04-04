import { WA, EMAIL, COMPANY } from "@/lib/constants/contact"

const INDUSTRIES = [
  { emoji: "🏢", name: "Agencies", slug: "agencies", pain: "Deliver projects on time, every time" },
  { emoji: "🛒", name: "E-commerce", slug: "ecommerce", pain: "Stop losing orders in your inbox" },
  { emoji: "🎓", name: "Coaching", slug: "coaching", pain: "Automate lead follow-up and onboarding" },
  { emoji: "📊", name: "Accounting", slug: "accounting", pain: "Kill deadline chaos and client confusion" },
  { emoji: "🏥", name: "Clinics", slug: "clinics", pain: "Fix appointment leakage and paper billing" },
  { emoji: "📦", name: "Trading", slug: "trading", pain: "Track inventory without spreadsheet chaos" },
]

const STEPS = [
  { num: "01", title: "WhatsApp us your bottleneck", desc: "Tell us what's costing you time or money. A 2-line message is enough." },
  { num: "02", title: "We diagnose with a structured audit", desc: "We map your current process, find the breaks, and present a clear fix plan." },
  { num: "03", title: "We build the system on your existing tools", desc: "Notion, WhatsApp, Google Sheets — we work with what you already have." },
  { num: "04", title: "Your team runs it. We maintain it monthly.", desc: "Full documentation and training included. We stay on call for tuning." },
]

const SERVICES = [
  {
    id: "audit",
    name: "AI Profit Audit",
    price: "৳7,500–12,000",
    duration: "1–2 days",
    desc: "We diagnose your biggest operational bottleneck and deliver a written fix plan with ROI estimate.",
    outcomes: ["Written bottleneck report", "Fix plan with step-by-step actions", "ROI estimate", "Full refund if no insights"],
    waKey: "audit" as const,
    highlight: false,
  },
  {
    id: "sprint",
    name: "Implementation Sprint",
    price: "৳25,000–50,000",
    duration: "5 working days",
    desc: "We build the complete AI system — automations, workflows, dashboards — and hand it over fully trained.",
    outcomes: ["Full system built and tested", "Team training session", "30-day support included", "Scope locked in writing"],
    waKey: "sprint" as const,
    highlight: true,
  },
  {
    id: "retainer",
    name: "Monthly Retainer",
    price: "৳8,000–15,000/mo",
    duration: "Ongoing",
    desc: "We run and improve your AI systems month to month. Your operations get faster every cycle.",
    outcomes: ["Monthly system improvements", "Priority WhatsApp support", "Monthly report", "Cancel anytime"],
    waKey: "retainer" as const,
    highlight: false,
  },
]

const FAQS = [
  { q: "Do I need technical knowledge?", a: "No. We speak in plain Bangla and English, not tech jargon. You describe the problem, we handle everything technical." },
  { q: "What tools do you build on?", a: "Notion, Google Workspace, WhatsApp automation, Airtable, Zapier, and custom AI workflows — using what you already own when possible." },
  { q: "How do I pay?", a: "bKash, Nagad, Rocket, or bank transfer. 50% upfront, 50% on delivery for sprints. Audits are paid in full upfront." },
  { q: "What if the audit finds nothing useful?", a: "Full refund. We've never given one — but the guarantee exists because we stand behind our diagnostic quality." },
  { q: "How long does a sprint take?", a: "5 working days for a standard sprint. Complex builds may run 7–10 days — always agreed in writing before we start." },
]

const WA_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" />
  </svg>
)

export async function HomePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  return (
    <div className="bg-[#0A0A0F] text-white">

      {/* ── 1. Hero ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#2563EB]/8 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/40 border border-[#2563EB]/30 text-[#60A5FA] text-sm font-medium px-4 py-2 rounded-full mb-8">
          🇧🇩 AI systems for Bangladesh businesses
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight max-w-4xl mb-6">
          We install AI-powered operating systems for Bangladesh businesses.
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Notion-based delivery · automation · AI workflows. Built fast. Maintained monthly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a
            href={WA.hero}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#25D366]/20 hover:-translate-y-0.5"
          >
            {WA_SVG}
            Start on WhatsApp
          </a>
          <a
            href="/bd/services"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all"
          >
            View Services →
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-slate-500 text-sm">
          {["Bangla support ✓", "bKash / Nagad ✓", "Reply within 24 hrs ✓", "Scope locked in writing ✓"].map(t => (
            <span key={t} className="flex items-center gap-2 text-[#60A5FA]/70">{t}</span>
          ))}
        </div>
      </section>

      {/* ── 2. Who We Help ── */}
      <section className="px-6 py-20 max-w-[1200px] mx-auto">
        <p className="text-[#60A5FA] text-sm font-semibold uppercase tracking-widest text-center mb-3">Industries We Serve</p>
        <h2 className="text-3xl font-bold text-center mb-12">Who We Help</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {INDUSTRIES.map(({ emoji, name, slug, pain }) => (
            <a
              key={slug}
              href={`/bd/services/${slug}`}
              className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-5 flex flex-col gap-2 hover:border-[#2563EB]/50 hover:bg-[#0F1729] transition-all group"
            >
              <span className="text-3xl">{emoji}</span>
              <span className="font-bold text-white text-lg">{name}</span>
              <span className="text-sm text-[#94A3B8] leading-relaxed">{pain}</span>
              <span className="text-[#60A5FA] text-sm mt-2 group-hover:underline">See how we help →</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── 3. How It Works ── */}
      <section className="px-6 py-20 bg-[#0D0D1A]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[#60A5FA] text-sm font-semibold uppercase tracking-widest text-center mb-3">Process</p>
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col gap-4">
                <span className="text-4xl font-black text-[#2563EB]/25 font-mono">{num}</span>
                <h3 className="font-bold text-white text-lg leading-snug">{title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Service Ladder ── */}
      <section id="services" className="px-6 py-20 max-w-[1200px] mx-auto">
        <p className="text-[#60A5FA] text-sm font-semibold uppercase tracking-widest text-center mb-3">Pricing</p>
        <h2 className="text-3xl font-bold text-center mb-4">Service Ladder</h2>
        <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">Start with an Audit. Build with a Sprint. Scale with a Retainer.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map(({ id, name, price, duration, desc, outcomes, waKey, highlight }) => (
            <div
              key={id}
              id={id}
              className={`rounded-2xl p-8 border flex flex-col gap-5 ${
                highlight
                  ? "bg-[#0F1729] border-[#2563EB]/50 ring-1 ring-[#2563EB]/20"
                  : "bg-[#13131A] border-[#1E1E2E]"
              }`}
            >
              {highlight && (
                <span className="text-xs font-bold uppercase tracking-widest text-[#60A5FA] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded-full w-fit">
                  Most Popular
                </span>
              )}
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
                <p className="text-[#60A5FA] text-2xl font-bold">{price}</p>
                <p className="text-slate-500 text-sm">{duration}</p>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              <ul className="flex flex-col gap-2">
                {outcomes.map(o => (
                  <li key={o} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-[#25D366] mt-0.5 flex-shrink-0">✓</span>
                    {o}
                  </li>
                ))}
              </ul>
              <a
                href={WA[waKey]}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-auto flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-colors ${
                  highlight
                    ? "bg-[#25D366] hover:bg-[#20b85a] text-white"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                }`}
              >
                {highlight && WA_SVG}
                Start on WhatsApp
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Proof Block ── */}
      <section className="px-6 py-16 bg-[#0D0D1A]">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-10">
            <div className="text-5xl mb-6">💡</div>
            <blockquote className="text-xl md:text-2xl font-semibold text-white leading-relaxed mb-6">
              "Delivered ৳1 Lakh+ in operational value for our first client. They paid ৳7,500."
            </blockquote>
            <p className="text-slate-500 text-sm">
              An AI Profit Audit that identified three broken workflows — fixed in under 48 hours.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. Trust Strip ── */}
      <section className="px-6 py-14">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: "🇧🇩", text: "Full Bangla support" },
              { icon: "💰", text: "bKash & Nagad accepted" },
              { icon: "⚡", text: "WhatsApp reply within 24 hrs" },
              { icon: "📝", text: "Scope locked in writing" },
              { icon: "💯", text: "Full refund if audit has no insights" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 text-center p-4 rounded-xl bg-[#13131A] border border-[#1E1E2E]">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm text-[#94A3B8] leading-snug">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ── */}
      <section className="px-6 py-20 max-w-[800px] mx-auto">
        <p className="text-[#60A5FA] text-sm font-semibold uppercase tracking-widest text-center mb-3">FAQ</p>
        <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
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

      {/* ── 8. Final CTA ── */}
      <section className="bg-[#1E3A8A] px-6 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-2xl mx-auto leading-snug">
          Ready to stop running your business on WhatsApp and spreadsheets?
        </h2>
        <p className="text-white/70 mb-10 text-lg max-w-xl mx-auto">
          Book an AI Profit Audit. We diagnose your biggest bottleneck in 1–2 days. Full refund if we find nothing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={WA.hero}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg"
          >
            {WA_SVG}
            Start on WhatsApp
          </a>
          <a
            href="/bd/contact"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            View Contact Details
          </a>
        </div>
      </section>

      {/* LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "SYSmoAI",
            "url": "https://sysmoai.com",
            "telephone": "+8801711638693",
            "email": "accounts@sysmoai.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Flat 12-1/C, Swapno Nagar, Pallabi",
              "addressLocality": "Dhaka",
              "postalCode": "1216",
              "addressCountry": "BD"
            }
          })
        }}
      />
    </div>
  )
}
