import { Metadata } from "next"

export const metadata: Metadata = {
  title: "International AI Services — USD Pricing | SYSmoAI",
  description: "AI systems for international businesses. Everything we build for Bangladesh — now available worldwide. USD pricing, remote delivery via WhatsApp and Zoom.",
  alternates: { canonical: "https://sysmoai.com/services/international" },
  openGraph: {
    title: "International AI Services — USD Pricing | SYSmoAI",
    description: "SYSmoAI for international clients. Same systems, same quality, USD pricing.",
    url: "https://sysmoai.com/services/international",
    type: "website",
  },
}

const WA_LINK = "https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20am%20an%20international%20client%20interested%20in%20your%20services"

const SERVICES = [
  {
    name: "AI Profit Audit",
    price: "$200–400",
    duration: "3–5 days",
    desc: "We diagnose your biggest operational bottleneck and deliver a written fix plan with ROI estimate.",
  },
  {
    name: "Implementation Sprint",
    price: "$500–1,500",
    duration: "2–4 weeks",
    desc: "We build your complete AI system — automations, workflows, dashboards — tested and handed over with documentation.",
  },
  {
    name: "Monthly Retainer",
    price: "$250–750/month",
    duration: "Ongoing",
    desc: "We run and improve your AI systems every month. Continuous optimisation, priority support.",
  },
  {
    name: "NemoClaw AI Agents",
    price: "Custom quote",
    duration: "Varies",
    desc: "Claude-powered AI agents for your business processes. MCP integrations, human-in-the-loop controls.",
  },
  {
    name: "Notion OS Build",
    price: "Custom quote",
    duration: "Varies",
    desc: "Complete business operating system in Notion — CRM, projects, SOPs, dashboards, all connected.",
  },
]

const HOW_WE_WORK = [
  {
    icon: "💬",
    title: "WhatsApp & Zoom",
    desc: "All communication via WhatsApp for async and Zoom for scheduled calls. No rigid meeting schedules.",
  },
  {
    icon: "📋",
    title: "Async Notion Workspace",
    desc: "You get access to a shared Notion workspace where you can see all progress, documents, and deliverables.",
  },
  {
    icon: "📊",
    title: "Weekly Progress Reports",
    desc: "Written weekly updates so you always know what was done, what is next, and what needs your input.",
  },
]

const PAYMENT = [
  "Wise (TransferWise) — preferred",
  "Payoneer",
  "International bank transfer (SWIFT)",
]

export default function InternationalPage() {
  return (
    <main className="bg-[#0A0A0F] text-[#E8E8F0] min-h-screen">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          USD Pricing · Remote Delivery · Worldwide
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
          SYSmoAI for<br className="hidden sm:block" /> International Businesses
        </h1>
        <p className="text-lg text-[#8888AA] max-w-2xl mx-auto leading-relaxed mb-8">
          Everything we build for Bangladesh businesses — now available worldwide. Same systems, same quality, USD pricing.
        </p>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" />
          </svg>
          Contact Us
        </a>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">Services Available Internationally</h2>
        <p className="text-center text-[#8888AA] mb-12">All services available remotely, all priced in USD</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s) => (
            <div key={s.name} className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 hover:border-orange-500/30 transition-colors">
              <div className="text-2xl font-bold text-white mb-1">{s.price}</div>
              <div className="text-xs text-orange-400 font-medium mb-3">{s.duration}</div>
              <h3 className="text-base font-semibold text-white mb-2">{s.name}</h3>
              <p className="text-sm text-[#8888AA] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How We Work Remotely */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">How We Work Remotely</h2>
        <p className="text-center text-[#8888AA] mb-12">Structured async delivery — no timezone friction</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {HOW_WE_WORK.map((item) => (
            <div key={item.title} className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[#8888AA] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Payment Methods</h2>
          <p className="text-[#8888AA] mb-6">We accept international transfers through:</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {PAYMENT.map((p) => (
              <div key={p} className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-5 py-3 text-sm text-[#E8E8F0] font-medium">
                {p}
              </div>
            ))}
          </div>
          <p className="text-sm text-[#8888AA] mb-8">
            50% upfront, 50% on delivery for project work. Retainers billed monthly at the start of each cycle.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
          >
            Start the Conversation
          </a>
        </div>
      </section>

    </main>
  )
}
