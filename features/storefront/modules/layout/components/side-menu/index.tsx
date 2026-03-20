"use client"

import { useState } from "react"
import { WA } from "@/lib/constants/contact"

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
              <a href="/bd" className="flex items-center">
                <span className="text-lg font-bold text-white">
                  SYSmo<span className="text-indigo-400">AI</span>
                </span>
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
                  className="flex items-center px-6 py-4 text-white text-base font-medium border-b border-[#1E1E2E] hover:bg-[#13131A] hover:text-indigo-400 transition-colors"
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
