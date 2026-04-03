import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — SYSmoAI AI Systems for Bangladesh Businesses',
  description: 'Insights on AI implementation, Notion systems, and business automation for Bangladesh businesses.',
  alternates: { canonical: 'https://sysmoai.com/blog' },
  openGraph: {
    title: 'Blog | SYSmoAI',
    description: 'Insights on AI, Notion, and business automation for Bangladesh.',
    url: 'https://sysmoai.com/blog',
    type: 'website',
  },
}

const posts = [
  {
    slug: 'why-bangladesh-businesses-need-notion',
    title: 'Why Bangladesh Businesses Need Notion Before They Need AI',
    excerpt:
      'Most Bangladesh businesses jump straight to AI tools without having basic systems in place. Here is why Notion comes first — and what to build before adding automation.',
    date: 'March 2026',
    readTime: '5 min',
    tag: 'Systems',
  },
  {
    slug: 'whatsapp-business-system',
    title: 'How to Build a WhatsApp-Native Business System That Actually Scales',
    excerpt:
      'WhatsApp is how Bangladesh does business. The mistake is treating it like a chat app instead of a system. Here is how to structure it properly.',
    date: 'March 2026',
    readTime: '7 min',
    tag: 'WhatsApp',
  },
  {
    slug: 'ai-profit-audit-explained',
    title: 'What Happens in a SYSmoAI Profit Audit (Step by Step)',
    excerpt:
      'The AI Profit Audit is our starting point with every client. Here is exactly what we look at, what we deliver, and what you should do with the output.',
    date: 'February 2026',
    readTime: '6 min',
    tag: 'Services',
  },
  {
    slug: 'common-mistakes-bd-businesses',
    title: 'The 5 Most Common Operational Mistakes Bangladesh Businesses Make',
    excerpt:
      'After working with dozens of Bangladesh businesses, we see the same patterns. These five mistakes cost the most time and money — and all are fixable with the right systems.',
    date: 'February 2026',
    readTime: '8 min',
    tag: 'Operations',
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Hero */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/40 border border-[#2563EB]/30 text-[#60A5FA] text-sm font-medium px-4 py-2 rounded-full mb-8">
          Insights & Guides
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          SYSmoAI Blog
        </h1>
        <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto">
          Practical insights on AI implementation, Notion systems, and business
          operations for Bangladesh businesses. No hype — just what works.
        </p>
      </section>

      {/* Posts */}
      <section className="px-6 py-8 max-w-3xl mx-auto">
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-6 hover:border-[#2563EB]/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs bg-[#1E3A8A]/60 text-[#60A5FA] px-3 py-1 rounded-full font-medium">
                  {post.tag}
                </span>
                <span className="text-xs text-[#94A3B8]">{post.date}</span>
                <span className="text-xs text-[#94A3B8]">· {post.readTime} read</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{post.title}</h2>
              <p className="text-[#94A3B8] text-sm leading-relaxed">{post.excerpt}</p>
              <p className="mt-3 text-sm text-[#2563EB]/60 italic">Coming soon — subscribe via WhatsApp for updates</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Get updates on WhatsApp</h2>
        <p className="text-[#94A3B8] mb-8">
          New articles and guides are shared with our WhatsApp community first.
        </p>
        <a
          href="https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20want%20to%20get%20blog%20updates"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b85a] text-white font-semibold px-8 py-4 rounded-xl transition-colors"
        >
          💬 Join on WhatsApp
        </a>
      </section>

    </main>
  )
}
