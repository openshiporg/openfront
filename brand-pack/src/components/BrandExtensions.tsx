import React from 'react';

// ============================================================================
// SYSmoAI® — BRAND EXTENSIONS (Task 2)
// ============================================================================
// 2a. Business Card  |  2b. LinkedIn Banner  |  2c. Email Signature
// 2d. Social Post    |  2e. Proposal Cover   |  2f. Brand Pattern
// ============================================================================

// — Inline logo & wordmark to avoid circular deps —
const Mark = ({ size = 48, variant = 'brand-dark' }: { size?: number; variant?: string }) => {
  const sw = size <= 24 ? 3.5 : size <= 32 ? 3 : size <= 64 ? 2.5 : 2;
  const paths = [
    'M25 34 L50 24 L75 34 L75 54 L50 64 L25 54 Z',
    'M30 49 L50 40 L70 49 L70 64 L50 73 L30 64 Z',
    'M40 61 L50 56 L60 61 L60 71 L50 76 L40 71 Z',
  ];
  const cfgs: Record<string, { f: string[]; fo: number[]; s: string[]; so: number[] }> = {
    'brand-dark':  { f: ['#1E3A8A','#2563EB','#3B82F6'], fo: [.3,.5,1], s: ['#2563EB','#3B82F6','#60A5FA'], so: [.6,.8,1] },
    'brand-light': { f: ['#1E3A8A','#2563EB','#1E3A8A'], fo: [.08,.15,.85], s: ['#1E40AF','#2563EB','#1E3A8A'], so: [.35,.55,1] },
    'mono-white':  { f: ['#FFF','#FFF','#FFF'], fo: [.12,.3,1], s: ['#FFF','#FFF','#FFF'], so: [.5,.7,1] },
  };
  const c = cfgs[variant] || cfgs['brand-dark'];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {paths.map((d, i) => (
        <path key={i} d={d} fill={c.f[i]} fillOpacity={c.fo[i]} stroke={c.s[i]} strokeOpacity={c.so[i]} strokeWidth={sw} strokeLinejoin="round" />
      ))}
    </svg>
  );
};

const Word = ({ size = 24, color = '#fff', opacity1 = 0.65 }: { size?: number; color?: string; opacity1?: number }) => (
  <div style={{ fontSize: size, lineHeight: 1, fontFamily: "'Inter',-apple-system,system-ui,sans-serif", color, display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap', letterSpacing: `${-size * 0.015}px` }}>
    <span style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>SYS</span>
    <span style={{ fontWeight: 400, letterSpacing: '-0.04em', opacity: opacity1 }}>mo</span>
    <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>AI</span>
  </div>
);

const Tagline = ({ size = 12, text = 'Systems in Motion.' }: { size?: number; text?: string }) => (
  <div style={{ fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif", fontSize: size, fontWeight: 300, color: '#94A3B8', letterSpacing: '0.04em' }}>
    {text}
  </div>
);

// Subtle hex motif pattern SVG for backgrounds
function HexPattern({ opacity = 0.04, color = '#2563EB' }: { opacity?: number; color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexMotif" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <path d="M15 8.66 L30 0 L45 8.66 L45 25.98 L30 34.64 L15 25.98 Z" fill="none" stroke={color} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexMotif)" />
      </svg>
    </div>
  );
}

function SectionHeader({ id, num, title, sub }: { id: string; num: string; title: string; sub: string }) {
  return (
    <div id={id} className="mb-10">
      <div className="flex items-baseline gap-4 mb-2">
        <span className="text-white/15 font-mono" style={{ fontSize: 12 }}>{num}</span>
        <h2 className="text-white/90" style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h2>
      </div>
      <p className="text-white/30" style={{ fontSize: 14 }}>{sub}</p>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/[0.04]">
      <span className="text-white/40" style={{ fontSize: 12 }}>{label}</span>
      <span className="text-white/80 font-mono text-right" style={{ fontSize: 11 }}>{value}</span>
    </div>
  );
}

// ============================================================================
// 2a · BUSINESS CARD
// ============================================================================
function BusinessCardSection() {
  return (
    <section className="px-12 py-16 border-t border-white/[0.04]">
      <SectionHeader
        id="business-card"
        num="28a"
        title="Business Card"
        sub="Standard 3.5″ × 2″ (85mm × 55mm) — front and back. Pure black with hex layer motif."
      />

      <div className="grid grid-cols-2 gap-8">
        {/* FRONT */}
        <div>
          <div className="text-white/25 mb-3" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>FRONT</div>
          <div
            className="rounded-2xl overflow-hidden shadow-2xl relative"
            style={{ width: '100%', aspectRatio: '3.5/2', background: '#000000', maxWidth: 420 }}
          >
            {/* Hex texture */}
            <HexPattern opacity={0.025} color="#1E3A8A" />
            {/* Subtle radial glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 60% 80% at 75% 30%, rgba(37,99,235,0.04) 0%, transparent 70%)'
            }} />

            <div className="relative z-10 w-full h-full flex flex-col justify-between p-7">
              {/* Top: Logo + Tagline */}
              <div>
                <div className="flex items-center gap-2.5">
                  <Mark size={28} variant="brand-dark" />
                  <Word size={13} color="#fff" />
                </div>
                <div className="mt-2 ml-[38px]">
                  <Tagline size={8} />
                </div>
              </div>

              {/* Bottom: Contact */}
              <div>
                <div className="text-white" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em' }}>
                  EMON HOSSAIN
                </div>
                <div className="text-white/45 mt-0.5" style={{ fontSize: 9, fontWeight: 500 }}>
                  Founder & CEO
                </div>
              </div>
            </div>
          </div>
          {/* Specs below front */}
          <div className="mt-4 space-y-0">
            <Spec label="Dimensions" value='3.5″ × 2″ (85 × 55mm)' />
            <Spec label="Bleed" value="3mm all sides" />
            <Spec label="Background" value="#000000 Pure Black" />
            <Spec label="Texture" value="Hex motif, #1E3A8A at 2.5%" />
          </div>
        </div>

        {/* BACK */}
        <div>
          <div className="text-white/25 mb-3" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>BACK</div>
          <div
            className="rounded-2xl overflow-hidden shadow-2xl relative"
            style={{ width: '100%', aspectRatio: '3.5/2', background: '#000000', maxWidth: 420 }}
          >
            <HexPattern opacity={0.02} color="#0D1B3E" />

            <div className="relative z-10 w-full h-full flex flex-col justify-between p-7">
              {/* Contact info */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="text-white/30" style={{ fontSize: 9, fontWeight: 500, width: 40 }}>Email</div>
                    <div className="text-white/80 font-mono" style={{ fontSize: 10 }}>emon@sysmoai.com</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-white/30" style={{ fontSize: 9, fontWeight: 500, width: 40 }}>Web</div>
                    <div className="text-white/80 font-mono" style={{ fontSize: 10 }}>sysmoai.com</div>
                  </div>
                </div>
              </div>

              {/* Blue accent line */}
              <div>
                <div className="h-px mb-4" style={{ background: 'linear-gradient(90deg, #2563EB, transparent 80%)', opacity: 0.5 }} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mark size={16} variant="mono-white" />
                    <Word size={8} color="rgba(255,255,255,0.3)" />
                  </div>
                  <div className="text-white/15 font-mono" style={{ fontSize: 7 }}>
                    Dhaka, Bangladesh
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-0">
            <Spec label="Accent line" value="#2563EB → transparent" />
            <Spec label="Typography" value="Inter 700 / Mono 400" />
            <Spec label="Corner radius (print)" value="3mm round corners" />
            <Spec label="Stock" value="400gsm soft-touch matte" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 2b · LINKEDIN BANNER
// ============================================================================
function LinkedInBannerSection() {
  return (
    <section className="px-12 py-16 border-t border-white/[0.04]">
      <SectionHeader
        id="linkedin-banner"
        num="28b"
        title="LinkedIn Banner"
        sub="1584 × 396px — logo left, tagline center, CTA right. Dark background with hex depth pattern."
      />

      {/* Full-width preview */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl relative border border-white/[0.04]"
        style={{ width: '100%', aspectRatio: '1584/396', background: '#000000' }}
      >
        <HexPattern opacity={0.02} color="#0D1B3E" />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(90deg, rgba(13,27,62,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(13,27,62,0.3) 100%)'
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 40% 100% at 15% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)'
        }} />

        <div className="relative z-10 w-full h-full flex items-center justify-between px-[5%]">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <Mark size={40} variant="brand-dark" />
            <Word size={18} color="#fff" />
          </div>

          {/* Center: Tagline */}
          <div className="flex flex-col items-center">
            <Tagline size={14} />
          </div>

          {/* Right: CTA */}
          <div className="text-right">
            <div className="text-white/70" style={{ fontSize: 12, fontWeight: 500 }}>
              AI Systems for Business
            </div>
            <div className="text-white/30 mt-0.5" style={{ fontSize: 10 }}>
              Bangladesh & Global
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions & specs */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="bg-[#08090D] rounded-xl p-5 border border-white/[0.04]">
          <div className="text-white/25 mb-3" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>DIMENSIONS</div>
          <Spec label="Canvas" value="1584 × 396px" />
          <Spec label="Safe area" value="Center 1200 × 300px" />
          <Spec label="Format" value="PNG / JPEG (85%)" />
        </div>
        <div className="bg-[#08090D] rounded-xl p-5 border border-white/[0.04]">
          <div className="text-white/25 mb-3" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>LAYOUT</div>
          <Spec label="Logo" value="Left, vertically centered" />
          <Spec label="Tagline" value="Center, Space Grotesk 300" />
          <Spec label="CTA" value="Right-aligned, Inter 500" />
        </div>
        <div className="bg-[#08090D] rounded-xl p-5 border border-white/[0.04]">
          <div className="text-white/25 mb-3" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>BACKGROUND</div>
          <Spec label="Base" value="#000000" />
          <Spec label="Hex motif" value="#0D1B3E at 2%" />
          <Spec label="Edge gradient" value="Deep navy vignette" />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 2c · EMAIL SIGNATURE
// ============================================================================
function EmailSignatureSection() {
  return (
    <section className="px-12 py-16 border-t border-white/[0.04]">
      <SectionHeader
        id="email-signature"
        num="28c"
        title="Email Signature"
        sub="HTML-compatible signature block — dark and light variants with #2563EB bottom border."
      />

      <div className="grid grid-cols-2 gap-8">
        {/* Dark variant */}
        <div>
          <div className="text-white/25 mb-3" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>DARK VARIANT</div>
          <div className="rounded-2xl overflow-hidden border border-white/[0.04]" style={{ background: '#000000' }}>
            <div className="p-7">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <Mark size={32} variant="brand-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Word size={12} color="#fff" />
                  </div>
                  <div className="mt-3">
                    <div className="text-white" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>Emon Hossain</div>
                    <div className="text-white/45 mt-0.5" style={{ fontSize: 11 }}>Founder & CEO</div>
                  </div>
                  <div className="mt-3 pt-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-white/40 font-mono" style={{ fontSize: 10 }}>emon@sysmoai.com</div>
                    <div className="text-white/40 font-mono" style={{ fontSize: 10 }}>sysmoai.com</div>
                    <div className="text-white/25 font-mono" style={{ fontSize: 9 }}>Dhaka, Bangladesh</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Bottom border */}
            <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #2563EB 0%, #60A5FA 50%, transparent 100%)' }} />
          </div>
        </div>

        {/* Light variant */}
        <div>
          <div className="text-white/25 mb-3" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>LIGHT VARIANT</div>
          <div className="rounded-2xl overflow-hidden border border-black/[0.08]" style={{ background: '#FFFFFF' }}>
            <div className="p-7">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <Mark size={32} variant="brand-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Word size={12} color="#000" opacity1={0.5} />
                  </div>
                  <div className="mt-3">
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', color: '#000' }}>Emon Hossain</div>
                    <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }} className="mt-0.5">Founder & CEO</div>
                  </div>
                  <div className="mt-3 pt-3 space-y-1" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="font-mono" style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)' }}>emon@sysmoai.com</div>
                    <div className="font-mono" style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)' }}>sysmoai.com</div>
                    <div className="font-mono" style={{ fontSize: 9, color: 'rgba(0,0,0,0.25)' }}>Dhaka, Bangladesh</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Bottom border */}
            <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #2563EB 0%, #60A5FA 50%, transparent 100%)' }} />
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {[
          ['Logo mark', '32px height'],
          ['Name', 'Inter Bold 700, 13px'],
          ['Contact', 'Mono 400, 10px'],
          ['Bottom rule', '#2563EB → #60A5FA → transparent, 2px'],
        ].map(([k, v]) => (
          <div key={k} className="bg-[#08090D] rounded-xl p-4 border border-white/[0.04]">
            <div className="text-white/25 mb-1" style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em' }}>{k}</div>
            <div className="text-white/60 font-mono" style={{ fontSize: 10 }}>{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// 2d · SOCIAL POST TEMPLATE
// ============================================================================
function SocialPostSection() {
  return (
    <section className="px-12 py-16 border-t border-white/[0.04]">
      <SectionHeader
        id="social-post"
        num="28d"
        title="Social Post Template"
        sub="1080 × 1080px branded announcement template — adaptable for Bangla and English."
      />

      <div className="grid grid-cols-2 gap-8">
        {/* English version */}
        <div>
          <div className="text-white/25 mb-3" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>ENGLISH VARIANT</div>
          <div
            className="rounded-2xl overflow-hidden shadow-2xl relative border border-white/[0.04]"
            style={{ width: '100%', aspectRatio: '1/1', background: '#000000', maxWidth: 440 }}
          >
            <HexPattern opacity={0.02} color="#0D1B3E" />
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(37,99,235,0.06) 0%, transparent 70%)'
            }} />

            <div className="relative z-10 w-full h-full flex flex-col p-[8%]">
              {/* Top: Logo */}
              <div className="flex items-center gap-2.5">
                <Mark size={28} variant="brand-dark" />
                <Word size={12} color="#fff" />
              </div>

              {/* Center: Content zone */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-[5%]">
                {/* Topic tag */}
                <div
                  className="px-3 py-1 rounded-full mb-4"
                  style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)' }}
                >
                  <span className="text-[#60A5FA]" style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em' }}>
                    PRODUCT UPDATE
                  </span>
                </div>

                <div className="text-white" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                  Introducing Intelligent
                  <br />
                  Workflow Automation
                </div>

                <div className="text-white/35 mt-3" style={{ fontSize: 11, lineHeight: 1.6 }}>
                  AI-powered systems that adapt to your business processes in real time.
                </div>

                {/* CTA button */}
                <div className="mt-5 px-5 py-2 rounded-lg" style={{ background: '#2563EB' }}>
                  <span className="text-white" style={{ fontSize: 11, fontWeight: 600 }}>Learn More →</span>
                </div>
              </div>

              {/* Bottom: URL */}
              <div className="flex items-center justify-between">
                <Tagline size={9} />
                <span className="text-white/20 font-mono" style={{ fontSize: 9 }}>sysmoai.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bangla version */}
        <div>
          <div className="text-white/25 mb-3" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>বাংলা VARIANT</div>
          <div
            className="rounded-2xl overflow-hidden shadow-2xl relative border border-white/[0.04]"
            style={{ width: '100%', aspectRatio: '1/1', background: '#000000', maxWidth: 440 }}
          >
            <HexPattern opacity={0.02} color="#0D1B3E" />
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(37,99,235,0.06) 0%, transparent 70%)'
            }} />

            <div className="relative z-10 w-full h-full flex flex-col p-[8%]">
              {/* Top: Logo */}
              <div className="flex items-center gap-2.5">
                <Mark size={28} variant="brand-dark" />
                <Word size={12} color="#fff" />
              </div>

              {/* Center: Content zone — Bangla */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-[5%]">
                <div
                  className="px-3 py-1 rounded-full mb-4"
                  style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)' }}
                >
                  <span className="text-[#60A5FA]" style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em' }}>
                    নতুন আপডেট
                  </span>
                </div>

                <div className="text-white" style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.5 }}>
                  ইন্টেলিজেন্ট ওয়ার্কফ্লো
                  <br />
                  অটোমেশন চালু হয়েছে
                </div>

                <div className="text-white/35 mt-3" style={{ fontSize: 11, lineHeight: 1.7 }}>
                  AI-চালিত সিস্টেম যা রিয়েল টাইমে আপনার ব্যবসায়িক প্রসেসের সাথে মানিয়ে চলে।
                </div>

                <div className="mt-5 px-5 py-2 rounded-lg" style={{ background: '#2563EB' }}>
                  <span className="text-white" style={{ fontSize: 11, fontWeight: 600 }}>আরও জানুন →</span>
                </div>
              </div>

              {/* Bottom: URL */}
              <div className="flex items-center justify-between">
                <Tagline size={9} />
                <span className="text-white/20 font-mono" style={{ fontSize: 9 }}>sysmoai.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template zones spec */}
      <div className="mt-6 bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
        <div className="text-white/25 mb-4" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>TEMPLATE ZONES</div>
        <div className="grid grid-cols-5 gap-4">
          {[
            { zone: 'Top bar', spec: 'Logo + wordmark, 28px mark', height: '8%' },
            { zone: 'Content zone', spec: 'Title + subtitle + CTA, centered', height: '72%' },
            { zone: 'Bottom bar', spec: 'Tagline left, URL right', height: '8%' },
            { zone: 'Padding', spec: '8% all sides', height: '—' },
            { zone: 'Export', spec: '1080×1080px PNG', height: '—' },
          ].map((z) => (
            <div key={z.zone} className="text-center">
              <div className="text-white/60" style={{ fontSize: 12, fontWeight: 600 }}>{z.zone}</div>
              <div className="text-white/25 mt-1" style={{ fontSize: 10 }}>{z.spec}</div>
              {z.height !== '—' && (
                <div className="text-[#60A5FA]/40 font-mono mt-1" style={{ fontSize: 9 }}>h: {z.height}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 2e · PROPOSAL / DOCUMENT COVER
// ============================================================================
function ProposalCoverSection() {
  return (
    <section className="px-12 py-16 border-t border-white/[0.04]">
      <SectionHeader
        id="proposal-cover"
        num="28e"
        title="Proposal / Document Cover"
        sub="A4 format (210 × 297mm) — black header, white title zone with watermark, deep navy footer."
      />

      <div className="grid grid-cols-5 gap-8">
        {/* A4 mockup (3 cols) */}
        <div className="col-span-3 flex justify-center">
          <div
            className="rounded-2xl overflow-hidden shadow-2xl border border-white/[0.06]"
            style={{ width: 380, height: 538, display: 'flex', flexDirection: 'column' }}
          >
            {/* Top 30%: Pure black header */}
            <div className="relative" style={{ height: '30%', background: '#000000' }}>
              <HexPattern opacity={0.015} color="#1E3A8A" />
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 50% 80% at 30% 60%, rgba(37,99,235,0.06) 0%, transparent 70%)'
              }} />
              <div className="relative z-10 w-full h-full flex flex-col justify-between p-7">
                <div className="flex items-center gap-2.5">
                  <Mark size={28} variant="brand-dark" />
                  <Word size={13} color="#fff" />
                </div>
                <Tagline size={10} />
              </div>
            </div>

            {/* Middle: White title zone with hex watermark */}
            <div className="relative flex-1" style={{ background: '#FFFFFF' }}>
              {/* Faded hex watermark */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.035 }}>
                <Mark size={220} variant="brand-light" />
              </div>

              <div className="relative z-10 w-full h-full flex flex-col justify-center p-7">
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: '#2563EB' }} className="mb-3">
                  TECHNICAL PROPOSAL
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: '#000', lineHeight: 1.2 }}>
                  Enterprise AI
                  <br />
                  Infrastructure
                  <br />
                  <span style={{ color: '#2563EB' }}>Assessment</span>
                </div>
                <div className="mt-4 space-y-1">
                  <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.35)' }}>Prepared for: Client Corporation Ltd.</div>
                  <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.25)' }}>March 2026 · Confidential</div>
                </div>
              </div>
            </div>

            {/* Bottom strip: Deep navy */}
            <div className="flex items-center justify-between px-7 py-3" style={{ background: '#0D1B3E' }}>
              <div className="flex items-center gap-2">
                <Mark size={12} variant="mono-white" />
                <span className="text-white/40 font-mono" style={{ fontSize: 8 }}>sysmoai.com</span>
              </div>
              <span className="text-white/20 font-mono" style={{ fontSize: 7 }}>CONFIDENTIAL</span>
            </div>
          </div>
        </div>

        {/* Specs panel (2 cols) */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[#08090D] rounded-xl p-6 border border-white/[0.04]">
            <div className="text-white/25 mb-4" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>LAYOUT STRUCTURE</div>
            <Spec label="Format" value="A4 (210 × 297mm)" />
            <Spec label="Header zone" value="Top 30%, #000000" />
            <Spec label="Title zone" value="Middle 58%, #FFFFFF" />
            <Spec label="Footer strip" value="Bottom 12%, #0D1B3E" />
            <Spec label="Inner margins" value="28px (7mm)" />
          </div>

          <div className="bg-[#08090D] rounded-xl p-6 border border-white/[0.04]">
            <div className="text-white/25 mb-4" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>TYPOGRAPHY</div>
            <Spec label="Document type" value="Space Grotesk 700, 8px" />
            <Spec label="Main title" value="Inter 700, 24px" />
            <Spec label="Accent word" value="#2563EB" />
            <Spec label="Meta info" value="Inter 400, 10px, 35% black" />
          </div>

          <div className="bg-[#08090D] rounded-xl p-6 border border-white/[0.04]">
            <div className="text-white/25 mb-4" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>WATERMARK</div>
            <Spec label="Element" value="Stacked hex icon" />
            <Spec label="Size" value="220px (60% of zone)" />
            <Spec label="Position" value="Right-center in title zone" />
            <Spec label="Opacity" value="3.5%" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 2f · BRAND PATTERN / TEXTURE TILE
// ============================================================================
function BrandPatternSection() {
  return (
    <section className="px-12 py-16 border-t border-white/[0.04]">
      <SectionHeader
        id="brand-pattern"
        num="28f"
        title="Brand Pattern / Texture Tile"
        sub="Repeating hex motif tile at 400 × 400px — #0D1B3E on #000000. Barely visible, luxe depth effect."
      />

      <div className="grid grid-cols-3 gap-8">
        {/* Single tile */}
        <div>
          <div className="text-white/25 mb-3" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>SINGLE TILE (400 × 400)</div>
          <div
            className="rounded-2xl overflow-hidden border border-white/[0.06] relative"
            style={{ width: '100%', aspectRatio: '1/1', background: '#000000' }}
          >
            {/* The actual pattern tile */}
            <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
              <defs>
                <pattern id="brandHex" x="0" y="0" width="80" height="70" patternUnits="userSpaceOnUse">
                  {/* Main hex */}
                  <path
                    d="M20 11.55 L40 0 L60 11.55 L60 34.65 L40 46.2 L20 34.65 Z"
                    fill="none"
                    stroke="#0D1B3E"
                    strokeWidth="0.8"
                  />
                  {/* Inner hex (layer 2 representation) */}
                  <path
                    d="M26 28 L40 20 L54 28 L54 38 L40 46 L26 38 Z"
                    fill="none"
                    stroke="#0D1B3E"
                    strokeWidth="0.5"
                    opacity="0.5"
                  />
                  {/* Core dot (layer 3 representation) */}
                  <path
                    d="M35 35 L40 32 L45 35 L45 40 L40 43 L35 40 Z"
                    fill="#0D1B3E"
                    fillOpacity="0.15"
                    stroke="#0D1B3E"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                  {/* Offset hex for seamless tiling */}
                  <path
                    d="M-20 46.2 L0 34.65 L20 46.2 L20 69.3 L0 80.85 L-20 69.3 Z"
                    fill="none"
                    stroke="#0D1B3E"
                    strokeWidth="0.8"
                    transform="translate(40, 0)"
                  />
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#brandHex)" />
            </svg>
          </div>
        </div>

        {/* Tiled preview (2×2) */}
        <div>
          <div className="text-white/25 mb-3" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>TILED PREVIEW (2×2)</div>
          <div
            className="rounded-2xl overflow-hidden border border-white/[0.06] relative"
            style={{ width: '100%', aspectRatio: '1/1', background: '#000000' }}
          >
            <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
              <defs>
                <pattern id="brandHex2" x="0" y="0" width="80" height="70" patternUnits="userSpaceOnUse">
                  <path d="M20 11.55 L40 0 L60 11.55 L60 34.65 L40 46.2 L20 34.65 Z" fill="none" stroke="#0D1B3E" strokeWidth="0.8" />
                  <path d="M26 28 L40 20 L54 28 L54 38 L40 46 L26 38 Z" fill="none" stroke="#0D1B3E" strokeWidth="0.5" opacity="0.5" />
                  <path d="M35 35 L40 32 L45 35 L45 40 L40 43 L35 40 Z" fill="#0D1B3E" fillOpacity="0.15" stroke="#0D1B3E" strokeWidth="0.3" opacity="0.5" />
                  <path d="M-20 46.2 L0 34.65 L20 46.2 L20 69.3 L0 80.85 L-20 69.3 Z" fill="none" stroke="#0D1B3E" strokeWidth="0.8" transform="translate(40, 0)" />
                </pattern>
              </defs>
              <rect width="800" height="800" fill="url(#brandHex2)" />
            </svg>
            {/* Tile boundary lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'rgba(37,99,235,0.15)' }} />
              <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: 'rgba(37,99,235,0.15)' }} />
            </div>
          </div>
        </div>

        {/* Application example */}
        <div>
          <div className="text-white/25 mb-3" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>APPLIED — CARD BG</div>
          <div
            className="rounded-2xl overflow-hidden border border-white/[0.06] relative flex flex-col justify-between p-8"
            style={{ width: '100%', aspectRatio: '1/1', background: '#000000' }}
          >
            <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0" style={{ opacity: 0.6 }}>
              <defs>
                <pattern id="brandHex3" x="0" y="0" width="80" height="70" patternUnits="userSpaceOnUse">
                  <path d="M20 11.55 L40 0 L60 11.55 L60 34.65 L40 46.2 L20 34.65 Z" fill="none" stroke="#0D1B3E" strokeWidth="0.8" />
                  <path d="M26 28 L40 20 L54 28 L54 38 L40 46 L26 38 Z" fill="none" stroke="#0D1B3E" strokeWidth="0.5" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#brandHex3)" />
            </svg>
            <div className="relative z-10">
              <div className="flex items-center gap-2.5">
                <Mark size={32} variant="brand-dark" />
                <Word size={14} color="#fff" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-white" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                Enterprise AI
                <br />Infrastructure
              </div>
              <div className="text-white/30 mt-2" style={{ fontSize: 10 }}>
                sysmoai.com
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern specs */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {[
          ['Tile size', '400 × 400px'],
          ['Base color', '#000000'],
          ['Motif stroke', '#0D1B3E, 0.8px'],
          ['Export format', 'PNG (transparent) + SVG'],
        ].map(([k, v]) => (
          <div key={k} className="bg-[#08090D] rounded-xl p-4 border border-white/[0.04]">
            <div className="text-white/25 mb-1" style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em' }}>{k}</div>
            <div className="text-white/60 font-mono" style={{ fontSize: 11 }}>{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// MAIN EXPORT — Replaces old ApplicationsSection
// ============================================================================
export function BrandExtensionsSection() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <BusinessCardSection />
      <LinkedInBannerSection />
      <EmailSignatureSection />
      <SocialPostSection />
      <ProposalCoverSection />
      <BrandPatternSection />
    </>
  );
}
