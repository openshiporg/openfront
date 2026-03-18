import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404 — Page Not Found | SYSmoAI",
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center text-white px-6 text-center">
      <p className="text-[#6366F1] font-semibold text-sm uppercase tracking-widest mb-4">404</p>
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">Page Not Found</h1>
      <p className="text-[#94A3B8] text-lg mb-10 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-8 py-3 bg-[#6366F1] text-white font-semibold rounded-lg hover:bg-[#4F46E5] transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/us/store"
          className="px-8 py-3 border border-[#1E1E2E] text-white font-semibold rounded-lg hover:border-[#6366F1] transition-colors"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  )
}
