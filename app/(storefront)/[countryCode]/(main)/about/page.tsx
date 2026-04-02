import { Metadata } from "next"
import { WA, EMAIL, COMPANY } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "About SYSmoAI | AI Systems for Bangladesh Businesses",
  description: "SYSmoAI was founded by Emon Hossain to build AI-powered operating systems for Bangladesh businesses. Human-in-the-loop. Proof-led. BD-native.",
  alternates: { canonical: "https://sysmoai.com/about" },
  openGraph: {
    title: "About SYSmoAI",
    description: "Founded by Emon Hossain to fix how Bangladesh businesses operate.",
    url: "https://sysmoai.com/about",
    type: "website",
  },
}

const WA_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" />
  </svg>
)

export default function AboutPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/40 border border-[#2563EB]/30 text-[#60A5FA] text-sm font-medium px-4 py-2 rounded-full mb-8">
          🇧🇩 Bangladesh-first AI systems
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">About SYSmoAI</h1>
        <p className="text-lg text-[#94A3B8] leading-relaxed">
          We were built to fix one thing: the way Bangladesh businesses run their operations.
        </p>
      </section>

      {/* Founder Story */}
      <section className="px-6 py-16 max-w-[800px] mx-auto">
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-[#1E3A8A] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">E</div>
            <div>
              <div className="font-bold text-white text-lg">{COMPANY.founder}</div>
              <div className="text-[#60A5FA] text-sm">{COMPANY.founderTitle}, SYSmoAI</div>
            </div>
          </div>
          <div className="space-y-5 text-[#94A3B8] leading-relaxed">
            <p>
              I started SYSmoAI after watching too many Bangladesh businesses run on WhatsApp threads, disconnected spreadsheets, and gut feeling. Not because they lacked intelligence — but because no one had built proper systems for them in their language, at their price point.
            </p>
            <p>
              The tools existed. Notion, Google Workspace, AI automations — they were all available. What was missing was someone to install them properly, train the team, and stay on to make sure they kept working.
            </p>
            <p>
              That&apos;s what SYSmoAI does. We diagnose your operational bottleneck, build the system, hand it over with training, and maintain it monthly. Nothing more, nothing less.
            </p>
            <p className="text-white font-medium">
              — Emon Hossain
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="px-6 py-16 max-w-[1000px] mx-auto">
        <h2 className="text-2xl font-bold mb-8">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: "🔧", title: "AI Systems", desc: "We build operational systems using Notion, Google Workspace, and AI — automations, dashboards, CRMs, and workflows tailored to your business." },
            { icon: "⚡", title: "Automation", desc: "We eliminate manual, repetitive work from your operations — lead follow-up, reporting, invoicing, reminders — so your team focuses on what matters." },
            { icon: "📊", title: "AI Workflows", desc: "We install AI into your existing tools and processes — not as hype, but as quiet infrastructure that makes decisions faster and errors rarer." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6 flex flex-col gap-3">
              <span className="text-3xl">{icon}</span>
              <h3 className="font-bold text-white text-lg">{title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What We Don't Do */}
      <section className="px-6 py-16 bg-[#0D0D1A]">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-2xl font-bold mb-8">What We Don&apos;t Do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "No tool selling", desc: "We don't have a product catalogue. We build systems on tools you already own or tools we recommend based on your situation." },
              { title: "No generic training", desc: "We don't run AI workshops or sell courses. Everything we deliver is specific to your business problem." },
              { title: "No hype", desc: "We don't promise 10x revenue or make guarantees we can't stand behind. We talk about specific outputs and realistic outcomes." },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-[#13131A] border border-red-900/20 rounded-xl p-5">
                <div className="text-red-400 font-bold mb-2">✕ {title}</div>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operating Principles */}
      <section className="px-6 py-16 max-w-[800px] mx-auto">
        <h2 className="text-2xl font-bold mb-8">How We Operate</h2>
        <div className="flex flex-col gap-5">
          {[
            { principle: "Human-in-the-loop", detail: "Every system we build keeps your team in control. AI assists decisions — it doesn't replace the human judgment that matters." },
            { principle: "BD-native", detail: "We work in Bangla and English. We understand how Bangladesh businesses actually operate — the informal culture, the payment flows, the communication style." },
            { principle: "Proof-led", detail: "We don't start sprints without an audit. We don't promise outcomes without a clear diagnosis. Every system we build starts with a documented problem." },
          ].map(({ principle, detail }, i) => (
            <div key={principle} className="flex gap-6 p-6 bg-[#13131A] border border-[#1E1E2E] rounded-xl">
              <span className="text-[#2563EB]/40 font-black text-3xl font-mono flex-shrink-0">0{i + 1}</span>
              <div>
                <h3 className="font-bold text-white text-lg mb-2">{principle}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Company Info */}
      <section className="px-6 py-16 max-w-[700px] mx-auto">
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Company Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "Company", value: COMPANY.fullName },
              { label: "Location", value: COMPANY.address },
              { label: "Email", value: EMAIL.accounts },
              { label: "Languages", value: "Bangla, English" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-white/40 text-xs uppercase tracking-wide">{label}</span>
                <span className="text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="px-6 py-16 bg-[#1E3A8A] text-center">
        <h2 className="text-2xl font-bold mb-4">Want to talk through your situation?</h2>
        <p className="text-white/70 mb-8 max-w-lg mx-auto">WhatsApp us. No sales pitch — just a straight conversation about your business and whether we can help.</p>
        <a href={WA.contact} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-bold px-8 py-4 rounded-xl transition-colors">
          {WA_SVG} Message Us on WhatsApp
        </a>
      </section>
    </div>
  )
}
