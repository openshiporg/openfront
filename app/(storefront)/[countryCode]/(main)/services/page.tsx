import { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Implementation Services | SYSmoAI",
  description: "We build AI-powered operating systems for your business. Quick Win, Sprint, and Retainer service tiers for Bangladesh businesses.",
}

const WA_LINK = "https://wa.me/8801865385348?text=Hi%20SYSmoAI%2C%20I%20need%20a%20service"

const SERVICES = [
  {
    tier: "Quick Win",
    tagline: "Fix your biggest bottleneck in 3 days",
    price: "Starting from ৳7,500",
    bestFor: "Freelancers, small businesses",
    features: ["Diagnose top problem", "Build targeted AI fix", "Full handover in 3 days", "Full refund guarantee"],
    highlight: false,
  },
  {
    tier: "Sprint",
    tagline: "Full AI system built in 14 days",
    price: "Starting from ৳35,000",
    bestFor: "Agencies, growing businesses",
    features: ["Complete AI workflow", "Custom integrations", "Team training session", "14-day delivery"],
    highlight: true,
  },
  {
    tier: "Retainer",
    tagline: "Ongoing AI operations monthly",
    price: "Starting from ৳20,000/month",
    bestFor: "Established businesses",
    features: ["Monthly AI operations", "Continuous improvements", "Priority WhatsApp support", "Monthly reporting"],
    highlight: false,
  },
]

const HOW_IT_WORKS = [
  { step: "01", label: "WhatsApp Us", desc: "Message us your business challenge or goal." },
  { step: "02", label: "Diagnose", desc: "We map the right AI solution for your situation." },
  { step: "03", label: "Build", desc: "Our team builds and tests your AI system." },
  { step: "04", label: "Handover", desc: "Full documentation, training, and ongoing support." },
]

const FAQS = [
  { q: "How do I pay?", a: "bKash, Nagad, Rocket, or bank transfer. We accept all major Bangladesh payment methods." },
  { q: "What if it doesn't work?", a: "The Quick Win tier includes a full refund guarantee. If we can't fix your bottleneck, you pay nothing." },
  { q: "How fast will it be done?", a: "Quick Win = 3 days. Sprint = 14 days. Retainer = ongoing monthly work." },
  { q: "Do I need technical knowledge?", a: "No. We handle everything technical. You just describe the problem and we solve it." },
  { q: "What happens after handover?", a: "We provide 30 days of support after every project delivery, included at no extra charge." },
]

export default function ServicesPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          AI Implementation.<br />Done For You.
        </h1>
        <p className="text-lg text-[#94A3B8] mb-8">
          We build AI-powered operating systems for your business.
        </p>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-8 py-4 rounded-lg hover:bg-[#20b85a] transition-colors"
        >
          💬 Start on WhatsApp
        </a>
      </section>

      {/* Service Tiers */}
      <section className="px-6 py-16 max-w-[1200px] mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">Choose Your Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map(({ tier, tagline, price, bestFor, features, highlight }) => (
            <div
              key={tier}
              className={`rounded-2xl p-8 border flex flex-col gap-4 ${
                highlight
                  ? "bg-[#312E81] border-[#6366F1]"
                  : "bg-[#13131A] border-[#1E1E2E]"
              }`}
            >
              {highlight && (
                <span className="text-xs font-bold uppercase tracking-widest text-[#6366F1] bg-white/10 px-3 py-1 rounded-full w-fit">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold">{tier}</h3>
              <p className="text-[#94A3B8] text-sm">{tagline}</p>
              <p className="text-2xl font-bold text-white">{price}</p>
              <p className="text-xs text-[#94A3B8]">Best for: {bestFor}</p>
              <ul className="flex flex-col gap-2 mt-2">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <span className="text-[#25D366]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-auto text-center py-3 rounded-lg font-semibold transition-colors ${
                  highlight
                    ? "bg-white text-[#312E81] hover:bg-white/90"
                    : "bg-[#6366F1] text-white hover:bg-[#4F46E5]"
                }`}
              >
                💬 Get Started
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-[#13131A]">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, label, desc }) => (
              <div key={step} className="flex flex-col gap-2 text-center">
                <span className="text-3xl font-bold text-[#6366F1]/40 mx-auto">{step}</span>
                <span className="font-semibold text-white">{label}</span>
                <span className="text-xs text-[#94A3B8]">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 max-w-[800px] mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-6">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="border-b border-[#1E1E2E] pb-6">
              <p className="font-semibold text-white mb-2">{q}</p>
              <p className="text-[#94A3B8] text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 bg-[#312E81] text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-white/70 mb-8">Message us on WhatsApp and we'll respond within 2 hours.</p>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-8 py-4 rounded-lg hover:bg-[#20b85a] transition-colors"
        >
          💬 Message Us Now
        </a>
      </section>

    </div>
  )
}
