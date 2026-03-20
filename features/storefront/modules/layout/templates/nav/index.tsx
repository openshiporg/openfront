"use client"
import { useState } from "react"

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-[#1E1E2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <a href="/bd" className="flex items-center flex-shrink-0 group">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                SYSmo<span className="text-indigo-400">AI</span>
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
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
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Desktop Right: WhatsApp + Account + Cart */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://wa.me/8801711638693?text=Hi%20SYSmoAI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                💬 WhatsApp
              </a>
              <a href="/account" className="text-slate-400 hover:text-white text-sm transition-colors">
                Account
              </a>
              <a href="/cart" className="text-slate-400 hover:text-white text-sm transition-colors">
                Cart
              </a>
            </div>

            {/* Mobile: WhatsApp + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <a
                href="https://wa.me/8801711638693?text=Hi%20SYSmoAI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                💬
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

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 left-0 h-full w-[280px] bg-[#0A0A0F] border-r border-[#1E1E2E] flex flex-col shadow-2xl">

            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E2E]">
              <a href="/bd">
                <span className="text-lg font-bold text-white">
                  SYSmo<span className="text-indigo-400">AI</span>
                </span>
              </a>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Drawer Links */}
            <nav className="flex flex-col flex-1 py-2 overflow-y-auto">
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
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-6 py-4 text-white text-base font-medium border-b border-[#1E1E2E] hover:bg-[#13131A] hover:text-indigo-400 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-[#1E1E2E]">
              <a
                href="https://wa.me/8801711638693?text=Hi%20SYSmoAI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                💬 WhatsApp Us
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
