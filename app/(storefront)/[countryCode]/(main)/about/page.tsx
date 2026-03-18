import { Metadata } from "next"
import { PHONE_DISPLAY } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "About Us | SYSmoAI",
  description: "Built in Bangladesh, for Bangladesh. Learn about SYSmoAI and our mission to bring AI tools and systems to every Bangladeshi business.",
}

export default function AboutPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Built in Bangladesh.<br />For Bangladesh.
        </h1>
        <p className="text-lg text-[#94A3B8]">
          We are on a mission to make world-class AI tools and systems accessible to every student, freelancer, and business in Bangladesh.
        </p>
      </section>

      {/* Founder */}
      <section className="px-6 py-16 max-w-[800px] mx-auto">
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-10">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg">
              E
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Emon Hossain</h2>
              <p className="text-[#6366F1] font-medium mb-4">Founder &amp; CEO, SYSmoAI Private Limited</p>
              <p className="text-[#94A3B8] leading-relaxed">
                "I started SYSmoAI because I saw a gap — businesses in Bangladesh were using AI tools without real systems behind them. They were paying for subscriptions they barely used, or trying to build AI workflows with no guidance. We fix that. We help people get real results from AI, not just access."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="px-6 py-16 max-w-[800px] mx-auto">
        <h2 className="text-2xl font-bold mb-8">What We Do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🛒",
              title: "AI Subscriptions",
              desc: "We sell premium AI tool subscriptions at Bangladesh-friendly prices, with local payment methods.",
            },
            {
              icon: "🏗️",
              title: "AI Systems",
              desc: "We build AI-powered operating systems for businesses — automations, workflows, and custom AI agents.",
            },
            {
              icon: "🌐",
              title: "Bilingual Support",
              desc: "We deliver everything in Bangla and English, so language is never a barrier.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6 flex flex-col gap-3">
              <span className="text-3xl">{icon}</span>
              <h3 className="font-bold text-white">{title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Company Info */}
      <section className="px-6 py-16 max-w-[800px] mx-auto">
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Company Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "Company", value: "SYSmoAI Private Limited" },
              { label: "Founded", value: "2026" },
              { label: "Location", value: "Dhaka, Bangladesh" },
              { label: "Email", value: "hello@sysmoai.com" },
              { label: "WhatsApp", value: PHONE_DISPLAY },
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

    </div>
  )
}
