import FeaturedProducts from "@/features/storefront/modules/home/components/featured-products"
import { getCollectionsListByRegion } from "@/features/storefront/lib/data/collections"
import { getRegion } from "@/features/storefront/lib/data/regions"
import type { StoreCollection, StoreRegion } from "@/features/storefront/types/storefront"

const WHO_WE_HELP = [
  { emoji: "🎓", name: "Students", desc: "Access world-class AI tools at student-friendly prices" },
  { emoji: "💼", name: "Job Seekers", desc: "Stand out with AI-powered resumes and cover letters" },
  { emoji: "🖥️", name: "Freelancers", desc: "Work faster and win more clients with AI assistance" },
  { emoji: "🏢", name: "Agencies", desc: "Build full AI systems for your client deliveries" },
  { emoji: "🏪", name: "Business", desc: "Automate operations and scale with intelligent systems" },
  { emoji: "📦", name: "F-commerce", desc: "AI for product listing, customer service, and logistics" },
  { emoji: "🔬", name: "Researchers", desc: "Summarise, analyse and generate research content faster" },
];

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
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
        <span className="inline-flex items-center gap-1.5 bg-[#312E81] text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          🇧🇩 Made for Bangladesh
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold leading-tight max-w-4xl">
          AI Tools &amp; Systems<br className="hidden sm:block" /> for Bangladesh
        </h1>

        <p className="mt-6 text-lg text-[#94A3B8] max-w-2xl leading-relaxed">
          Premium AI subscriptions for students, freelancers and researchers.
          AI implementation services for agencies, businesses and F-commerce.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="/us/store"
            className="px-6 py-3 bg-[#6366F1] text-white font-semibold rounded-lg hover:bg-[#4F46E5] transition-colors duration-200"
          >
            Browse AI Tools →
          </a>
          <a
            href="https://wa.me/8801865385348?text=Hi%20SYSmoAI"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#20b85a] transition-colors duration-200"
          >
            💬 WhatsApp Us
          </a>
        </div>

        <p className="mt-8 text-sm text-[#94A3B8]">
          ⭐⭐⭐⭐⭐&nbsp;&nbsp;Trusted by 1,000+ customers
        </p>
      </section>

      {/* ── Section 2: Who We Help ── */}
      <section className="px-6 py-20 max-w-[1440px] mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Who We Help</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {WHO_WE_HELP.map(({ emoji, name, desc }) => (
            <div
              key={name}
              className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-5 flex flex-col gap-2 hover:border-[#6366F1]/50 transition-colors duration-200"
            >
              <span className="text-3xl">{emoji}</span>
              <span className="font-semibold text-white">{name}</span>
              <span className="text-xs text-[#94A3B8] leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: How It Works ── */}
      <section className="px-6 py-20 bg-[#13131A]">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* For the Shop */}
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-semibold text-[#6366F1] uppercase tracking-wide">For the Shop</h3>
              {[
                { step: "01", title: "Browse AI tools by category", desc: "Find the right AI subscription from our curated collection." },
                { step: "02", title: "Pay with bKash / Nagad / Card", desc: "Fast, secure payments with the methods you already use." },
                { step: "03", title: "Get instant access", desc: "Your credentials are delivered immediately after payment." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <span className="text-2xl font-bold text-[#6366F1]/40 w-10 flex-shrink-0">{step}</span>
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

      {/* ── Section 4: Final CTA ── */}
      <section className="bg-[#312E81] px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to start? Two ways to work with us.
        </h2>
        <p className="text-white/70 mb-10 text-lg">
          Pick the path that fits you best.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/us/store"
            className="px-8 py-4 bg-white text-[#312E81] font-bold rounded-lg hover:bg-white/90 transition-colors"
          >
            Shop AI Tools
          </a>
          <a
            href="https://wa.me/8801865385348?text=Hi%20SYSmoAI"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-[#25D366] text-white font-bold rounded-lg hover:bg-[#20b85a] transition-colors"
          >
            💬 Get a Service
          </a>
        </div>
      </section>

    </div>
  )
}
