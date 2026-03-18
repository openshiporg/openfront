import { Metadata } from "next"
import { WA, EMAIL, PHONE_DISPLAY } from "@/lib/constants/contact"
import ContactForm from "./ContactForm"

export const metadata: Metadata = {
  title: "Contact | SYSmoAI",
  description: "Get in touch with SYSmoAI. WhatsApp, email, or send us a message directly.",
}

export default function ContactPage() {
  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen">

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">Let&apos;s Talk</h1>
        <p className="text-lg text-[#94A3B8]">
          The fastest way to reach us is WhatsApp. We respond within 2 hours.
        </p>
      </section>

      {/* WhatsApp CTA */}
      <section className="px-6 pb-16 flex justify-center">
        <a
          href={WA.contact}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#25D366] text-white font-bold text-lg px-10 py-5 rounded-xl hover:bg-[#20b85a] transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" />
          </svg>
          Message us on WhatsApp
        </a>
      </section>

      {/* Contact Info */}
      <section className="px-6 pb-16 max-w-[700px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "📧", label: "Email", value: EMAIL.hello, href: `mailto:${EMAIL.hello}` },
            { icon: "🎧", label: "Support", value: EMAIL.support, href: `mailto:${EMAIL.support}` },
            { icon: "📍", label: "Location", value: "Dhaka, Bangladesh", href: null },
          ].map(({ icon, label, value, href }) => (
            <div key={label} className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-5 text-center">
              <span className="text-2xl mb-2 block">{icon}</span>
              <span className="text-xs text-white/40 uppercase tracking-wide block mb-1">{label}</span>
              {href ? (
                <a href={href} className="text-sm text-white hover:text-[#6366F1] transition-colors">{value}</a>
              ) : (
                <span className="text-sm text-white">{value}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="px-6 pb-24 max-w-[600px] mx-auto">
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Send a Message</h2>
          <ContactForm />
        </div>
      </section>

    </div>
  )
}
