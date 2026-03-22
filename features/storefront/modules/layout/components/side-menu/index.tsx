"use client"

import { useState } from "react"
import { WA } from "@/lib/constants/contact"

const BrandMark = ({ size = 28 }: { size?: number }) => {
  const sw = size <= 24 ? 3 : 2.5
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 34 L50 24 L75 34 L75 54 L50 64 L25 54 Z" fill="#1E3A8A" fillOpacity={0.3} stroke="#2563EB" strokeOpacity={0.6} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M30 49 L50 40 L70 49 L70 64 L50 73 L30 64 Z" fill="#2563EB" fillOpacity={0.5} stroke="#3B82F6" strokeOpacity={0.8} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M40 61 L50 56 L60 61 L60 71 L50 76 L40 71 Z" fill="#3B82F6" fillOpacity={1}   stroke="#60A5FA" strokeOpacity={1}   strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  )
}

const BrandWordmark = ({ size = 18 }: { size?: number }) => (
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

const SideMenu = ({ regions }: { regions: any[] | null }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="h-full">
      {/* Hamburger Button */}
      <button
        data-testid="nav-menu-button"
        onClick={() => setIsOpen(true)}
        className="flex flex-col gap-1.5 p-2 hover:opacity-70 transition-opacity cursor-pointer focus:outline-none"
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-white" />
        <span className="block w-5 h-0.5 bg-white" />
        <span className="block w-5 h-0.5 bg-white" />
      </button>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute top-0 left-0 h-full w-[280px] bg-[#0A0A0F] border-r border-[#1E1E2E] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E2E]">
              <a href="/bd" className="flex items-center gap-2">
                <BrandMark size={28} />
                <BrandWordmark size={18} />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 transition-colors"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col flex-1 py-2">
              {[
                { label: "Home", href: "/bd" },
                { label: "Shop", href: "/bd/store" },
                { label: "Services", href: "/bd/services" },
                { label: "About", href: "/bd/about" },
                { label: "Contact", href: "/bd/contact" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-6 py-4 text-white text-base font-medium border-b border-[#1E1E2E] hover:bg-[#13131A] hover:text-[#60A5FA] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* WhatsApp CTA */}
            <div className="p-5 border-t border-[#1E1E2E]">
              <a
                href={WA.general}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-colors text-base"
                onClick={() => setIsOpen(false)}
              >
                💬 WhatsApp Us
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default SideMenu
