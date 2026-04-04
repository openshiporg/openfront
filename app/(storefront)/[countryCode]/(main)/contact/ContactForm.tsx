"use client"

import { useState } from "react"

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl mb-4 block">✅</span>
        <p className="text-lg font-semibold text-white mb-2">Thank you!</p>
        <p className="text-[#94A3B8]">We&apos;ll reply within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-white/70">Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#6366F1] transition-colors"
          placeholder="Your name"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-white/70">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#6366F1] transition-colors"
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-white/70">Message</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#6366F1] transition-colors resize-none"
          placeholder="How can we help you?"
        />
      </div>
      <button
        type="submit"
        className="bg-[#6366F1] text-white font-semibold py-3 rounded-lg hover:bg-[#4F46E5] transition-colors"
      >
        Send Message
      </button>
    </form>
  )
}
