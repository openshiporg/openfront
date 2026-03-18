import React from 'react';

// ============================================================================
// SYSmoAI® — BRAND STYLE GUIDE (Task 3)
// ============================================================================
// One full-width reference page: logo versions, colors, typography, taglines,
// clear space, do/don't rules. The "tear sheet" for any designer or vendor.
// ============================================================================

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
    'mono-black':  { f: ['#000','#000','#000'], fo: [.08,.2,.9], s: ['#000','#000','#000'], so: [.4,.6,1] },
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

// ============================================================================
// SUB-SECTIONS
// ============================================================================

function GuideHeading({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-5 rounded-full bg-[#2563EB]" />
      <h3 className="text-white/80" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>{children}</h3>
    </div>
  );
}

function RuleCard({ type, label, children }: { type: 'do' | 'dont'; label: string; children: React.ReactNode }) {
  const isDo = type === 'do';
  return (
    <div className={`rounded-xl border overflow-hidden ${isDo ? 'border-[#10B981]/15' : 'border-[#DC2626]/15'}`}>
      <div className="bg-black p-5 flex items-center justify-center" style={{ minHeight: 100 }}>
        {children}
      </div>
      <div className={`px-4 py-2.5 flex items-center gap-2 ${isDo ? 'bg-[#10B981]/[0.04]' : 'bg-[#DC2626]/[0.04]'}`}>
        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${isDo ? 'bg-[#10B981]/20' : 'bg-[#DC2626]/20'}`}>
          {isDo ? (
            <svg width="7" height="7" viewBox="0 0 10 10"><path d="M2 5 L4.5 7.5 L8 3" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
          ) : (
            <svg width="7" height="7" viewBox="0 0 10 10"><path d="M2.5 2.5 L7.5 7.5 M7.5 2.5 L2.5 7.5" stroke="#DC2626" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
          )}
        </div>
        <span className={`${isDo ? 'text-[#10B981]/70' : 'text-[#DC2626]/70'}`} style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export function BrandStyleGuide() {
  return (
    <section id="brand-style-guide" className="px-12 py-20 border-t border-white/[0.04]">
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Page header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-4">
          <span className="text-white/15 font-mono" style={{ fontSize: 12 }}>50</span>
          <h2 className="text-white/90" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>
            Brand Style Guide
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="text-white/25" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em' }}>REFERENCE SHEET</span>
        </div>
      </div>
      <p className="text-white/30 mb-14" style={{ fontSize: 14 }}>
        Complete quick-reference for designers, vendors, and partners. All rules on one page.
      </p>

      {/* ─── 1. LOGO VERSIONS ─── */}
      <div className="mb-16">
        <GuideHeading>Logo Versions</GuideHeading>
        <div className="grid grid-cols-4 gap-4">
          {/* Primary (Brand Dark) */}
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <div className="bg-black p-6 flex items-center justify-center" style={{ minHeight: 120 }}>
              <div className="flex items-center gap-2.5">
                <Mark size={36} variant="brand-dark" />
                <Word size={15} color="#fff" />
              </div>
            </div>
            <div className="bg-[#08090D] px-4 py-3">
              <div className="text-white/60" style={{ fontSize: 11, fontWeight: 600 }}>Primary</div>
              <div className="text-white/20" style={{ fontSize: 9 }}>Brand on dark backgrounds</div>
            </div>
          </div>

          {/* Reversed (Brand Light) */}
          <div className="rounded-xl overflow-hidden border border-black/[0.1]">
            <div className="bg-white p-6 flex items-center justify-center" style={{ minHeight: 120 }}>
              <div className="flex items-center gap-2.5">
                <Mark size={36} variant="brand-light" />
                <Word size={15} color="#000" opacity1={0.5} />
              </div>
            </div>
            <div className="bg-[#08090D] px-4 py-3">
              <div className="text-white/60" style={{ fontSize: 11, fontWeight: 600 }}>Reversed</div>
              <div className="text-white/20" style={{ fontSize: 9 }}>Brand on light backgrounds</div>
            </div>
          </div>

          {/* Monochrome */}
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <div className="bg-black p-6 flex items-center justify-center" style={{ minHeight: 120 }}>
              <div className="flex items-center gap-2.5">
                <Mark size={36} variant="mono-white" />
                <Word size={15} color="rgba(255,255,255,0.7)" opacity1={0.4} />
              </div>
            </div>
            <div className="bg-[#08090D] px-4 py-3">
              <div className="text-white/60" style={{ fontSize: 11, fontWeight: 600 }}>Monochrome</div>
              <div className="text-white/20" style={{ fontSize: 9 }}>White or black, no brand color</div>
            </div>
          </div>

          {/* Icon Only */}
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <div className="bg-black p-6 flex items-center justify-center" style={{ minHeight: 120 }}>
              <Mark size={52} variant="brand-dark" />
            </div>
            <div className="bg-[#08090D] px-4 py-3">
              <div className="text-white/60" style={{ fontSize: 11, fontWeight: 600 }}>Icon Only</div>
              <div className="text-white/20" style={{ fontSize: 9 }}>App icons, favicons, avatars</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. COLOR SWATCHES ─── */}
      <div className="mb-16">
        <GuideHeading>Color System</GuideHeading>
        <div className="grid grid-cols-7 gap-3">
          {[
            { hex: '#000000', token: '--sysmoai-black', name: 'Black' },
            { hex: '#0D1B3E', token: '--deep-navy', name: 'Deep Navy' },
            { hex: '#1E3A8A', token: '--system-blue', name: 'System Blue' },
            { hex: '#2563EB', token: '--motion-blue', name: 'Motion Blue' },
            { hex: '#60A5FA', token: '--ai-core-blue', name: 'AI Core Blue' },
            { hex: '#FFFFFF', token: '--pure-white', name: 'Pure White' },
            { hex: '#94A3B8', token: '--silver-gray', name: 'Silver Gray' },
          ].map((c) => (
            <div key={c.token} className="rounded-xl overflow-hidden border border-white/[0.06]">
              <div
                className="h-16"
                style={{
                  background: c.hex,
                  border: (c.hex === '#FFFFFF' || c.hex === '#94A3B8') ? '1px solid rgba(0,0,0,0.06)' : 'none',
                }}
              />
              <div className="bg-[#08090D] p-3">
                <div className="text-white/70" style={{ fontSize: 11, fontWeight: 600 }}>{c.name}</div>
                <div className="text-white/30 font-mono mt-0.5" style={{ fontSize: 9 }}>{c.hex}</div>
                <div className="text-[#60A5FA]/30 font-mono mt-0.5" style={{ fontSize: 8 }}>{c.token}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. TYPOGRAPHY SCALE ─── */}
      <div className="mb-16">
        <GuideHeading>Typography Scale</GuideHeading>
        <div className="bg-[#08090D] rounded-2xl border border-white/[0.04] overflow-hidden">
          {[
            { level: 'H1 / Display', font: 'Space Grotesk', weight: '700–800', size: '48–64px', tracking: '-0.03em', sample: 'SYSmoAI Brand', sampleStyle: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 32, letterSpacing: '-0.03em' } },
            { level: 'H2 / Section', font: 'Space Grotesk', weight: '600–700', size: '28–36px', tracking: '-0.02em', sample: 'Systems in Motion', sampleStyle: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 22, letterSpacing: '-0.02em' } },
            { level: 'H3 / Subsection', font: 'Inter', weight: '600', size: '20–24px', tracking: '-0.01em', sample: 'Intelligent Infrastructure', sampleStyle: { fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em' } },
            { level: 'Body', font: 'Inter', weight: '400–500', size: '14–16px', tracking: '0', sample: 'Building the future of AI-powered enterprise systems.', sampleStyle: { fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: 14 } },
            { level: 'Caption', font: 'Inter', weight: '400', size: '11–12px', tracking: '0.01em', sample: 'Dhaka, Bangladesh · Founded 2025', sampleStyle: { fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: 12, letterSpacing: '0.01em', opacity: 0.5 } },
            { level: 'Mono / Technical', font: 'JetBrains Mono', weight: '400–500', size: '12–13px', tracking: '0', sample: '--motion-blue: #2563EB;', sampleStyle: { fontFamily: "'JetBrains Mono',monospace", fontWeight: 400, fontSize: 13 } },
          ].map((t, i) => (
            <div key={t.level} className={`flex items-center px-6 py-5 ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
              <div style={{ width: 140 }} className="flex-shrink-0">
                <div className="text-white/60" style={{ fontSize: 12, fontWeight: 600 }}>{t.level}</div>
                <div className="text-white/20 mt-0.5" style={{ fontSize: 9 }}>{t.font} · {t.weight}</div>
              </div>
              <div style={{ width: 100 }} className="flex-shrink-0 text-center">
                <div className="text-white/30 font-mono" style={{ fontSize: 10 }}>{t.size}</div>
                <div className="text-white/15 font-mono mt-0.5" style={{ fontSize: 9 }}>ls: {t.tracking}</div>
              </div>
              <div className="flex-1 text-white/80 pl-6" style={t.sampleStyle as React.CSSProperties}>
                {t.sample}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. TAGLINE USAGE ─── */}
      <div className="mb-16">
        <GuideHeading>Tagline Usage</GuideHeading>
        <div className="grid grid-cols-2 gap-6">
          {/* Correct tagline examples */}
          <div className="bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
            <div className="text-white/25 mb-5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>APPROVED TAGLINES</div>
            <div className="space-y-5">
              {[
                { id: 'A', text: 'Systems in Motion.', badge: 'PRIMARY', primary: true },
                { id: 'B', text: 'Put Your Business in Motion.', badge: 'MARKETING', primary: false },
                { id: 'C', text: 'Intelligent Systems. Real Results.', badge: 'ENTERPRISE', primary: false },
              ].map((t) => (
                <div key={t.id} className={`rounded-lg p-4 ${t.primary ? 'bg-[#2563EB]/[0.06] border border-[#2563EB]/15' : 'bg-white/[0.02] border border-white/[0.04]'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/15 font-mono" style={{ fontSize: 10 }}>{t.id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded ${t.primary ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-white/[0.04] text-white/25'}`}
                      style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em' }}
                    >
                      {t.badge}
                    </span>
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 300, color: '#94A3B8', letterSpacing: '0.04em' }}>
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-0">
              {[
                ['Font', 'Space Grotesk 300–400'],
                ['Color', '#94A3B8 (Silver Gray)'],
                ['Position', 'Below wordmark, centered'],
                ['Spacing', '0.65× wordmark font-size gap'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                  <span className="text-white/30" style={{ fontSize: 11 }}>{k}</span>
                  <span className="text-white/60 font-mono" style={{ fontSize: 10 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Incorrect tagline usage */}
          <div className="bg-[#08090D] rounded-2xl p-6 border border-[#DC2626]/10">
            <div className="text-[#DC2626]/50 mb-5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>INCORRECT TAGLINE USAGE</div>
            <div className="space-y-4">
              {[
                { label: "Don't modify approved tagline text", bad: '"We Build Smart AI Systems."' },
                { label: "Don't use brand blue for tagline color", bad: 'Color: #2563EB' },
                { label: "Don't use bold weight for tagline", bad: 'Font-weight: 700' },
                { label: "Don't place tagline beside the logo", bad: 'Horizontal tagline layout' },
                { label: "Don't omit the trailing period", bad: '"Systems in Motion"' },
              ].map((r) => (
                <div key={r.label} className="flex items-start gap-3 py-2 border-b border-[#DC2626]/[0.06]">
                  <div className="w-4 h-4 rounded-full bg-[#DC2626]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="7" height="7" viewBox="0 0 10 10"><path d="M2.5 2.5 L7.5 7.5 M7.5 2.5 L2.5 7.5" stroke="#DC2626" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                  </div>
                  <div>
                    <div className="text-white/50" style={{ fontSize: 12 }}>{r.label}</div>
                    <div className="text-[#DC2626]/30 font-mono mt-0.5" style={{ fontSize: 10 }}>{r.bad}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. MINIMUM CLEAR SPACE ─── */}
      <div className="mb-16">
        <GuideHeading>Minimum Clear Space</GuideHeading>
        <div className="grid grid-cols-2 gap-6">
          {/* Visual */}
          <div className="bg-[#08090D] rounded-2xl border border-white/[0.04] flex items-center justify-center p-10" style={{ minHeight: 280 }}>
            <div className="relative">
              {/* Outer clear space boundary */}
              <div className="border-2 border-dashed border-[#60A5FA]/15 p-10 relative">
                {/* Corner markers */}
                {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((pos, i) => (
                  <div key={i} className={`absolute w-3 h-3 border-[#60A5FA]/30 ${pos}`} />
                ))}

                {/* Measurement labels */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <span className="text-[#60A5FA]/35 font-mono bg-[#08090D] px-2" style={{ fontSize: 9 }}>1.5× core height</span>
                </div>
                <div className="absolute -right-20 top-1/2 -translate-y-1/2 rotate-90">
                  <span className="text-[#60A5FA]/35 font-mono bg-[#08090D] px-2" style={{ fontSize: 9 }}>1.5× core</span>
                </div>

                {/* Inner protected zone */}
                <div className="bg-[#2563EB]/[0.03] rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Mark size={48} variant="brand-dark" />
                    <Word size={20} color="#fff" />
                  </div>
                  <div className="mt-2 ml-[60px]" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 300, color: '#94A3B8', letterSpacing: '0.04em' }}>
                    Systems in Motion.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-[#08090D] rounded-2xl border border-white/[0.04] p-8">
            <div className="text-white/25 mb-5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>CLEAR SPACE RULES</div>
            <div className="space-y-4">
              <div className="text-white/45" style={{ fontSize: 13, lineHeight: 1.7 }}>
                The protected zone around the logo lockup equals <strong className="text-white/70">1.5× the height of Layer 3</strong> (the innermost hex core) on all four sides.
              </div>
              <div className="text-white/45" style={{ fontSize: 13, lineHeight: 1.7 }}>
                No typography, imagery, other logos, or graphic elements may enter this zone. The clear space applies to <em>all</em> logo versions — primary, reversed, monochrome, and icon-only.
              </div>
              <div className="h-px bg-white/[0.04] my-4" />
              {[
                ['Full lockup min', '160px (digital) / 2″ (print)'],
                ['Icon mark min', '32px (digital) / 0.5″ (print)'],
                ['Favicon floor', '16 × 16px'],
                ['Safe zone', 'Always maintained in responsive'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                  <span className="text-white/35" style={{ fontSize: 12 }}>{k}</span>
                  <span className="text-white/65 font-mono text-right" style={{ fontSize: 11 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 6. DO / DON'T ─── */}
      <div>
        <GuideHeading>Do / Don't</GuideHeading>
        <div className="grid grid-cols-3 gap-5">
          {/* DO examples */}
          <RuleCard type="do" label="Use approved brand colors only">
            <div className="flex items-center gap-2.5">
              <Mark size={32} variant="brand-dark" />
              <Word size={14} color="#fff" />
            </div>
          </RuleCard>

          <RuleCard type="do" label="Maintain clear space proportions">
            <div className="border border-dashed border-[#60A5FA]/15 p-4 rounded">
              <div className="flex items-center gap-2">
                <Mark size={28} variant="brand-dark" />
                <Word size={12} color="#fff" />
              </div>
            </div>
          </RuleCard>

          <RuleCard type="do" label="Use on black or deep navy backgrounds">
            <div className="flex gap-3">
              <div className="rounded px-3 py-2" style={{ background: '#000' }}>
                <Mark size={24} variant="brand-dark" />
              </div>
              <div className="rounded px-3 py-2" style={{ background: '#0D1B3E' }}>
                <Mark size={24} variant="brand-dark" />
              </div>
            </div>
          </RuleCard>

          {/* DON'T examples */}
          <RuleCard type="dont" label="Don't stretch or distort the logo">
            <div style={{ transform: 'scaleX(1.6)', opacity: 0.35 }}>
              <Mark size={32} variant="mono-white" />
            </div>
          </RuleCard>

          <RuleCard type="dont" label="Don't use on busy photo backgrounds">
            <div className="relative">
              <div className="w-20 h-12 rounded bg-gradient-to-br from-amber-700 to-green-800 opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Mark size={28} variant="mono-white" />
              </div>
            </div>
          </RuleCard>

          <RuleCard type="dont" label="Don't add effects (drop shadow, glow)">
            <div style={{ filter: 'drop-shadow(0 0 12px rgba(37,99,235,0.8))', opacity: 0.4 }}>
              <Mark size={32} variant="brand-dark" />
            </div>
          </RuleCard>
        </div>
      </div>

      {/* ─── Version footer ─── */}
      <div className="mt-16 pt-6 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mark size={16} variant="mono-white" />
          <span className="text-white/20" style={{ fontSize: 10 }}>
            SYSmoAI Brand Style Guide — v2.0 — March 2026
          </span>
        </div>
        <span className="text-white/10 font-mono" style={{ fontSize: 9, letterSpacing: '0.1em' }}>
          CONFIDENTIAL · DO NOT DISTRIBUTE WITHOUT AUTHORIZATION
        </span>
      </div>
    </section>
  );
}
