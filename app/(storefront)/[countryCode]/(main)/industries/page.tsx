import { Metadata } from 'next'
import { WA } from '@/lib/constants/contact'

export const metadata: Metadata = {
  title: 'Industries — SYSmoAI AI Systems for Bangladesh Businesses',
  description: 'AI operating systems built for agencies, e-commerce, coaching, accounting, clinics, and trading businesses in Bangladesh.',
  alternates: { canonical: 'https://sysmoai.com/industries' },
  openGraph: {
    title: 'Industries We Serve | SYSmoAI',
    description: 'AI systems built specifically for Bangladesh business types.',
    url: 'https://sysmoai.com/industries',
    type: 'website',
  },
}

const industries = [
  {
    slug: 'agencies',
    icon: '🏢',
    name: 'Digital Agencies',
    problem: 'Client chaos, missed deadlines, manual reporting, and the owner in every conversation.',
    install: 'Notion client OS, automated reporting, project delivery system, and team accountability dashboards.',
  },
  {
    slug: 'ecommerce',
    icon: '📦',
    name: 'E-commerce & F-commerce',
    problem: 'Lost orders, stock confusion, COD leakage, and no visibility across channels.',
    install: 'Order tracking system, stock management in Notion, automated customer follow-up, and daily P&L dashboard.',
  },
  {
    slug: 'coaching',
    icon: '🎓',
    name: 'Coaching & Education',
    problem: 'Leads not followed up, manual onboarding, course delivery chaos, and no student tracking.',
    install: 'Lead CRM in Notion, automated onboarding flow, student progress tracker, and WhatsApp-native delivery.',
  },
  {
    slug: 'accounting',
    icon: '📊',
    name: 'Accounting & Tax Firms',
    problem: 'Deadline chaos, client files scattered across emails and WhatsApp, no visibility on status.',
    install: 'Client file OS in Notion, deadline tracker, automated reminders, and document checklist system.',
  },
  {
    slug: 'clinics',
    icon: '🏥',
    name: 'Clinics & Healthcare',
    problem: 'Appointment leakage, billing done manually, patient records in paper or scattered Excel files.',
    install: 'Appointment tracking system, billing follow-up automation, and patient record management in Notion.',
  },
  {
    slug: 'trading',
    icon: '🚚',
    name: 'Trading & Distribution',
    problem: 'Stock tracked in Excel, supplier chaos, payment follow-up done manually by the owner.',
    install: 'Stock management system, supplier relationship tracker, automated payment reminders, and order dashboard.',
  },
]

export default function IndustriesPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Hero */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/40 border border-[#2563EB]/30 text-[#60A5FA] text-sm font-medium px-4 py-2 rounded-full mb-8">
          🇧🇩 Bangladesh-specific systems
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Industries We Serve
        </h1>
        <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto">
          We have built AI operating systems for these specific business types in Bangladesh.
          Each system is designed around how that industry actually operates — not generic templates.
        </p>
      </section>

      {/* Industries Grid */}
      <section className="px-6 py-8 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {industries.map((ind) => (
            <div
              key={ind.slug}
              className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-6 hover:border-[#2563EB]/50 transition-colors"
            >
              <div className="text-3xl mb-3">{ind.icon}</div>
              <h2 className="text-xl font-bold text-white mb-3">{ind.name}</h2>
              <div className="mb-4">
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">The Problem</p>
                <p className="text-[#94A3B8] text-sm">{ind.problem}</p>
              </div>
              <div>
                <p className="text-xs text-[#2563EB] uppercase tracking-wider mb-1">What We Install</p>
                <p className="text-sm text-white/80">{ind.install}</p>
              </div>
              <a
                href={`https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20need%20help%20for%20my%20${ind.slug}%20business`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm text-[#2563EB] hover:underline"
              >
                Talk to us about {ind.name} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Your industry not listed?</h2>
        <p className="text-[#94A3B8] mb-8">
          We work with any Bangladesh business that runs on repeatable processes. WhatsApp us.
        </p>
        <a
          href="https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20have%20a%20different%20business%20type"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-semibold px-8 py-4 rounded-xl transition-colors"
        >
          💬 WhatsApp — +880 1711-638693
        </a>
      </section>

    </main>
  )
}
