import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import { WA, PHONE_DISPLAY, EMAIL } from "@/lib/constants/contact"

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
                <div className="mb-3">
                  <span className="text-2xl font-bold text-white tracking-tight">
                    SYSmo<span className="text-indigo-400">AI</span>
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
