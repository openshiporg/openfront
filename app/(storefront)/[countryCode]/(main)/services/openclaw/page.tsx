import { Metadata } from "next"

export const metadata: Metadata = {
  title: "OpenClaw — Local AI Setup | SYSmoAI",
  description: "AI that runs on your own machine. We set up local AI execution on your hardware — private, fast, no API costs. For businesses that need privacy.",
  alternates: { canonical: "https://sysmoai.com/services/openclaw" },
  openGraph: {
    title: "OpenClaw — Local AI Setup | SYSmoAI",
    description: "Local AI execution on your own hardware. Private, fast, no per-token billing.",
    url: "https://sysmoai.com/services/openclaw",
    type: "website",
  },
}

const WA_LINK = "https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20want%20to%20learn%20about%20OpenClaw%20local%20AI"

const REASONS = [
  {
    icon: "🔒",
    title: "Data Privacy",
    desc: "Your business data never leaves your machine. No cloud uploads, no third-party access, no data sovereignty concerns.",
  },
  {
    icon: "💰",
    title: "No API Costs",
    desc: "Run AI locally with no per-token billing. After setup, the cost is zero — regardless of how much you use it.",
  },
  {
    icon: "📡",
    title: "Offline Capable",
    desc: "Works without internet after setup. Your AI tools remain available even if your connection drops.",
  },
  {
    icon: "⚙️",
    title: "Full Control",
    desc: "You own the model, the data, and the output. No vendor lock-in, no terms-of-service changes affecting your operations.",
  },
]

const BEST_FOR = [
  "Accounting firms handling client financial data",
  "Law firms with confidential case information",
  "Healthcare clinics with patient records",
  "Businesses with sensitive client contracts",
  "Companies with regulatory compliance requirements",
  "Any business that cannot afford data leaks",
]

const WHAT_WE_SETUP = [
  { title: "Local Model Installation", desc: "We install and configure the right open-source model for your hardware and use case." },
  { title: "Notion Integration", desc: "Connect the local AI to your Notion workspace for document processing and generation." },
  { title: "Custom Prompts", desc: "We write custom system prompts tuned to your business processes and communication style." },
  { title: "Team Training", desc: "We train your team on how to use the system effectively — practical, hands-on session." },
]

export default function OpenClawPage() {
  return (
    <main className="bg-[#0A0A0F] text-[#E8E8F0] min-h-screen">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          100% On-Premise — No Cloud Required
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
          OpenClaw — AI That Runs<br className="hidden sm:block" /> On Your Own Machine
        </h1>
        <p className="text-lg text-[#8888AA] max-w-2xl mx-auto leading-relaxed mb-8">
          For businesses that need AI power without sending data to the cloud. We set up local AI execution on your hardware — private, fast, no API costs.
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
          Ask About OpenClaw
        </a>
      </section>

      {/* Why OpenClaw */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">Why OpenClaw</h2>
        <p className="text-center text-[#8888AA] mb-12">Four reasons privacy-first businesses choose local AI</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {REASONS.map((r) => (
            <div key={r.title} className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-7 hover:border-green-500/30 transition-colors">
              <div className="text-3xl mb-4">{r.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{r.title}</h3>
              <p className="text-[#8888AA] text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Best For */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">Best For</h2>
        <p className="text-center text-[#8888AA] mb-10">Industries where data privacy is non-negotiable</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BEST_FOR.map((item) => (
            <div key={item} className="flex items-start gap-3 bg-[#111118] border border-[#1E1E2E] rounded-xl px-5 py-4">
              <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
              <span className="text-[#E8E8F0] text-sm">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* What We Set Up */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">What We Set Up</h2>
        <p className="text-center text-[#8888AA] mb-12">Everything included in the OpenClaw setup</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {WHAT_WE_SETUP.map((item) => (
            <div key={item.title} className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[#8888AA] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Pricing</h2>
          <p className="text-[#8888AA] mb-6 leading-relaxed">
            Setup starts at <span className="text-white font-semibold">BDT 40,000</span>. Includes training and 30-day support.
          </p>
          <p className="text-sm text-[#8888AA] mb-8">
            After the setup fee, your running cost is zero — no monthly API bills. Hardware requirements vary; we will assess your existing machines during our first call.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
          >
            Get Started with OpenClaw
          </a>
        </div>
      </section>

    </main>
  )
}
