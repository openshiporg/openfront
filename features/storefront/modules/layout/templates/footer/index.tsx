import { WA, EMAIL, COMPANY } from "@/lib/constants/contact"

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">

          {/* Column 1 — Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <a href="/bd" className="inline-block">
              <div className="flex items-center gap-2.5 mb-2">
                <BrandMark size={28} />
                <span style={{ fontSize: 22, lineHeight: 1, fontFamily: "'Inter', -apple-system, system-ui, sans-serif", color: "#ffffff", display: "inline-flex", alignItems: "baseline", whiteSpace: "nowrap", letterSpacing: "-0.33px" }}>
                  <span style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>SYS</span>
                  <span style={{ fontWeight: 400, letterSpacing: "-0.04em", opacity: 0.65 }}>mo</span>
                  <span style={{ fontWeight: 700, letterSpacing: "0.02em" }}>AI</span>
                </span>
              </div>
              <p className="text-slate-500 text-xs uppercase tracking-widest font-medium">Private Limited</p>
            </a>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              AI-powered operating systems for Bangladesh businesses.
            </p>
            <p className="text-xs text-white/30" suppressHydrationWarning>
              © {new Date().getFullYear()} {COMPANY.fullName}.<br />
              {COMPANY.address}
            </p>
          </div>

          {/* Column 2 — Services */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white uppercase tracking-widest">Services</span>
            <ul className="flex flex-col gap-2 text-sm text-white/50">
              <li><a href="/bd/services" className="hover:text-white transition-colors">All Services</a></li>
              <li><a href="/bd/services#audit" className="hover:text-white transition-colors">AI Profit Audit</a></li>
              <li><a href="/bd/services#sprint" className="hover:text-white transition-colors">Implementation Sprint</a></li>
              <li><a href="/bd/services#retainer" className="hover:text-white transition-colors">Monthly Retainer</a></li>
            </ul>
          </div>

          {/* Column 3 — Industries */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white uppercase tracking-widest">Industries</span>
            <ul className="flex flex-col gap-2 text-sm text-white/50">
              <li><a href="/bd/industries" className="hover:text-white transition-colors">All Industries</a></li>
              <li><a href="/bd/services/agencies" className="hover:text-white transition-colors">Agencies</a></li>
              <li><a href="/bd/services/ecommerce" className="hover:text-white transition-colors">E-commerce</a></li>
              <li><a href="/bd/services/coaching" className="hover:text-white transition-colors">Coaching</a></li>
              <li><a href="/bd/services/accounting" className="hover:text-white transition-colors">Accounting</a></li>
              <li><a href="/bd/services/clinics" className="hover:text-white transition-colors">Clinics</a></li>
              <li><a href="/bd/services/trading" className="hover:text-white transition-colors">Trading</a></li>
            </ul>
          </div>

          {/* Column 4 — Company */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white uppercase tracking-widest">Company</span>
            <ul className="flex flex-col gap-2 text-sm text-white/50">
              <li><a href="/bd/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/bd/blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/bd/contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="/bd/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/bd/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/bd/refund" className="hover:text-white transition-colors">Refund Policy</a></li>
              <li><a href="/bd/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Column 5 — Contact */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white uppercase tracking-widest">Contact</span>
            <ul className="flex flex-col gap-2 text-sm text-white/50">
              <li>
                <a href={WA.general} target="_blank" rel="noreferrer" className="hover:text-[#25D366] transition-colors flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" />
                  </svg>
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL.accounts}`} className="hover:text-white transition-colors">
                  {EMAIL.accounts}
                </a>
              </li>
              <li className="text-white/30 text-xs leading-relaxed">
                {COMPANY.address}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1E1E2E] mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-sm">© 2026 {COMPANY.fullName}. All rights reserved.</p>
          <p className="text-slate-600 text-sm">Made in Bangladesh 🇧🇩</p>
        </div>
      </div>
    </footer>
  )
}
