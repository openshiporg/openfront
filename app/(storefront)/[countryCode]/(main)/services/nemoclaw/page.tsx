import { Metadata } from "next"

export const metadata: Metadata = {
  title: "NemoClaw — AI Agent Implementation | SYSmoAI",
  description: "We build and deploy Claude-powered AI agents that handle real business tasks — customer support, data processing, report generation, and workflow automation for Bangladesh businesses.",
  alternates: { canonical: "https://sysmoai.com/services/nemoclaw" },
  openGraph: {
    title: "NemoClaw — AI Agent Implementation | SYSmoAI",
    description: "Claude-powered AI agents for Bangladesh businesses. Custom agents, MCP integration, human-in-the-loop controls.",
    url: "https://sysmoai.com/services/nemoclaw",
    type: "website",
  },
}

const WA_LINK = "https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20want%20to%20learn%20about%20NemoClaw%20AI%20agents"

const FEATURES = [
  {
    title: "Custom AI Agent Design",
    desc: "We design agents specific to your business processes — not generic templates, but agents that understand your workflows.",
  },
  {
    title: "MCP Integration",
    desc: "Connect agents to your existing tools: Notion, WhatsApp Business, Google Workspace, and more via Model Context Protocol.",
  },
  {
    title: "Human-in-the-Loop",
    desc: "Every critical action requires your approval before execution. You stay in control at every step.",
  },
  {
    title: "Monitoring & Iteration",
    desc: "We track agent performance weekly and improve it continuously. Your agents get smarter over time.",
  },
]

const STEPS = [
  { step: "01", label: "Audit", desc: "We map your current workflows and identify where AI agents will have the most impact." },
  { step: "02", label: "Design", desc: "We design the agent architecture, tools, and approval flows specific to your needs." },
  { step: "03", label: "Build", desc: "We build and configure the agents using Anthropic Claude with MCP tool connections." },
  { step: "04", label: "Test", desc: "We run the agents through real business scenarios and edge cases before going live." },
  { step: "05", label: "Deploy", desc: "We deploy the agents to your environment and hand over full documentation." },
  { step: "06", label: "Monitor", desc: "We review agent performance weekly and iterate based on real usage data." },
]

export default function NemoClawPage() {
  return (
    <main className="bg-[#0A0A0F] text-[#E8E8F0] min-h-screen">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Powered by Anthropic Claude
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
          NemoClaw — AI Agents That Actually Work<br className="hidden sm:block" /> For Your Business
        </h1>
        <p className="text-lg text-[#8888AA] max-w-2xl mx-auto leading-relaxed mb-8">
          We build and deploy Claude-powered AI agents that handle real business tasks — customer support, data processing, report generation, workflow automation.
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
          Ask About NemoClaw
        </a>
      </section>

      {/* What NemoClaw Does */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">What NemoClaw Does</h2>
        <p className="text-center text-[#8888AA] mb-12">Four pillars of our AI agent implementation service</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-7 hover:border-blue-500/30 transition-colors">
              <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-[#8888AA] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">How It Works</h2>
        <p className="text-center text-[#8888AA] mb-12">A proven six-step process from audit to live agents</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div key={s.step} className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6">
              <div className="text-3xl font-black text-blue-500/20 mb-3">{s.step}</div>
              <h3 className="text-base font-semibold text-white mb-2">{s.label}</h3>
              <p className="text-sm text-[#8888AA] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Pricing</h2>
          <p className="text-[#8888AA] mb-6 leading-relaxed">
            Implementation starts at <span className="text-white font-semibold">BDT 60,000</span>. Monthly monitoring from <span className="text-white font-semibold">BDT 15,000/mo</span>.
          </p>
          <p className="text-sm text-[#8888AA] mb-8">
            Exact pricing depends on the number of agents, integrations required, and complexity. WhatsApp us for a custom quote — we respond within a few hours.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
          >
            Get a Custom Quote
          </a>
        </div>
      </section>

    </main>
  )
}
