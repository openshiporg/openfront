import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Proof — Case Studies & Results | SYSmoAI",
  description: "Real work, real results. Case studies from SYSmoAI — Hayder Voice OS client delivery and the SYSmoAI CEO OS internal system.",
  alternates: { canonical: "https://sysmoai.com/proof" },
  openGraph: {
    title: "Proof — Case Studies & Results | SYSmoAI",
    description: "We show our work. Real deliveries, real systems — no fake testimonials.",
    url: "https://sysmoai.com/proof",
    type: "website",
  },
}

const WA_LINK = "https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20want%20to%20see%20more%20of%20your%20work"

export default function ProofPage() {
  return (
    <main className="bg-[#0A0A0F] text-[#E8E8F0] min-h-screen">

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          Real Work · No Fake Testimonials
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
          Proof — Real Results,<br className="hidden sm:block" /> Not Promises
        </h1>
        <p className="text-lg text-[#8888AA] max-w-2xl mx-auto">
          We show our work. Here is what we have actually built and delivered.
        </p>
      </section>

      {/* Case Studies */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-8">

          {/* Case Study 1 */}
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-[#1E1E2E] flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs font-semibold text-yellow-400 uppercase tracking-widest mb-1">Case Study 01</div>
                <h2 className="text-xl font-bold text-white">Hayder Voice OS</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Client Delivery
              </span>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <div className="text-xs text-[#8888AA] uppercase tracking-widest font-semibold mb-2">Client</div>
                  <p className="text-[#E8E8F0] text-sm leading-relaxed">Voice content creator based in Bangladesh</p>
                </div>
                <div>
                  <div className="text-xs text-[#8888AA] uppercase tracking-widest font-semibold mb-2">Challenge</div>
                  <p className="text-[#E8E8F0] text-sm leading-relaxed">No website, no content system, no SEO strategy — operating entirely without digital infrastructure</p>
                </div>
                <div>
                  <div className="text-xs text-[#8888AA] uppercase tracking-widest font-semibold mb-2">Result</div>
                  <p className="text-[#E8E8F0] text-sm leading-relaxed">First paid SYSmoAI client delivery. Website live, content pipeline operational.</p>
                </div>
              </div>
              <div className="mt-8 border-t border-[#1E1E2E] pt-6">
                <div className="text-xs text-[#8888AA] uppercase tracking-widest font-semibold mb-3">What We Built</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["Full website — designed, built, and deployed", "Notion Content OS — editorial calendar, idea capture, publishing workflow", "SEO strategy — keyword research, on-page structure, meta framework"].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 bg-[#0A0A0F] rounded-xl px-4 py-3">
                      <span className="text-yellow-400 mt-0.5 flex-shrink-0 text-sm">✓</span>
                      <span className="text-sm text-[#E8E8F0]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Case Study 2 */}
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-[#1E1E2E] flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs font-semibold text-yellow-400 uppercase tracking-widest mb-1">Case Study 02</div>
                <h2 className="text-xl font-bold text-white">SYSmoAI CEO OS</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Internal System
              </span>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <div className="text-xs text-[#8888AA] uppercase tracking-widest font-semibold mb-2">Project</div>
                  <p className="text-[#E8E8F0] text-sm leading-relaxed">Internal operating system for SYSmoAI — built and used by us daily</p>
                </div>
                <div>
                  <div className="text-xs text-[#8888AA] uppercase tracking-widest font-semibold mb-2">What It Is</div>
                  <p className="text-[#E8E8F0] text-sm leading-relaxed">500+ page Notion workspace running all SYSmoAI operations — finance, client management, CRM, legal, and research</p>
                </div>
                <div>
                  <div className="text-xs text-[#8888AA] uppercase tracking-widest font-semibold mb-2">Result</div>
                  <p className="text-[#E8E8F0] text-sm leading-relaxed">Live production system since 2024. Proof we use what we sell — every day.</p>
                </div>
              </div>
              <div className="mt-8 border-t border-[#1E1E2E] pt-6">
                <div className="text-xs text-[#8888AA] uppercase tracking-widest font-semibold mb-3">Modules Inside</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["Finance & cashflow tracking", "Client CRM & delivery pipeline", "Legal documents & contracts", "Research & knowledge base", "Content & marketing OS", "Team operations & tasks"].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 bg-[#0A0A0F] rounded-xl px-4 py-3">
                      <span className="text-blue-400 mt-0.5 flex-shrink-0 text-sm">✓</span>
                      <span className="text-sm text-[#E8E8F0]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Honest Note */}
      <section className="max-w-3xl mx-auto px-6 py-12 border-t border-[#1E1E2E]">
        <div className="bg-[#111118] border border-yellow-500/20 rounded-2xl p-8 text-center">
          <p className="text-[#8888AA] text-sm leading-relaxed">
            We are a new company. More case studies will be added as we deliver more projects. We will never post fake testimonials, unverifiable claims, or stock-photo clients. What you see here is everything we have — and we stand behind every word of it.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Want to see more?</h2>
          <p className="text-[#8888AA] mb-8">
            WhatsApp us and we will walk you through what we have built in more detail — and discuss what we could build for you.
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
            See More of Our Work
          </a>
        </div>
      </section>

    </main>
  )
}
