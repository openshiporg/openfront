import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notion AI OS — Business Operating System | SYSmoAI",
  description: "We build complete operating systems in Notion — CRM, project management, SOPs, dashboards, team wikis — all connected, all automated for Bangladesh businesses.",
  alternates: { canonical: "https://sysmoai.com/services/notion-os" },
  openGraph: {
    title: "Notion AI OS — Business Operating System | SYSmoAI",
    description: "Complete business operating system in Notion. CRM, projects, SOPs, dashboards — all connected.",
    url: "https://sysmoai.com/services/notion-os",
    type: "website",
  },
}

const WA_LINK = "https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20need%20a%20Notion%20OS%20for%20my%20business"

const WHAT_YOU_GET = [
  {
    icon: "👥",
    title: "CRM & Sales Pipeline",
    desc: "Track every lead, deal, and customer in one place. Never lose a follow-up again.",
  },
  {
    icon: "📋",
    title: "Project Delivery System",
    desc: "From brief to delivery, nothing falls through the cracks. Full visibility for you and your team.",
  },
  {
    icon: "📖",
    title: "SOP Wiki",
    desc: "Every process documented and searchable. New team members onboard in hours, not weeks.",
  },
  {
    icon: "📊",
    title: "Financial Dashboard",
    desc: "Revenue, expenses, and profit at a glance. Know your numbers without opening a spreadsheet.",
  },
  {
    icon: "✅",
    title: "Team Task System",
    desc: "Clear ownership, deadlines, and accountability across every project and department.",
  },
  {
    icon: "🤖",
    title: "AI Integration",
    desc: "Notion AI plus custom automations built in. Reduce manual work from day one.",
  },
]

const PROCESS = [
  { step: "01", label: "Audit Current Tools", desc: "We review what you already use and document what is working versus what is causing friction." },
  { step: "02", label: "Design OS Architecture", desc: "We design the complete information architecture — databases, relations, views — before building anything." },
  { step: "03", label: "Build in Notion", desc: "We build the entire system in your Notion workspace, connecting all modules into one operating system." },
  { step: "04", label: "Train Your Team", desc: "Live training session for your team — practical, not theoretical. Everyone leaves knowing how to use the system." },
  { step: "05", label: "Monthly Support", desc: "Ongoing maintenance and improvements as your business evolves. Available to upgrade and expand your OS." },
]

export default function NotionOSPage() {
  return (
    <main className="bg-[#0A0A0F] text-[#E8E8F0] min-h-screen">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Built in Notion · Powered by AI
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
          Notion AI OS —<br className="hidden sm:block" /> Your Business Operating System
        </h1>
        <p className="text-lg text-[#8888AA] max-w-2xl mx-auto leading-relaxed mb-8">
          We build complete operating systems in Notion — CRM, project management, SOPs, dashboards, team wikis — all connected, all automated.
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
          Ask About Notion OS
        </a>
      </section>

      {/* What You Get */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">What You Get</h2>
        <p className="text-center text-[#8888AA] mb-12">Six interconnected modules — one unified system</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHAT_YOU_GET.map((item) => (
            <div key={item.title} className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[#8888AA] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Process */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">Our Process</h2>
        <p className="text-center text-[#8888AA] mb-12">From audit to live operating system — a structured five-step approach</p>
        <div className="space-y-4">
          {PROCESS.map((p) => (
            <div key={p.step} className="flex gap-6 bg-[#111118] border border-[#1E1E2E] rounded-xl px-7 py-6 items-start">
              <div className="text-2xl font-black text-purple-500/30 flex-shrink-0 w-10">{p.step}</div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">{p.label}</h3>
                <p className="text-sm text-[#8888AA] leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Pricing</h2>
          <p className="text-[#8888AA] mb-6 leading-relaxed">
            Full OS build from <span className="text-white font-semibold">BDT 50,000</span>. Monthly maintenance from <span className="text-white font-semibold">BDT 15,000/mo</span>.
          </p>
          <p className="text-sm text-[#8888AA] mb-8">
            Pricing depends on the number of modules, database complexity, and team size. We will scope it exactly during our first call.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
          >
            Get a Notion OS Quote
          </a>
        </div>
      </section>

    </main>
  )
}
