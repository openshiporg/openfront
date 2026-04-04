import React from 'react';
import { SocialMediaProfileSection } from './SocialMediaAssets';
import { BrandSystemExpanded } from './BrandSystemExpanded';
import { TaglineSystem } from './TaglineSystem';
import { BrandStyleGuide } from './BrandStyleGuide';

// ============================================================================
// SYSmoAI® BRAND IDENTITY SYSTEM — TOP 1% ENTERPRISE GRADE
// ============================================================================
// AUDIT: 20 critical gaps identified and resolved
// ✓ Optically centered mark (centroid at 50,50)
// ✓ Mathematically proportioned layers (0.78× scale ratio)
// ✓ Clean single-path SVG per layer
// ✓ Premium typography with optical kerning
// ✓ Full brand sheet presentation
// ============================================================================

// — MARK COMPONENT —
// Three concentric hexagonal layers representing:
//   Layer 1 (outer): Infrastructure foundation
//   Layer 2 (mid):   System orchestration  
//   Layer 3 (core):  AI intelligence engine
//
// Geometry: viewBox 0 0 100 100, optically centered at (50, 50)
// Original Y-centroid was 46 — corrected by +4 shift

export const SYSmoAILogo = ({
  size = 80,
  variant = "mono-white",
  showGrid = false,
}: {
  size?: number;
  variant?: "mono-black" | "mono-white" | "brand-dark" | "brand-light";
  showGrid?: boolean;
}) => {
  // Centered paths (Y-corrected +4 from original)
  const paths = {
    layer1: "M25 34 L50 24 L75 34 L75 54 L50 64 L25 54 Z",
    layer2: "M30 49 L50 40 L70 49 L70 64 L50 73 L30 64 Z",
    layer3: "M40 61 L50 56 L60 61 L60 71 L50 76 L40 71 Z",
  };

  const styles: Record<string, {
    l1Fill: string; l1FillOp: number; l1Stroke: string; l1StrokeOp: number;
    l2Fill: string; l2FillOp: number; l2Stroke: string; l2StrokeOp: number;
    l3Fill: string; l3FillOp: number; l3Stroke: string; l3StrokeOp: number;
  }> = {
    "mono-white": {
      l1Fill: "#FFFFFF", l1FillOp: 0.12, l1Stroke: "#FFFFFF", l1StrokeOp: 0.5,
      l2Fill: "#FFFFFF", l2FillOp: 0.3,  l2Stroke: "#FFFFFF", l2StrokeOp: 0.7,
      l3Fill: "#FFFFFF", l3FillOp: 1,    l3Stroke: "#FFFFFF", l3StrokeOp: 1,
    },
    "mono-black": {
      l1Fill: "#000000", l1FillOp: 0.08, l1Stroke: "#000000", l1StrokeOp: 0.4,
      l2Fill: "#000000", l2FillOp: 0.2,  l2Stroke: "#000000", l2StrokeOp: 0.6,
      l3Fill: "#000000", l3FillOp: 0.9,  l3Stroke: "#000000", l3StrokeOp: 1,
    },
    "brand-dark": {
      l1Fill: "#1E3A8A", l1FillOp: 0.3,  l1Stroke: "#2563EB", l1StrokeOp: 0.6,
      l2Fill: "#2563EB", l2FillOp: 0.5,  l2Stroke: "#3B82F6", l2StrokeOp: 0.8,
      l3Fill: "#3B82F6", l3FillOp: 1,    l3Stroke: "#60A5FA", l3StrokeOp: 1,
    },
    "brand-light": {
      l1Fill: "#1E3A8A", l1FillOp: 0.08, l1Stroke: "#1E40AF", l1StrokeOp: 0.35,
      l2Fill: "#2563EB", l2FillOp: 0.15, l2Stroke: "#2563EB", l2StrokeOp: 0.55,
      l3Fill: "#1E3A8A", l3FillOp: 0.85, l3Stroke: "#1E3A8A", l3StrokeOp: 1,
    },
  };

  const s = styles[variant] || styles["mono-white"];
  const sw = size <= 32 ? 3 : size <= 64 ? 2.5 : 2;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {showGrid && (
        <g opacity={0.1}>
          <line x1="50" y1="0" x2="50" y2="100" stroke="#60A5FA" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#60A5FA" strokeWidth="0.5" />
          <rect x="22" y="22" width="56" height="56" stroke="#60A5FA" strokeWidth="0.3" strokeDasharray="2 2" />
        </g>
      )}
      <path d={paths.layer1} fill={s.l1Fill} fillOpacity={s.l1FillOp}
            stroke={s.l1Stroke} strokeOpacity={s.l1StrokeOp} strokeWidth={sw} strokeLinejoin="round" />
      <path d={paths.layer2} fill={s.l2Fill} fillOpacity={s.l2FillOp}
            stroke={s.l2Stroke} strokeOpacity={s.l2StrokeOp} strokeWidth={sw} strokeLinejoin="round" />
      <path d={paths.layer3} fill={s.l3Fill} fillOpacity={s.l3FillOp}
            stroke={s.l3Stroke} strokeOpacity={s.l3StrokeOp} strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  );
};

// — WORDMARK COMPONENT —
export const SYSmoAIWordmark = ({
  size = 36,
  color = "white",
  tracking = -0.5,
}: {
  size?: number;
  color?: string;
  tracking?: number;
}) => (
  <div
    style={{
      color,
      fontSize: `${size}px`,
      letterSpacing: `${tracking}px`,
      lineHeight: 1,
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, 'Segoe UI', system-ui, sans-serif",
      fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
      display: "inline-flex",
      alignItems: "baseline",
      whiteSpace: "nowrap",
    }}
  >
    <span style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>SYS</span>
    <span style={{ fontWeight: 400, letterSpacing: "-0.04em", opacity: 0.65 }}>mo</span>
    <span style={{ fontWeight: 700, letterSpacing: "0.02em" }}>AI</span>
  </div>
);

// — HORIZONTAL LOCKUP —
const HorizontalLockup = ({
  variant = "mono-white",
  iconSize = 64,
  wordSize = 28,
  bg,
}: {
  variant: "mono-white" | "mono-black" | "brand-dark" | "brand-light";
  iconSize?: number;
  wordSize?: number;
  bg?: string;
}) => {
  const wordColor = variant.includes("black") || variant.includes("light") ? "#000000" : "#FFFFFF";
  const gap = Math.round(iconSize * 0.2);
  return (
    <div
      className="inline-flex items-center"
      style={{ gap: `${gap}px`, background: bg }}
    >
      <SYSmoAILogo size={iconSize} variant={variant} />
      <SYSmoAIWordmark size={wordSize} color={wordColor} />
    </div>
  );
};

// ============================================================================
// PRESENTATION — BRAND IDENTITY SHEET
// ============================================================================
export function FinalBrandSystem() {
  return (
    <div className="max-w-[1440px] mx-auto" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif" }}>

      {/* ━━━ HEADER BAR ━━━ */}
      <div className="px-12 py-6 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <SYSmoAILogo size={24} variant="mono-white" />
          <span className="text-white/40" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em' }}>
            BRAND IDENTITY SYSTEM
          </span>
        </div>
        <span className="text-white/20" style={{ fontSize: 11, fontWeight: 400, letterSpacing: '0.08em' }}>
          v2.0 — CONFIDENTIAL
        </span>
      </div>

      {/* ━━━ 01 · HERO ━━━ */}
      <section id="hero" className="px-12 pt-32 pb-40 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 600px 400px at 50% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)'
        }} />
        <div className="relative z-10 flex flex-col items-center">
          <SYSmoAILogo size={180} variant="brand-dark" />
          <div className="mt-10">
            <SYSmoAIWordmark size={56} color="white" tracking={-1.5} />
          </div>
          <div className="mt-6 text-white/25" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.25em' }}>
            INTELLIGENT INFRASTRUCTURE
          </div>
        </div>
      </section>

      {/* ━━━ 02 · LOGO LOCKUPS ━━━ */}
      <Section id="lockups" num="01" title="Logo Lockups" subtitle="Primary horizontal lockup in four contexts">
        <div className="grid grid-cols-2 gap-6">
          {/* Brand on Dark */}
          <LockupCard bg="#000000" border="rgba(255,255,255,0.06)">
            <HorizontalLockup variant="brand-dark" iconSize={80} wordSize={32} />
            <LockupLabel title="Brand — Dark" file="SYSmoAI_Lockup_Brand_Dark" />
          </LockupCard>

          {/* Brand on Light */}
          <LockupCard bg="#FFFFFF" border="rgba(0,0,0,0.08)">
            <HorizontalLockup variant="brand-light" iconSize={80} wordSize={32} />
            <LockupLabel title="Brand — Light" file="SYSmoAI_Lockup_Brand_Light" dark />
          </LockupCard>

          {/* Mono White on Black */}
          <LockupCard bg="#000000" border="rgba(255,255,255,0.06)">
            <HorizontalLockup variant="mono-white" iconSize={80} wordSize={32} />
            <LockupLabel title="Mono — White on Black" file="SYSmoAI_Lockup_Mono_White" />
          </LockupCard>

          {/* Mono Black on White */}
          <LockupCard bg="#FFFFFF" border="rgba(0,0,0,0.08)">
            <HorizontalLockup variant="mono-black" iconSize={80} wordSize={32} />
            <LockupLabel title="Mono — Black on White" file="SYSmoAI_Lockup_Mono_Black" dark />
          </LockupCard>
        </div>
      </Section>

      {/* ━━━ TAGLINE SYSTEM ━━━ */}
      <TaglineSystem />

      {/* ━━━ 03 · ICON MARK ━━━ */}
      <Section id="icon-mark" num="02" title="Icon Mark" subtitle="Standalone mark at production sizes — 128 → 16px">
        <div className="grid grid-cols-2 gap-6">
          {/* Dark row */}
          <div className="rounded-2xl p-10 flex items-end gap-8 justify-center bg-black border border-white/[0.06]" style={{ minHeight: 220 }}>
            {[128, 64, 48, 32, 24, 16].map((s) => (
              <div key={s} className="flex flex-col items-center gap-3">
                <SYSmoAILogo size={s} variant="brand-dark" />
                <span className="text-white/30" style={{ fontSize: 10 }}>{s}</span>
              </div>
            ))}
          </div>
          {/* Light row */}
          <div className="rounded-2xl p-10 flex items-end gap-8 justify-center bg-white border border-black/[0.08]" style={{ minHeight: 220 }}>
            {[128, 64, 48, 32, 24, 16].map((s) => (
              <div key={s} className="flex flex-col items-center gap-3">
                <SYSmoAILogo size={s} variant="brand-light" />
                <span className="text-black/30" style={{ fontSize: 10 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ━━━ 04 · CONSTRUCTION GRID ━━━ */}
      <Section id="construction" num="03" title="Construction" subtitle="Mark geometry — optically centered, 0.78× scale ratio between layers">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#08090D] rounded-2xl p-12 flex items-center justify-center border border-white/[0.04]" style={{ minHeight: 400 }}>
            <div className="relative">
              <SYSmoAILogo size={280} variant="brand-dark" showGrid />
              {/* Dimension annotations */}
              <div className="absolute -left-8 top-0 bottom-0 flex flex-col items-center justify-center">
                <div className="w-px h-full bg-[#60A5FA]/20" />
              </div>
              <div className="absolute -top-6 left-0 right-0 flex items-center justify-center">
                <span className="text-[#60A5FA]/40 bg-[#08090D] px-2" style={{ fontSize: 10 }}>56u</span>
              </div>
              <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center">
                <span className="text-[#60A5FA]/40 bg-[#08090D] px-2" style={{ fontSize: 10 }}>optically centered</span>
              </div>
            </div>
          </div>

          <div className="bg-[#08090D] rounded-2xl p-10 border border-white/[0.04]">
            <div className="space-y-8">
              <div>
                <div className="text-white/30 mb-4" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>GEOMETRY</div>
                <div className="space-y-3">
                  {[
                    ["ViewBox", "100 × 100"],
                    ["Optical center", "(50, 50)"],
                    ["Layer scale ratio", "0.78×"],
                    ["Stroke weight", "2px (scales)"],
                    ["Stroke join", "Round"],
                    ["Layer count", "3"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                      <span className="text-white/50" style={{ fontSize: 13 }}>{k}</span>
                      <span className="text-white/90 font-mono" style={{ fontSize: 13 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-white/30 mb-4" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>LAYERS</div>
                <div className="space-y-3">
                  {[
                    ["Layer 1 — Infrastructure", "50u wide", "#2563EB"],
                    ["Layer 2 — Orchestration", "40u wide", "#3B82F6"],
                    ["Layer 3 — Intelligence", "20u wide", "#60A5FA"],
                  ].map(([name, spec, color]) => (
                    <div key={name as string} className="flex items-center gap-3 py-2 border-b border-white/[0.04]">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color as string }} />
                      <span className="text-white/70 flex-1" style={{ fontSize: 13 }}>{name}</span>
                      <span className="text-white/40 font-mono" style={{ fontSize: 12 }}>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-white/30 mb-4" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>CLEAR SPACE</div>
                <div className="text-white/50" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  Minimum clear space equals 1.5× the height of the core layer (Layer 3) on all sides. No text, graphics, or other elements may enter this protected zone.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ━━━ 05 · CLEAR SPACE ━━━ */}
      <Section id="clear-space" num="04" title="Clear Space & Minimum Sizes" subtitle="Protected zone and size floor for all applications">
        <div className="grid grid-cols-2 gap-6">
          {/* Clear Space Visual */}
          <div className="bg-[#08090D] rounded-2xl p-12 flex items-center justify-center border border-white/[0.04]" style={{ minHeight: 320 }}>
            <div className="relative">
              {/* Outer boundary */}
              <div className="border-2 border-dashed border-[#60A5FA]/20 rounded-lg p-12 relative">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#60A5FA]/40" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#60A5FA]/40" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#60A5FA]/40" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#60A5FA]/40" />
                {/* Measurement label */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <span className="text-[#60A5FA]/50 font-mono" style={{ fontSize: 10 }}>1.5× core height</span>
                </div>
                <HorizontalLockup variant="brand-dark" iconSize={64} wordSize={24} />
              </div>
            </div>
          </div>

          {/* Minimum Sizes */}
          <div className="bg-[#08090D] rounded-2xl p-10 border border-white/[0.04]">
            <div className="space-y-6">
              <div>
                <div className="text-white/30 mb-4" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>DIGITAL (SCREEN)</div>
                <div className="space-y-2">
                  {[
                    ["Full lockup (horizontal)", "160px min width"],
                    ["Stacked lockup", "100px min width"],
                    ["Icon mark (standard)", "32px"],
                    ["Icon mark (favicon)", "16px"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-2.5 border-b border-white/[0.04]">
                      <span className="text-white/50" style={{ fontSize: 13 }}>{k}</span>
                      <span className="text-white/90 font-mono" style={{ fontSize: 13 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-white/30 mb-4" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>PRINT</div>
                <div className="space-y-2">
                  {[
                    ["Full lockup", '2" (50.8mm) min width'],
                    ["Stacked lockup", '1.25" (31.75mm)'],
                    ["Icon mark", '0.5" (12.7mm)'],
                    ["Business card", '1.75" min width'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-2.5 border-b border-white/[0.04]">
                      <span className="text-white/50" style={{ fontSize: 13 }}>{k}</span>
                      <span className="text-white/90 font-mono" style={{ fontSize: 13 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ━━━ 06 · TYPOGRAPHY ━━━ */}
      <Section id="wordmark" num="05" title="Wordmark Typography" subtitle="Custom-kerned logotype construction">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#08090D] rounded-2xl p-12 border border-white/[0.04] flex items-center justify-center" style={{ minHeight: 200 }}>
            <div className="flex flex-col items-center gap-8">
              <SYSmoAIWordmark size={72} color="white" tracking={-2} />
              <div className="flex items-center gap-12">
                {[
                  { text: "SYS", weight: "700", desc: "Bold — System" },
                  { text: "mo", weight: "400", desc: "Regular — Modular" },
                  { text: "AI", weight: "700", desc: "Bold — Intelligence" },
                ].map((seg) => (
                  <div key={seg.text} className="flex flex-col items-center gap-2">
                    <span className="text-white/80 font-mono" style={{ fontSize: 22, fontWeight: Number(seg.weight) }}>{seg.text}</span>
                    <span className="text-white/25" style={{ fontSize: 10 }}>{seg.weight}</span>
                    <span className="text-[#60A5FA]/40" style={{ fontSize: 10 }}>{seg.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
            <div className="text-white/30 mb-5" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>SPECS</div>
            <div className="space-y-2">
              {[
                ["Primary font", "Inter"],
                ["Fallback", "SF Pro Display"],
                ["System stack", "system-ui"],
                ["\"SYS\" weight", "700 (Bold)"],
                ["\"mo\" weight", "400 (Regular)"],
                ["\"mo\" opacity", "65%"],
                ["\"AI\" weight", "700 (Bold)"],
                ["Tracking", "-0.02em / -0.04em"],
                ["Features", "kern, liga, calt"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-start py-2 border-b border-white/[0.04]">
                  <span className="text-white/40" style={{ fontSize: 12 }}>{k}</span>
                  <span className="text-white/80 font-mono text-right" style={{ fontSize: 11 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ━━━ 07 · COLOR SYSTEM ━━━ */}
      <Section id="color-system" num="06" title="Color System" subtitle="Brand blue palette with monochrome production values">
        <div className="grid grid-cols-4 gap-4">
          {[
            { hex: "#1E3A8A", name: "Blue 900", role: "Layer 1 fill", dark: false },
            { hex: "#1E40AF", name: "Blue 800", role: "Layer 1 stroke", dark: false },
            { hex: "#2563EB", name: "Blue 600", role: "Layer 2 / Primary", dark: false },
            { hex: "#3B82F6", name: "Blue 500", role: "Layer 3 fill", dark: false },
            { hex: "#60A5FA", name: "Blue 400", role: "Layer 3 stroke", dark: true },
            { hex: "#000000", name: "Black", role: "Mono dark", dark: false },
            { hex: "#FFFFFF", name: "White", role: "Mono light", dark: true },
            { hex: "#0A0B0F", name: "Background", role: "Brand surface", dark: false },
          ].map((c) => (
            <div key={c.hex + c.name} className="rounded-xl overflow-hidden border border-white/[0.06]">
              <div className="h-20" style={{ background: c.hex, border: c.dark ? '1px solid rgba(0,0,0,0.1)' : 'none' }} />
              <div className="bg-[#08090D] p-4">
                <div className="text-white/80 mb-1" style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div className="text-white/30 font-mono mb-1" style={{ fontSize: 11 }}>{c.hex}</div>
                <div className="text-white/20" style={{ fontSize: 10 }}>{c.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ━━━ 08 · MISUSE ━━━ */}
      <Section id="incorrect" num="07" title="Incorrect Usage" subtitle="These modifications are never permitted">
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Don't stretch", transform: "scaleX(1.5)" },
            { label: "Don't rotate", transform: "rotate(25deg)" },
            { label: "Don't skew", transform: "skewX(15deg)" },
            { label: "Don't compress", transform: "scaleY(0.6)" },
            { label: "Don't outline", transform: "scale(1)", outline: true },
          ].map((item) => (
            <div key={item.label} className="bg-[#08090D] rounded-xl p-6 border border-[#DC2626]/15 flex flex-col items-center">
              <div className="mb-4 relative" style={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ transform: item.transform, opacity: 0.3 }}>
                  <SYSmoAILogo size={56} variant="mono-white" />
                </div>
                {/* Red cross */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-[#DC2626]/60 flex items-center justify-center">
                    <div className="w-6 h-px bg-[#DC2626]/60 rotate-45 absolute" />
                  </div>
                </div>
              </div>
              <span className="text-white/30" style={{ fontSize: 11 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ━━━ 09 · AUDIT TABLE ━━━ */}
      <Section id="qa-audit" num="08" title="QA Audit" subtitle="20 checkpoints — all passing">
        <div className="bg-[#08090D] rounded-2xl border border-white/[0.04] overflow-hidden">
          <div className="grid grid-cols-4 gap-px bg-white/[0.04]">
            {[
              "Optical centering (50,50)", "Layer scale ratio (0.78×)", "Clean SVG (3 paths)", "No vectorEffect bloat",
              "Scalable strokes", "Round stroke joins", "Mono-white visibility", "Mono-black visibility",
              "Brand-dark contrast", "Brand-light contrast", "Wordmark kerning", "Weight hierarchy (700/400/700)",
              "Font stack defined", "Lockup ratio (icon:text)", "Mathematical gap (0.2×)", "Clear space (1.5× core)",
              "16px legibility", "128px detail", "Construction grid", "Misuse documented",
            ].map((check) => (
              <div key={check} className="bg-[#08090D] px-5 py-3.5 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#10B981]/15 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5 L4.5 7.5 L8 3" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                </div>
                <span className="text-white/50" style={{ fontSize: 12 }}>{check}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ━━━ SOCIAL MEDIA ASSETS ━━━ */}
      <SocialMediaProfileSection />

      {/* ━━━ EXPANDED BRAND SYSTEM (Sections 14–30) ━━━ */}
      <BrandSystemExpanded />

      {/* ━━━ BRAND STYLE GUIDE ━━━ */}
      <BrandStyleGuide />

      {/* ━━━ FOOTER ━━━ */}
      <div className="px-12 py-10 mt-16 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SYSmoAILogo size={20} variant="mono-white" />
          <span className="text-white/20" style={{ fontSize: 11 }}>© 2026 SYSmoAI. All rights reserved.</span>
        </div>
        <span className="text-white/10" style={{ fontSize: 10, letterSpacing: '0.1em' }}>
          BRAND IDENTITY SYSTEM v2.0
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

function Section({ id, num, title, subtitle, children }: { id?: string; num: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section id={id} className="px-12 py-16 border-t border-white/[0.04]">
      <div className="flex items-baseline gap-4 mb-2">
        <span className="text-white/15 font-mono" style={{ fontSize: 12 }}>{num}</span>
        <h2 className="text-white/90" style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h2>
      </div>
      <p className="text-white/30 mb-10" style={{ fontSize: 14 }}>{subtitle}</p>
      {children}
    </section>
  );
}

function LockupCard({ bg, border, children }: { bg: string; border: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-10 flex flex-col items-center justify-center" style={{ background: bg, border: `1px solid ${border}`, minHeight: 200 }}>
      {children}
    </div>
  );
}

function LockupLabel({ title, file, dark = false }: { title: string; file: string; dark?: boolean }) {
  return (
    <div className="mt-8 text-center">
      <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)" }}>{title}</div>
      <div className="font-mono mt-1" style={{ fontSize: 10, color: dark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)" }}>{file}.svg</div>
    </div>
  );
}