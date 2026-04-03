import { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ — SYSmoAI AI Services",
  description: "Common questions about SYSmoAI's AI services, pricing, NemoClaw agents, OpenClaw local AI, Notion OS, and how we work with Bangladesh and international businesses.",
  alternates: { canonical: "https://sysmoai.com/faq" },
  openGraph: {
    title: "FAQ — SYSmoAI AI Services",
    description: "Answers to the most common questions about SYSmoAI services and how we work.",
    url: "https://sysmoai.com/faq",
    type: "website",
  },
}

const WA_LINK = "https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20have%20a%20question"

const FAQS = [
  {
    q: "What does SYSmoAI do?",
    a: "We build AI-powered operating systems for businesses using Notion, automation tools, and custom AI workflows. We handle the full process — from auditing your current operations to building and deploying systems that reduce manual work and improve output.",
  },
  {
    q: "Who is SYSmoAI for?",
    a: "We primarily serve Bangladesh-based businesses: agencies, e-commerce, coaching businesses, accounting firms, clinics, and trading companies. We also work with international clients worldwide at USD pricing.",
  },
  {
    q: "How much does it cost?",
    a: "AI Profit Audit starts at BDT 15,000. Implementation Sprint from BDT 40,000. Monthly Retainer from BDT 20,000/mo. For international clients: Audit from $200, Sprint from $500, Retainer from $250/mo. All pricing depends on scope — WhatsApp us for a custom quote.",
  },
  {
    q: "What is NemoClaw?",
    a: "NemoClaw is our AI agent implementation service using Anthropic Claude. We build custom agents that handle real tasks in your business — customer support, data processing, report generation, workflow automation — with human-in-the-loop controls so you stay in charge.",
  },
  {
    q: "What is OpenClaw?",
    a: "OpenClaw is our local AI setup service. We install and configure AI that runs entirely on your own hardware — no cloud, no API costs, no data leaving your machine. Designed for businesses in accounting, law, healthcare, or any field with sensitive data.",
  },
  {
    q: "What is a Notion OS?",
    a: "A Notion OS is a complete business operating system built in Notion. We build CRM, project delivery systems, SOP wikis, financial dashboards, and team task systems — all connected into one workspace. It replaces scattered tools with a single source of truth.",
  },
  {
    q: "Do you work with international clients?",
    a: "Yes. We work with clients anywhere in the world. All communication happens via WhatsApp and Zoom. We deliver everything async through a shared Notion workspace with weekly progress reports. Pricing for international clients is in USD.",
  },
  {
    q: "How long does implementation take?",
    a: "AI Profit Audit: 3–5 business days. Implementation Sprint: 2–4 weeks depending on complexity. Notion OS build: 2–3 weeks. You will see results from week one — we do not wait until the end to show you progress.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. We offer a full refund on the AI Profit Audit if the deliverable is not received within 5 business days of payment. For implementation projects, 50% is paid upfront and 50% on delivery — you only pay the second half when you are satisfied.",
  },
  {
    q: "What tools do you use?",
    a: "Notion, Anthropic Claude, n8n, Make (Integromat), WhatsApp Business API, Google Workspace, and custom Python scripts as needed. We choose tools based on your existing stack — we do not force you to switch systems.",
  },
  {
    q: "Can you work with my existing systems?",
    a: "Yes. We always audit first before building anything. We identify what is already working and build around it. You will not be asked to throw away tools that are serving you well.",
  },
  {
    q: "How do I start?",
    a: "WhatsApp us at +880 1711-638693. We will ask about your business, your biggest operational challenge, and recommend the right next step. No commitment required for the first conversation.",
  },
]

const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />
      <main className="bg-[#0A0A0F] text-[#E8E8F0] min-h-screen">

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-[#8888AA] max-w-xl mx-auto">
            Everything you need to know about SYSmoAI before getting in touch.
          </p>
        </section>

        {/* FAQ List */}
        <section className="max-w-3xl mx-auto px-6 py-8 pb-16">
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group bg-[#111118] border border-[#1E1E2E] rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-7 py-5 cursor-pointer list-none text-white font-semibold text-base hover:bg-[#13131A] transition-colors select-none">
                  <span>{faq.q}</span>
                  <span className="ml-4 flex-shrink-0 text-[#8888AA] group-open:rotate-45 transition-transform duration-200 text-xl leading-none">+</span>
                </summary>
                <div className="px-7 pb-6 pt-1">
                  <p className="text-[#8888AA] text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-[#1E1E2E]">
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Still have questions?</h2>
            <p className="text-[#8888AA] mb-8">
              WhatsApp us directly. We respond within a few hours and will give you a straight answer — no sales pitch.
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
              WhatsApp Us Now
            </a>
          </div>
        </section>

      </main>
    </>
  )
}
