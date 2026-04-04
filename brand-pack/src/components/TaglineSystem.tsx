import React, { useState } from 'react';
import { SYSmoAILogo, SYSmoAIWordmark } from './FinalBrandSystem';

// ============================================================================
// TAGLINE SYSTEM — SYSmoAI Brand Identity
// ============================================================================
// Three approved taglines with lockup presentations, spacing specs,
// and usage guidelines. Typography: Space Grotesk 300–400, #94A3B8.
// ============================================================================

const TAGLINES = [
  {
    id: 'A',
    text: 'Systems in Motion.',
    label: 'PRIMARY',
    description: 'Default tagline for all applications. Use this unless a specific context demands an alternative.',
    recommended: true,
  },
  {
    id: 'B',
    text: 'Put Your Business in Motion.',
    label: 'MARKETING',
    description: 'Action-oriented variant for campaigns, landing pages, and sales materials. Directly addresses the client.',
    recommended: false,
  },
  {
    id: 'C',
    text: 'Intelligent Systems. Real Results.',
    label: 'ENTERPRISE',
    description: 'B2B-focused variant for proposals, decks, and enterprise communications. Outcome-driven messaging.',
    recommended: false,
  },
];

// Hex motif background pattern (subtle, uses brand hex shapes)
function HexMotifBg({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Scattered hex shapes */}
      {[
        { x: '10%', y: '20%', size: 120, rot: 15 },
        { x: '80%', y: '15%', size: 80, rot: -10 },
        { x: '60%', y: '70%', size: 100, rot: 30 },
        { x: '25%', y: '75%', size: 60, rot: -20 },
        { x: '90%', y: '60%', size: 90, rot: 5 },
      ].map((h, i) => (
        <svg
          key={i}
          width={h.size}
          height={h.size}
          viewBox="0 0 100 100"
          fill="none"
          className="absolute"
          style={{
            left: h.x,
            top: h.y,
            transform: `translate(-50%, -50%) rotate(${h.rot}deg)`,
            opacity,
          }}
        >
          <path
            d="M25 34 L50 24 L75 34 L75 54 L50 64 L25 54 Z"
            stroke="#2563EB"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
        </svg>
      ))}
    </div>
  );
}

// Tagline text component with Space Grotesk
function TaglineText({
  text,
  size = 18,
  weight = 300,
  color = '#94A3B8',
  letterSpacing = '0.04em',
}: {
  text: string;
  size?: number;
  weight?: number;
  color?: string;
  letterSpacing?: string;
}) {
  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing,
        lineHeight: 1.4,
      }}
    >
      {text}
    </div>
  );
}

// Full lockup: Logo mark + wordmark + tagline
function TaglineLockup({
  tagline,
  iconSize = 72,
  wordSize = 28,
  taglineSize = 16,
  variant = 'brand-dark',
  showDimensions = false,
}: {
  tagline: string;
  iconSize?: number;
  wordSize?: number;
  taglineSize?: number;
  variant?: 'brand-dark' | 'mono-white';
  showDimensions?: boolean;
}) {
  const gap = Math.round(iconSize * 0.2);
  const taglineGap = Math.round(wordSize * 0.65);

  return (
    <div className="flex flex-col items-center relative">
      {/* Logo + Wordmark row */}
      <div className="inline-flex items-center" style={{ gap }}>
        <SYSmoAILogo size={iconSize} variant={variant} />
        <SYSmoAIWordmark size={wordSize} color="#FFFFFF" />
      </div>

      {/* Spacing indicator */}
      {showDimensions && (
        <div className="w-full flex items-center justify-center" style={{ height: taglineGap }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-[#60A5FA]/20" />
            <span className="text-[#60A5FA]/30 font-mono" style={{ fontSize: 9 }}>
              {taglineGap}px
            </span>
            <div className="w-8 h-px bg-[#60A5FA]/20" />
          </div>
        </div>
      )}

      {/* Tagline */}
      <div style={{ marginTop: showDimensions ? 0 : taglineGap }}>
        <TaglineText text={tagline} size={taglineSize} />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export function TaglineSystem() {
  const [activeTagline, setActiveTagline] = useState(0);

  return (
    <section id="tagline-system" className="px-12 py-16 border-t border-white/[0.04]">
      {/* Google Fonts import for Space Grotesk */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Section header */}
      <div className="flex items-baseline gap-4 mb-2">
        <span className="text-white/15 font-mono" style={{ fontSize: 12 }}>01b</span>
        <h2 className="text-white/90" style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>
          Tagline System
        </h2>
      </div>
      <p className="text-white/30 mb-10" style={{ fontSize: 14 }}>
        Three approved taglines — primary, marketing, and enterprise variants. Space Grotesk 300, silver-gray on dark.
      </p>

      {/* ─── PRIMARY LOCKUP HERO ─── */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.04] mb-8 relative" style={{ background: '#000000' }}>
        <HexMotifBg opacity={0.025} />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 500px 300px at 50% 45%, rgba(37,99,235,0.05) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center py-24 px-12">
          {/* Recommended badge */}
          <div className="mb-10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: '#10B981',
              }}
            >
              PRIMARY RECOMMENDED
            </span>
          </div>

          <TaglineLockup
            tagline="Systems in Motion."
            iconSize={96}
            wordSize={38}
            taglineSize={20}
            variant="brand-dark"
            showDimensions
          />

          {/* File reference */}
          <div className="mt-12 text-white/15 font-mono" style={{ fontSize: 10 }}>
            SYSmoAI_Lockup_Tagline_Primary.svg
          </div>
        </div>
      </div>

      {/* ─── ALL THREE TAGLINES GRID ─── */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {TAGLINES.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActiveTagline(i)}
            className={`
              rounded-2xl border transition-all duration-300 text-left relative overflow-hidden
              ${activeTagline === i
                ? 'border-[#2563EB]/40 bg-[#2563EB]/[0.04]'
                : 'border-white/[0.04] bg-[#08090D] hover:border-white/[0.08]'
              }
            `}
          >
            {/* Card content */}
            <div className="p-8 flex flex-col items-center text-center">
              {/* Variant badge */}
              <div className="flex items-center gap-2 mb-8">
                <span
                  className={`
                    px-2 py-0.5 rounded
                    ${t.recommended
                      ? 'bg-[#10B981]/10 text-[#10B981]'
                      : 'bg-white/[0.04] text-white/30'
                    }
                  `}
                  style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}
                >
                  {t.label}
                </span>
                <span className="text-white/15 font-mono" style={{ fontSize: 10 }}>
                  OPTION {t.id}
                </span>
              </div>

              {/* Mini lockup */}
              <div className="flex flex-col items-center">
                <SYSmoAILogo size={48} variant="brand-dark" />
                <div className="mt-3">
                  <SYSmoAIWordmark size={18} color="#FFFFFF" />
                </div>
                <div className="mt-4">
                  <TaglineText text={t.text} size={13} weight={300} letterSpacing="0.03em" />
                </div>
              </div>

              {/* Description */}
              <p className="mt-8 text-white/25" style={{ fontSize: 11, lineHeight: 1.6 }}>
                {t.description}
              </p>
            </div>

            {/* Active indicator */}
            {activeTagline === i && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, #2563EB, transparent)',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ─── TYPOGRAPHY SPECS ─── */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Tagline Typography */}
        <div className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <div className="text-white/30 mb-6" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>
            TAGLINE TYPOGRAPHY
          </div>

          {/* Type specimen */}
          <div className="mb-8 space-y-6">
            <div>
              <div className="text-white/20 mb-2" style={{ fontSize: 9, letterSpacing: '0.1em' }}>WEIGHT 300 (LIGHT) — DEFAULT</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 300, color: '#94A3B8', letterSpacing: '0.04em' }}>
                Systems in Motion.
              </div>
            </div>
            <div>
              <div className="text-white/20 mb-2" style={{ fontSize: 9, letterSpacing: '0.1em' }}>WEIGHT 400 (REGULAR) — ALTERNATE</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 400, color: '#94A3B8', letterSpacing: '0.04em' }}>
                Systems in Motion.
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="space-y-1">
            {[
              ['Font family', 'Space Grotesk'],
              ['Weight range', '300–400'],
              ['Recommended weight', '300 (Light)'],
              ['Color', '#94A3B8 (Silver Gray)'],
              ['Letter spacing', '0.04em'],
              ['Line height', '1.4'],
              ['Case', 'Title Case with period'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-white/[0.04]">
                <span className="text-white/40" style={{ fontSize: 12 }}>{k}</span>
                <span className="text-white/80 font-mono" style={{ fontSize: 11 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spacing Rules */}
        <div className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <div className="text-white/30 mb-6" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>
            SPACING & POSITIONING
          </div>

          {/* Visual spacing diagram */}
          <div className="rounded-xl bg-black border border-white/[0.04] p-8 mb-8 flex flex-col items-center">
            {/* Wordmark */}
            <div className="flex items-center gap-3">
              <SYSmoAILogo size={32} variant="brand-dark" />
              <SYSmoAIWordmark size={16} color="#FFFFFF" />
            </div>

            {/* Spacing annotation */}
            <div className="flex items-center gap-1 my-1">
              <div className="w-px h-3 bg-[#60A5FA]/25" />
              <span className="text-[#60A5FA]/30 font-mono" style={{ fontSize: 8 }}>0.65× wordmark size</span>
              <div className="w-px h-3 bg-[#60A5FA]/25" />
            </div>

            {/* Tagline */}
            <TaglineText text="Systems in Motion." size={11} weight={300} letterSpacing="0.03em" />

            {/* Bottom clearance */}
            <div className="flex items-center gap-1 mt-1">
              <div className="w-px h-3 bg-[#60A5FA]/15" />
              <span className="text-[#60A5FA]/20 font-mono" style={{ fontSize: 8 }}>clear space</span>
              <div className="w-px h-3 bg-[#60A5FA]/15" />
            </div>
          </div>

          <div className="space-y-1">
            {[
              ['Gap (logo → tagline)', '0.65× wordmark font-size'],
              ['Alignment', 'Center-aligned to lockup'],
              ['Max width', '280% of icon width'],
              ['Min size (digital)', '11px'],
              ['Min size (print)', '7pt'],
              ['Bottom clear space', '1.5× tagline font-size'],
              ['Tagline position', 'Below wordmark, never beside'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-white/[0.04]">
                <span className="text-white/40" style={{ fontSize: 12 }}>{k}</span>
                <span className="text-white/80 font-mono text-right" style={{ fontSize: 11 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── USAGE: CORRECT / INCORRECT ─── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Correct Usage */}
        <div className="bg-[#08090D] rounded-2xl border border-white/[0.04] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#10B981]/15 flex items-center justify-center flex-shrink-0">
              <svg width="8" height="8" viewBox="0 0 10 10">
                <path d="M2 5 L4.5 7.5 L8 3" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[#10B981]/80" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em' }}>
              CORRECT USAGE
            </span>
          </div>
          <div className="p-6 space-y-4">
            {[
              {
                desc: 'Centered below full lockup on black',
                content: (
                  <div className="bg-black rounded-lg p-6 flex flex-col items-center">
                    <div className="flex items-center gap-3">
                      <SYSmoAILogo size={36} variant="brand-dark" />
                      <SYSmoAIWordmark size={16} color="#FFFFFF" />
                    </div>
                    <div className="mt-3">
                      <TaglineText text="Systems in Motion." size={11} weight={300} />
                    </div>
                  </div>
                ),
              },
              {
                desc: 'Below stacked mark, generous spacing',
                content: (
                  <div className="bg-black rounded-lg p-6 flex flex-col items-center">
                    <SYSmoAILogo size={44} variant="brand-dark" />
                    <div className="mt-2">
                      <SYSmoAIWordmark size={14} color="#FFFFFF" />
                    </div>
                    <div className="mt-3">
                      <TaglineText text="Systems in Motion." size={10} weight={300} />
                    </div>
                  </div>
                ),
              },
              {
                desc: 'Silver gray (#94A3B8) on deep navy',
                content: (
                  <div className="rounded-lg p-6 flex flex-col items-center" style={{ background: '#0D1B3E' }}>
                    <div className="flex items-center gap-3">
                      <SYSmoAILogo size={32} variant="brand-dark" />
                      <SYSmoAIWordmark size={14} color="#FFFFFF" />
                    </div>
                    <div className="mt-3">
                      <TaglineText text="Systems in Motion." size={10} weight={300} color="#94A3B8" />
                    </div>
                  </div>
                ),
              },
            ].map((ex) => (
              <div key={ex.desc}>
                {ex.content}
                <div className="text-white/25 mt-2" style={{ fontSize: 10 }}>{ex.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Incorrect Usage */}
        <div className="bg-[#08090D] rounded-2xl border border-[#DC2626]/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DC2626]/10 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#DC2626]/15 flex items-center justify-center flex-shrink-0">
              <svg width="8" height="8" viewBox="0 0 10 10">
                <path d="M2 2 L8 8 M8 2 L2 8" stroke="#DC2626" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[#DC2626]/80" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em' }}>
              INCORRECT USAGE
            </span>
          </div>
          <div className="p-6 space-y-4">
            {[
              {
                desc: 'Don\'t place tagline beside the wordmark',
                content: (
                  <div className="bg-black rounded-lg p-6 flex items-center justify-center relative">
                    <div className="flex items-center gap-3 opacity-40">
                      <SYSmoAILogo size={32} variant="brand-dark" />
                      <SYSmoAIWordmark size={14} color="#FFFFFF" />
                      <div className="w-px h-4 bg-white/20" />
                      <TaglineText text="Systems in Motion." size={10} weight={300} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[#DC2626]/50 flex items-center justify-center">
                        <div className="w-5 h-px bg-[#DC2626]/50 rotate-45 absolute" />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                desc: 'Don\'t use white or brand blue for tagline text',
                content: (
                  <div className="bg-black rounded-lg p-6 flex flex-col items-center relative">
                    <div className="flex items-center gap-3 opacity-40">
                      <SYSmoAILogo size={32} variant="brand-dark" />
                      <SYSmoAIWordmark size={14} color="#FFFFFF" />
                    </div>
                    <div className="mt-3 opacity-40">
                      <TaglineText text="Systems in Motion." size={10} weight={300} color="#2563EB" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[#DC2626]/50 flex items-center justify-center">
                        <div className="w-5 h-px bg-[#DC2626]/50 rotate-45 absolute" />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                desc: 'Don\'t use unapproved tagline copy',
                content: (
                  <div className="bg-black rounded-lg p-6 flex flex-col items-center relative">
                    <div className="flex items-center gap-3 opacity-40">
                      <SYSmoAILogo size={32} variant="brand-dark" />
                      <SYSmoAIWordmark size={14} color="#FFFFFF" />
                    </div>
                    <div className="mt-3 opacity-40">
                      <TaglineText text="We Do AI Stuff." size={10} weight={300} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[#DC2626]/50 flex items-center justify-center">
                        <div className="w-5 h-px bg-[#DC2626]/50 rotate-45 absolute" />
                      </div>
                    </div>
                  </div>
                ),
              },
            ].map((ex) => (
              <div key={ex.desc}>
                {ex.content}
                <div className="text-white/25 mt-2" style={{ fontSize: 10 }}>{ex.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CONTEXTUAL APPLICATION EXAMPLES ─── */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        {/* Dark presentation slide */}
        <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
          <div className="bg-black p-8 flex flex-col items-center justify-center relative" style={{ aspectRatio: '16/10' }}>
            <HexMotifBg opacity={0.015} />
            <div className="relative z-10 flex flex-col items-center">
              <SYSmoAILogo size={56} variant="brand-dark" />
              <div className="mt-3">
                <SYSmoAIWordmark size={20} color="#FFFFFF" />
              </div>
              <div className="mt-4">
                <TaglineText text="Systems in Motion." size={12} weight={300} />
              </div>
            </div>
          </div>
          <div className="bg-[#08090D] px-4 py-3">
            <div className="text-white/50" style={{ fontSize: 11 }}>Presentation Title Slide</div>
            <div className="text-white/20 font-mono" style={{ fontSize: 9 }}>16:10 · Dark variant</div>
          </div>
        </div>

        {/* Deep navy hero section */}
        <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
          <div className="p-8 flex flex-col justify-end relative" style={{ aspectRatio: '16/10', background: 'linear-gradient(180deg, #000000 0%, #0D1B3E 100%)' }}>
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-3">
                <SYSmoAILogo size={28} variant="brand-dark" />
                <SYSmoAIWordmark size={12} color="#FFFFFF" />
              </div>
              <TaglineText text="Systems in Motion." size={11} weight={300} />
              <div className="mt-3 flex items-center gap-3">
                <div className="px-3 py-1 rounded bg-[#2563EB] text-white" style={{ fontSize: 9, fontWeight: 600 }}>
                  Get Started
                </div>
                <span className="text-white/30" style={{ fontSize: 9 }}>sysmoai.com</span>
              </div>
            </div>
          </div>
          <div className="bg-[#08090D] px-4 py-3">
            <div className="text-white/50" style={{ fontSize: 11 }}>Website Hero Section</div>
            <div className="text-white/20 font-mono" style={{ fontSize: 9 }}>Gradient bg · Left-aligned</div>
          </div>
        </div>

        {/* Minimal footer treatment */}
        <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
          <div className="bg-black p-8 flex flex-col justify-between relative" style={{ aspectRatio: '16/10' }}>
            <div />
            <div className="flex flex-col items-center">
              <div className="w-12 h-px bg-[#2563EB]/30 mb-4" />
              <TaglineText text="Systems in Motion." size={11} weight={400} />
              <div className="mt-2 flex items-center gap-2">
                <SYSmoAILogo size={14} variant="mono-white" />
                <span className="text-white/20" style={{ fontSize: 9, fontFamily: "'Space Grotesk', sans-serif" }}>
                  sysmoai.com
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#08090D] px-4 py-3">
            <div className="text-white/50" style={{ fontSize: 11 }}>Minimal Footer / Sign-off</div>
            <div className="text-white/20 font-mono" style={{ fontSize: 9 }}>Tagline-first · Subtle</div>
          </div>
        </div>
      </div>
    </section>
  );
}
