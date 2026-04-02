"use client"
import { useState } from "react"

const BrandMark = ({ size = 32 }: { size?: number }) => {
  const sw = size <= 24 ? 3 : size <= 48 ? 2.5 : 2
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 34 L50 24 L75 34 L75 54 L50 64 L25 54 Z" fill="#1E3A8A" fillOpacity={0.3} stroke="#2563EB" strokeOpacity={0.6} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M30 49 L50 40 L70 49 L70 64 L50 73 L30 64 Z" fill="#2563EB" fillOpacity={0.5} stroke="#3B82F6" strokeOpacity={0.8} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M40 61 L50 56 L60 61 L60 71 L50 76 L40 71 Z" fill="#3B82F6" fillOpacity={1}   stroke="#60A5FA" strokeOpacity={1}   strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  )
}

const BrandWordmark = ({ size = 20 }: { size?: number }) => (
  <span
    style={{
      fontSize: size,
      lineHeight: 1,
      fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
      color: "#ffffff",
      display: "inline-flex",
      alignItems: "baseline",
      whiteSpace: "nowrap",
      letterSpacing: `${-size * 0.015}px`,
    }}
  >
    <span style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>SYS</span>
    <span style={{ fontWeight: 400, letterSpacing: "-0.04em", opacity: 0.65 }}>mo</span>
    <span style={{ fontWeight: 700, letterSpacing: "0.02em" }}>AI</span>
  </span>
)

const NAV_LINKS = [
  { label: "Home", href: "/bd" },
  { label: "Services", href: "/bd/services" },
  { label: "Industries", href: "/bd/services#industries" },
  { label: "About", href: "/bd/about" },
  { label: "Contact", href: "/bd/contact" },
]

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-[#1E1E2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <a href="/bd" className="flex items-center gap-2.5 flex-shrink-0 group">
              <BrandMark size={32} />
              <BrandWordmark size={20} />
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Desktop Right: WhatsApp CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20need%20help"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20b85a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" />
                </svg>
                WhatsApp Us
              </a>
            </div>

            {/* Mobile: WA + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <a
                href="https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20need%20help"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#20b85a] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" />
                </svg>
              </a>
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Open menu"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16" />

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-[280px] bg-[#0A0A0F] border-r border-[#1E1E2E] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E2E]">
              <a href="/bd" className="flex items-center gap-2">
                <BrandMark size={28} />
                <BrandWordmark size={18} />
              </a>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white p-1 text-xl transition-colors">✕</button>
            </div>
            <nav className="flex flex-col flex-1 py-2 overflow-y-auto">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-6 py-4 text-white text-base font-medium border-b border-[#1E1E2E] hover:bg-[#13131A] hover:text-[#60A5FA] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="p-5 border-t border-[#1E1E2E]">
              <a
                href="https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20need%20help"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20b85a] text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" />
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
