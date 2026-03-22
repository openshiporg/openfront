import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import { WA, PHONE_DISPLAY, EMAIL } from "@/lib/constants/contact"

const BrandMark = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 34 L50 24 L75 34 L75 54 L50 64 L25 54 Z" fill="#1E3A8A" fillOpacity={0.3} stroke="#2563EB" strokeOpacity={0.6} strokeWidth={2.5} strokeLinejoin="round" />
    <path d="M30 49 L50 40 L70 49 L70 64 L50 73 L30 64 Z" fill="#2563EB" fillOpacity={0.5} stroke="#3B82F6" strokeOpacity={0.8} strokeWidth={2.5} strokeLinejoin="round" />
    <path d="M40 61 L50 56 L60 61 L60 71 L50 76 L40 71 Z" fill="#3B82F6" fillOpacity={1}   stroke="#60A5FA" strokeOpacity={1}   strokeWidth={2.5} strokeLinejoin="round" />
  </svg>
)

export default async function Footer() {
  return (
    <footer className="border-t border-[#1E1E2E] bg-[#0A0A0F] w-full">
      <div className="max-w-[1440px] mx-auto px-6 py-16">

        {/* 5-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">

          {/* Column 1 — Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="mb-2">
              <a href="/bd" className="inline-block">
                <div className="flex items-center gap-2.5 mb-3">
                  <BrandMark size={28} />
                  <span
                    style={{
                      fontSize: 22,
                      lineHeight: 1,
                      fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "baseline",
                      whiteSpace: "nowrap",
                      letterSpacing: "-0.33px",
                    }}
                  >
                    <span style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>SYS</span>
                    <span style={{ fontWeight: 400, letterSpacing: "-0.04em", opacity: 0.65 }}>mo</span>
                    <span style={{ fontWeight: 700, letterSpacing: "0.02em" }}>AI</span>
                  </span>
                </div>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-medium">
                  Private Limited
                </p>
              </a>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              AI Tools &amp; Systems for Bangladesh
            </p>
            <p className="text-xs text-white/30" suppressHydrationWarning>
              © {new Date().getFullYear()} SYSmoAI Private Limited.<br />Dhaka, Bangladesh.
            </p>
          </div>

          {/* Column 2 — Shop */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white uppercase tracking-widest">Shop</span>
            <ul className="flex flex-col gap-2 text-sm text-white/50">
              <li>
                <LocalizedClientLink href="/store" className="hover:text-white transition-colors">
                  Browse All Tools
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/store" className="hover:text-white transition-colors">
                  Bundles
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/store" className="hover:text-white transition-colors">
                  Best Sellers
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white uppercase tracking-widest">Company</span>
            <ul className="flex flex-col gap-2 text-sm text-white/50">
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Column 4 — Legal */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white uppercase tracking-widest">Legal</span>
            <ul className="flex flex-col gap-2 text-sm text-white/50">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Refund Policy</a></li>
            </ul>
          </div>

          {/* Column 5 — Contact */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white uppercase tracking-widest">Contact</span>
            <ul className="flex flex-col gap-2 text-sm text-white/50">
              <li>
                <a
                  href={WA.general}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#25D366] transition-colors flex items-center gap-1.5"
                >
                  💬 WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL.hello}`} className="hover:text-white transition-colors">
                  📧 {EMAIL.hello}
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                📍 Dhaka, Bangladesh
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1E1E2E] mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-sm">
            © 2026 SYSmoAI Private Limited. All rights reserved.
          </p>
          <p className="text-slate-600 text-sm">
            Made in Bangladesh 🇧🇩
          </p>
        </div>
      </div>
    </footer>
  )
}
