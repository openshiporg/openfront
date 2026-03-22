import FeaturedProducts from "@/features/storefront/modules/home/components/featured-products"
import { getCollectionsListByRegion } from "@/features/storefront/lib/data/collections"
import { getRegion } from "@/features/storefront/lib/data/regions"
import type { StoreCollection, StoreRegion } from "@/features/storefront/types/storefront"
import { WA } from "@/lib/constants/contact"

const WHO_WE_HELP = [
  { emoji: "🎓", name: "Students", desc: "Access world-class AI tools at student-friendly prices" },
  { emoji: "💼", name: "Job Seekers", desc: "Stand out with AI-powered resumes and cover letters" },
  { emoji: "🖥️", name: "Freelancers", desc: "Work faster and win more clients with AI assistance" },
  { emoji: "🏢", name: "Agencies", desc: "Build full AI systems for your client deliveries" },
  { emoji: "🏪", name: "Business", desc: "Automate operations and scale with intelligent systems" },
  { emoji: "📦", name: "F-commerce", desc: "AI for product listing, customer service, and logistics" },
  { emoji: "🔬", name: "Researchers", desc: "Summarise, analyse and generate research content faster" },
]

export async function HomePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const region: StoreRegion | undefined = await getRegion(countryCode)
  const { collections }: { collections: StoreCollection[] } = region
    ? await getCollectionsListByRegion(0, 3, region.id)
    : { collections: [] }

  return (
    <div className="bg-[#0A0A0F] text-white">

      {/* ── Section 1: Hero ── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 overflow-hidden">
        
        {/* Background glow — brand blue */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#2563EB]/10 rounded-full blur-3xl" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/40 border border-[#2563EB]/30 text-[#60A5FA] text-sm font-medium px-4 py-2 rounded-full mb-8">
          🇧🇩 Bangladesh's AI Platform
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight max-w-4xl mb-6">
          The AI Platform
          <br />
          <span className="bg-gradient-to-r from-[#60A5FA] to-emerald-400 bg-clip-text text-transparent">
            Built for Bangladesh.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Premium AI tool subscriptions for students, freelancers and researchers. AI implementation services for agencies, businesses and F-commerce. Pay with bKash or Nagad.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a 
            href="/bd/store"
            className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:-translate-y-0.5"
          >
            Browse AI Tools →
          </a>
          <a 
            href={WA.hero}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
          >
            💬 Talk to an Expert
          </a>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-slate-500 text-sm">
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">⚡</span>
            Same-day delivery
          </span>
          <span className="hidden sm:block text-slate-700">·</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">🔒</span>
            Secure bKash &amp; Nagad
          </span>
          <span className="hidden sm:block text-slate-700">·</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">🇧🇩</span>
            Bangladesh-first pricing
          </span>
        </div>

      </section>

      {/* ── Section 2: Who We Help ── */}
      <section className="px-6 py-20 max-w-[1440px] mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Who We Help</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {WHO_WE_HELP.map(({ emoji, name, desc }) => {
            const href = ["Agencies", "Business", "F-commerce"].includes(name) ? "/bd/services" : "/bd/store"
            return (
              <a
                key={name}
                href={href}
                className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-5 flex flex-col gap-2 hover:border-[#2563EB] hover:bg-[#13131A] transition-all group cursor-pointer"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="font-semibold text-white">{name}</span>
                <span className="text-xs text-[#94A3B8] leading-relaxed">{desc}</span>
                <span className="text-[#60A5FA] text-sm mt-3 group-hover:underline">
                  Learn more →
                </span>
              </a>
            )
          })}
        </div>
      </section>

      {/* ── Section 3: How It Works ── */}
      <section className="px-6 py-20 bg-[#13131A]">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* For the Shop */}
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-semibold text-[#2563EB] uppercase tracking-wide">For the Shop</h3>
              {[
                { step: "01", title: "Browse AI tools by category", desc: "Find the right AI subscription from our curated collection." },
                { step: "02", title: "Pay with bKash / Nagad / Card", desc: "Fast, secure payments with the methods you already use." },
                { step: "03", title: "Get instant access", desc: "Your credentials are delivered immediately after payment." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <span className="text-2xl font-bold text-[#2563EB]/40 w-10 flex-shrink-0">{step}</span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="text-sm text-[#94A3B8] mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* For Services */}
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-semibold text-[#25D366] uppercase tracking-wide">For Services</h3>
              {[
                { step: "01", title: "Message us on WhatsApp", desc: "Tell us about your business challenge or AI goal." },
                { step: "02", title: "We diagnose your problem", desc: "Our team maps the right AI solution for your situation." },
                { step: "03", title: "We build your AI system", desc: "Full build and handover within 3–14 days." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <span className="text-2xl font-bold text-[#25D366]/40 w-10 flex-shrink-0">{step}</span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="text-sm text-[#94A3B8] mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products (if region exists) ── */}
      {region && collections.length > 0 && (
        <section className="px-6 py-16 max-w-[1440px] mx-auto">
          <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </section>
      )}

      {/* ── Section 4: Final CTA — brand System Blue ── */}
      <section className="bg-[#1E3A8A] px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to start? Two ways to work with us.
        </h2>
        <p className="text-white/70 mb-10 text-lg">
          Pick the path that fits you best.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <a 
            href="/bd/store"
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-xl text-lg hover:bg-slate-100 transition-colors"
          >
            🛒 Shop AI Tools
          </a>
          <a 
            href={WA.services}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            💬 Get a Service
          </a>
        </div>
      </section>

    </div>
  )
}
