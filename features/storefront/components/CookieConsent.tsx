"use client"
import { useState, useEffect } from "react"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent")
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted")
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem("cookie_consent", "rejected")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#0D0D1A] border-t border-[#1E1E2E] px-6 py-4 shadow-2xl">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          We use essential cookies to keep the site working. We don&apos;t use advertising cookies or sell your data.{" "}
          <a href="/bd/cookie-policy" className="text-[#60A5FA] hover:underline">Cookie Policy</a>
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={reject}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-[#1E1E2E] hover:border-slate-600 rounded-lg transition-colors"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 text-sm font-semibold bg-[#2563EB] hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
