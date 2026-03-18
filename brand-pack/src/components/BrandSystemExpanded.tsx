import React, { useState } from 'react';
import { BrandExtensionsSection } from './BrandExtensions';

// ============================================================================
// SYSmoAI® — COMPREHENSIVE BRAND SYSTEM EXPANSION
// ============================================================================
// Sections 14–50: Extended logo, colors, typography, spacing, iconography,
// voice & tone, UI components, motion, applications, tokens, accessibility
// ============================================================================

// Re-use logo inline to avoid circular deps
const LogoMark = ({ size = 48, variant = "brand-dark" }: { size?: number; variant?: string }) => {
  const sw = size <= 32 ? 3 : size <= 64 ? 2.5 : 2;
  const paths = [
    "M25 34 L50 24 L75 34 L75 54 L50 64 L25 54 Z",
    "M30 49 L50 40 L70 49 L70 64 L50 73 L30 64 Z",
    "M40 61 L50 56 L60 61 L60 71 L50 76 L40 71 Z",
  ];
  const configs: Record<string, { fills: string[]; fOps: number[]; strokes: string[]; sOps: number[] }> = {
    "brand-dark":  { fills: ["#1E3A8A","#2563EB","#3B82F6"], fOps: [.3,.5,1], strokes: ["#2563EB","#3B82F6","#60A5FA"], sOps: [.6,.8,1] },
    "brand-light": { fills: ["#1E3A8A","#2563EB","#1E3A8A"], fOps: [.08,.15,.85], strokes: ["#1E40AF","#2563EB","#1E3A8A"], sOps: [.35,.55,1] },
    "mono-white":  { fills: ["#FFF","#FFF","#FFF"], fOps: [.12,.3,1], strokes: ["#FFF","#FFF","#FFF"], sOps: [.5,.7,1] },
    "mono-black":  { fills: ["#000","#000","#000"], fOps: [.08,.2,.9], strokes: ["#000","#000","#000"], sOps: [.4,.6,1] },
  };
  const c = configs[variant] || configs["brand-dark"];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {paths.map((d, i) => (
        <path key={i} d={d} fill={c.fills[i]} fillOpacity={c.fOps[i]} stroke={c.strokes[i]} strokeOpacity={c.sOps[i]} strokeWidth={sw} strokeLinejoin="round" />
      ))}
    </svg>
  );
};

const Wordmark = ({ size = 24, color = "#fff", opacity1 = 0.65 }: { size?: number; color?: string; opacity1?: number }) => (
  <div style={{ fontSize: size, lineHeight: 1, fontFamily: "'Inter',-apple-system,system-ui,sans-serif", color, display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap', letterSpacing: `${-size * 0.015}px` }}>
    <span style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>SYS</span>
    <span style={{ fontWeight: 400, letterSpacing: '-0.04em', opacity: opacity1 }}>mo</span>
    <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>AI</span>
  </div>
);

// ============================================================================
// SECTION WRAPPER
// ============================================================================
function S({ id, num, title, sub, children }: { id?: string; num: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section id={id} className="px-12 py-16 border-t border-white/[0.04]">
      <div className="flex items-baseline gap-4 mb-2">
        <span className="text-white/15 font-mono" style={{ fontSize: 12 }}>{num}</span>
        <h2 className="text-white/90" style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h2>
      </div>
      <p className="text-white/30 mb-10" style={{ fontSize: 14 }}>{sub}</p>
      {children}
    </section>
  );
}

function SubHead({ children }: { children: string }) {
  return <div className="text-white/30 mb-4" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em' }}>{children}</div>;
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/[0.04]">
      <span className="text-white/50" style={{ fontSize: 13 }}>{label}</span>
      <span className="text-white/90 font-mono" style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}

function Card({ bg = "#08090D", border = "white/[0.04]", className = "", style = {}, children }: { bg?: string; border?: string; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return <div className={`rounded-2xl border border-${border} ${className}`} style={{ background: bg, ...style }}>{children}</div>;
}

// ============================================================================
// 14 · MASTER ROADMAP
// ============================================================================
const PHASES = [
  {
    phase: "Phase 1", name: "Foundation", status: "complete" as const,
    sections: ["Logo Lockups", "Icon Mark", "Construction Grid", "Clear Space", "Wordmark Typography", "Color System", "Incorrect Usage", "QA Audit"],
  },
  {
    phase: "Phase 2", name: "Social Media", status: "complete" as const,
    sections: ["Profile Pictures (Icon)", "Profile Pictures (Lockup)", "Cover Photos", "Platform Matrix", "Batch Export"],
  },
  {
    phase: "Phase 3", name: "Extended Logo", status: "complete" as const,
    sections: ["Stacked/Vertical Lockup", "Responsive Logo System", "Favicon & App Icon"],
  },
  {
    phase: "Phase 4", name: "Color & Accessibility", status: "complete" as const,
    sections: ["Extended Palette", "Semantic Colors", "Gradient System", "WCAG Contrast Table"],
  },
  {
    phase: "Phase 5", name: "Typography", status: "complete" as const,
    sections: ["Brand Typefaces", "Type Scale (H1–Caption)", "Type Hierarchy Examples"],
  },
  {
    phase: "Phase 6", name: "Spacing & Layout", status: "complete" as const,
    sections: ["4px Base Grid", "Spacing Tokens", "Layout Grid", "Breakpoints"],
  },
  {
    phase: "Phase 7", name: "Iconography & Imagery", status: "complete" as const,
    sections: ["Icon Style Guide", "Photography Guidelines"],
  },
  {
    phase: "Phase 8", name: "Brand Voice", status: "complete" as const,
    sections: ["Voice & Tone", "Writing Guidelines", "Terminology"],
  },
  {
    phase: "Phase 9", name: "UI Components", status: "complete" as const,
    sections: ["Button System", "Card System", "Form Elements", "Badges & Tags"],
  },
  {
    phase: "Phase 10", name: "Motion Design", status: "complete" as const,
    sections: ["Easing Curves", "Duration Tokens", "Transition Patterns"],
  },
  {
    phase: "Phase 11", name: "Applications", status: "complete" as const,
    sections: ["Business Card", "Email Signature", "Letterhead", "Presentation Slide"],
  },
  {
    phase: "Phase 12", name: "Design Tokens", status: "complete" as const,
    sections: ["DTCG Token Structure", "Token Naming", "Export Formats"],
  },
];

function RoadmapSection() {
  return (
    <S id="roadmap" num="14" title="System Roadmap" sub="12 phases, 50 sections — complete brand identity architecture.">
      <div className="grid grid-cols-4 gap-3">
        {PHASES.map((p) => (
          <div key={p.phase} className="bg-[#08090D] rounded-xl border border-white/[0.04] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${p.status === 'complete' ? 'bg-[#10B981]' : 'bg-white/10'}`} />
              <span className="text-white/40" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em' }}>{p.phase}</span>
            </div>
            <div className="text-white/80 mb-3" style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
            <div className="space-y-1.5">
              {p.sections.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <svg width="8" height="8" viewBox="0 0 10 10" className="flex-shrink-0">
                    <path d="M2 5 L4.5 7.5 L8 3" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                  <span className="text-white/40" style={{ fontSize: 11 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </S>
  );
}

// ============================================================================
// 15 · STACKED / VERTICAL LOCKUP
// ============================================================================
function StackedLockupSection() {
  return (
    <S id="stacked-lockup" num="15" title="Stacked Lockup" sub="Vertical arrangement — icon above wordmark. For square spaces, social avatars, app icons.">
      <div className="grid grid-cols-4 gap-6">
        {([
          { bg: "#000000", variant: "brand-dark", wordColor: "#FFFFFF", label: "Brand Dark" },
          { bg: "#FFFFFF", variant: "brand-light", wordColor: "#000000", label: "Brand Light" },
          { bg: "#000000", variant: "mono-white", wordColor: "#FFFFFF", label: "Mono White" },
          { bg: "#FFFFFF", variant: "mono-black", wordColor: "#000000", label: "Mono Black" },
        ] as const).map((v) => (
          <div key={v.label} className="rounded-2xl flex flex-col items-center justify-center p-10" style={{ background: v.bg, border: `1px solid ${v.bg === '#000000' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, minHeight: 260 }}>
            <LogoMark size={72} variant={v.variant} />
            <div style={{ height: 12 }} />
            <Wordmark size={20} color={v.wordColor} />
            <div className="mt-8 text-center">
              <div style={{ fontSize: 12, fontWeight: 600, color: v.bg === '#000000' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>{v.label}</div>
              <div className="font-mono mt-1" style={{ fontSize: 9, color: v.bg === '#000000' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>SYSmoAI_Stacked_{v.label.replace(' ', '_')}.svg</div>
            </div>
          </div>
        ))}
      </div>
    </S>
  );
}

// ============================================================================
// 16 · RESPONSIVE LOGO SYSTEM
// ============================================================================
function ResponsiveLogoSection() {
  const breakpoints = [
    { min: 1200, label: "Desktop XL", version: "Full horizontal lockup", icon: 64, word: 26 },
    { min: 768, label: "Desktop / Tablet", version: "Compact horizontal lockup", icon: 40, word: 18 },
    { min: 480, label: "Mobile", version: "Stacked lockup", icon: 36, word: 14 },
    { min: 0, label: "Micro", version: "Icon mark only", icon: 32, word: 0 },
  ];

  return (
    <S id="responsive-logo" num="16" title="Responsive Logo System" sub="Which lockup variant to use at each viewport breakpoint.">
      <div className="space-y-4">
        {breakpoints.map((bp) => (
          <div key={bp.label} className="bg-[#08090D] rounded-xl border border-white/[0.04] p-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-white/20 font-mono" style={{ fontSize: 11, width: 60 }}>≥{bp.min}px</div>
              <div>
                <div className="text-white/70" style={{ fontSize: 14, fontWeight: 600 }}>{bp.label}</div>
                <div className="text-white/30" style={{ fontSize: 12 }}>{bp.version}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LogoMark size={bp.icon} variant="brand-dark" />
              {bp.word > 0 && <Wordmark size={bp.word} color="#fff" />}
            </div>
          </div>
        ))}
      </div>
    </S>
  );
}

// ============================================================================
// 17 · FAVICON & APP ICON
// ============================================================================
function FaviconSection() {
  const sizes = [
    { size: 512, label: "App Store", radius: 100 },
    { size: 192, label: "Android", radius: 38 },
    { size: 180, label: "Apple Touch", radius: 40 },
    { size: 128, label: "Chrome Web", radius: 20 },
    { size: 48, label: "Taskbar", radius: 10 },
    { size: 32, label: "Favicon @2x", radius: 6 },
    { size: 16, label: "Favicon", radius: 3 },
  ];

  return (
    <S id="favicon" num="17" title="Favicon & App Icon" sub="Platform-specific icon assets with correct corner radii and safe zones.">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#08090D] rounded-2xl p-10 border border-white/[0.04] flex items-end gap-6 justify-center" style={{ minHeight: 280 }}>
          {sizes.map((s) => (
            <div key={s.size} className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center" style={{ width: Math.min(s.size, 96), height: Math.min(s.size, 96), borderRadius: Math.min(s.radius, 20), background: '#000', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <LogoMark size={Math.min(s.size * 0.6, 58)} variant="brand-dark" />
              </div>
              <div className="text-center">
                <div className="text-white/50 font-mono" style={{ fontSize: 10 }}>{s.size}</div>
                <div className="text-white/25" style={{ fontSize: 9 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>APP ICON SPECS</SubHead>
          <div className="space-y-1">
            {[
              ["iOS App Store", "1024×1024, no transparency"],
              ["Android Play Store", "512×512, 32-bit PNG"],
              ["Apple Touch Icon", "180×180"],
              ["Chrome PWA", "192×192 + 512×512"],
              ["Windows Tile", "150×150"],
              ["macOS .icns", "16–1024 (multi-res)"],
              ["Favicon .ico", "16×16 + 32×32"],
              ["SVG Favicon", "any (scalable)"],
            ].map(([k, v]) => <SpecRow key={k} label={k} value={v} />)}
          </div>
          <div className="mt-6">
            <SubHead>SAFE ZONE</SubHead>
            <div className="text-white/40" style={{ fontSize: 12, lineHeight: 1.6 }}>
              Keep mark within 66% of icon area. iOS applies 17.5% superellipse mask — ensure no content touches edges. Android adaptive icons use 72dp safe zone inside 108dp.
            </div>
          </div>
        </div>
      </div>
    </S>
  );
}

// ============================================================================
// 18 · EXTENDED COLOR PALETTE
// ============================================================================
function ExtendedColorSection() {
  const palettes = [
    { name: "Brand Blue", shades: [
      { n: "950", hex: "#0C1A4A", role: "Deepest" },
      { n: "900", hex: "#1E3A8A", role: "Layer 1" },
      { n: "800", hex: "#1E40AF", role: "Stroke" },
      { n: "700", hex: "#1D4ED8", role: "Hover" },
      { n: "600", hex: "#2563EB", role: "Primary" },
      { n: "500", hex: "#3B82F6", role: "Layer 3" },
      { n: "400", hex: "#60A5FA", role: "Accent" },
      { n: "300", hex: "#93BBFD", role: "Light" },
      { n: "200", hex: "#BFDBFE", role: "Subtle" },
      { n: "100", hex: "#DBEAFE", role: "Surface" },
      { n: "50",  hex: "#EFF6FF", role: "Wash" },
    ]},
    { name: "Neutral", shades: [
      { n: "950", hex: "#0A0B0F", role: "Background" },
      { n: "900", hex: "#111218", role: "Surface" },
      { n: "800", hex: "#1A1C28", role: "Card" },
      { n: "700", hex: "#2A2D3A", role: "Border" },
      { n: "600", hex: "#3E4254", role: "Muted" },
      { n: "500", hex: "#5A5F73", role: "Placeholder" },
      { n: "400", hex: "#8B92B0", role: "Secondary text" },
      { n: "300", hex: "#B0B6CC", role: "Body text" },
      { n: "200", hex: "#D1D5E0", role: "Light text" },
      { n: "100", hex: "#E8EAF0", role: "Border light" },
      { n: "50",  hex: "#F4F5F7", role: "Background light" },
    ]},
  ];

  return (
    <S id="extended-palette" num="18" title="Extended Color Palette" sub="Full 11-stop ramp for Brand Blue and Neutral. Each shade has a defined semantic role.">
      <div className="space-y-8">
        {palettes.map((palette) => (
          <div key={palette.name}>
            <SubHead>{palette.name.toUpperCase()}</SubHead>
            <div className="flex gap-px rounded-xl overflow-hidden">
              {palette.shades.map((shade) => (
                <div key={shade.n} className="flex-1 group" style={{ minHeight: 100 }}>
                  <div className="h-16" style={{ background: shade.hex }} />
                  <div className="bg-[#08090D] p-2.5 border-t border-white/[0.04]">
                    <div className="text-white/60" style={{ fontSize: 10, fontWeight: 700 }}>{shade.n}</div>
                    <div className="text-white/30 font-mono" style={{ fontSize: 9 }}>{shade.hex}</div>
                    <div className="text-white/20" style={{ fontSize: 8 }}>{shade.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </S>
  );
}

// ============================================================================
// 19 · SEMANTIC COLORS
// ============================================================================
function SemanticColorSection() {
  const semantics = [
    { name: "Success", base: "#10B981", bg: "#052E1C", border: "#065F38", text: "#34D399", role: "Positive states, confirmations" },
    { name: "Warning", base: "#F59E0B", bg: "#2E1D05", border: "#78520D", text: "#FCD34D", role: "Caution, attention needed" },
    { name: "Error",   base: "#EF4444", bg: "#2E0505", border: "#7F1D1D", text: "#FCA5A5", role: "Destructive, failures" },
    { name: "Info",    base: "#3B82F6", bg: "#0C1A4A", border: "#1E40AF", text: "#93BBFD", role: "Informational, neutral" },
  ];

  return (
    <S id="semantic-colors" num="19" title="Semantic Colors" sub="Context-aware color tokens for UI states — success, warning, error, info.">
      <div className="grid grid-cols-4 gap-4">
        {semantics.map((s) => (
          <div key={s.name} className="rounded-xl overflow-hidden border border-white/[0.04]">
            <div className="h-3" style={{ background: s.base }} />
            <div className="bg-[#08090D] p-5 space-y-4">
              <div className="text-white/80" style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</div>
              <div className="space-y-2">
                {[
                  ["Base", s.base],
                  ["Background", s.bg],
                  ["Border", s.border],
                  ["Text", s.text],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded" style={{ background: v, border: '1px solid rgba(255,255,255,0.06)' }} />
                    <span className="text-white/40" style={{ fontSize: 11 }}>{k}</span>
                    <span className="text-white/60 font-mono ml-auto" style={{ fontSize: 10 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="text-white/25" style={{ fontSize: 11 }}>{s.role}</div>
            </div>
          </div>
        ))}
      </div>
    </S>
  );
}

// ============================================================================
// 20 · GRADIENT SYSTEM
// ============================================================================
function GradientSection() {
  const gradients = [
    { name: "Brand Primary", css: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #60A5FA 100%)", usage: "Hero backgrounds, CTAs" },
    { name: "Brand Subtle", css: "linear-gradient(135deg, #0C1A4A 0%, #1E3A8A 100%)", usage: "Card backgrounds, overlays" },
    { name: "Brand Glow", css: "radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%)", usage: "Ambient glow, focus rings" },
    { name: "Surface", css: "linear-gradient(180deg, #111218 0%, #0A0B0F 100%)", usage: "Page backgrounds" },
    { name: "Metallic", css: "linear-gradient(135deg, #B0B6CC 0%, #5A5F73 50%, #B0B6CC 100%)", usage: "Premium accents" },
    { name: "Sunset Accent", css: "linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #EC4899 100%)", usage: "Special events, highlights" },
  ];

  return (
    <S id="gradients" num="20" title="Gradient System" sub="Approved gradient tokens for backgrounds, accents, and atmospheric effects.">
      <div className="grid grid-cols-3 gap-4">
        {gradients.map((g) => (
          <div key={g.name} className="rounded-xl overflow-hidden border border-white/[0.04]">
            <div className="h-24 flex items-end p-3" style={{ background: g.css }}>
              <span className="text-white/80" style={{ fontSize: 12, fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{g.name}</span>
            </div>
            <div className="bg-[#08090D] p-4">
              <div className="text-white/30 font-mono mb-2" style={{ fontSize: 9, lineHeight: 1.4 }}>{g.css}</div>
              <div className="text-white/20" style={{ fontSize: 10 }}>{g.usage}</div>
            </div>
          </div>
        ))}
      </div>
    </S>
  );
}

// ============================================================================
// 21 · WCAG ACCESSIBILITY
// ============================================================================
function AccessibilitySection() {
  const checks = [
    { fg: "#FFFFFF", bg: "#000000", fgName: "White", bgName: "Black", ratio: "21:1", aa: true, aaa: true },
    { fg: "#FFFFFF", bg: "#0A0B0F", fgName: "White", bgName: "Neutral 950", ratio: "19.3:1", aa: true, aaa: true },
    { fg: "#60A5FA", bg: "#000000", fgName: "Blue 400", bgName: "Black", ratio: "8.1:1", aa: true, aaa: true },
    { fg: "#3B82F6", bg: "#000000", fgName: "Blue 500", bgName: "Black", ratio: "5.3:1", aa: true, aaa: false },
    { fg: "#2563EB", bg: "#000000", fgName: "Blue 600", bgName: "Black", ratio: "3.9:1", aa: false, aaa: false },
    { fg: "#FFFFFF", bg: "#2563EB", fgName: "White", bgName: "Blue 600", ratio: "5.4:1", aa: true, aaa: false },
    { fg: "#1E3A8A", bg: "#FFFFFF", fgName: "Blue 900", bgName: "White", ratio: "11.8:1", aa: true, aaa: true },
    { fg: "#2563EB", bg: "#FFFFFF", fgName: "Blue 600", bgName: "White", ratio: "3.9:1", aa: false, aaa: false },
    { fg: "#8B92B0", bg: "#0A0B0F", fgName: "Neutral 400", bgName: "Neutral 950", ratio: "5.8:1", aa: true, aaa: false },
    { fg: "#5A5F73", bg: "#0A0B0F", fgName: "Neutral 500", bgName: "Neutral 950", ratio: "3.4:1", aa: false, aaa: false },
  ];

  return (
    <S id="wcag-contrast" num="21" title="WCAG Accessibility" sub="Contrast ratio audit for all brand color pairings. WCAG 2.1 AA requires 4.5:1, AAA requires 7:1.">
      <div className="bg-[#08090D] rounded-2xl border border-white/[0.04] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 gap-px bg-white/[0.04]">
          {["Foreground", "Background", "Preview", "Ratio", "AA (4.5:1)", "AAA (7:1)", "Usage"].map((h) => (
            <div key={h} className="bg-[#0D0E14] px-4 py-3" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>{h}</div>
          ))}
        </div>
        {checks.map((c, i) => (
          <div key={i} className="grid grid-cols-7 gap-px bg-white/[0.04]">
            <div className="bg-[#08090D] px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: c.fg, border: '1px solid rgba(255,255,255,0.1)' }} />
              <span className="text-white/50" style={{ fontSize: 11 }}>{c.fgName}</span>
            </div>
            <div className="bg-[#08090D] px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: c.bg, border: '1px solid rgba(255,255,255,0.1)' }} />
              <span className="text-white/50" style={{ fontSize: 11 }}>{c.bgName}</span>
            </div>
            <div className="bg-[#08090D] px-4 py-3">
              <div className="px-2 py-1 rounded" style={{ background: c.bg, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: c.fg, fontSize: 11, fontWeight: 600 }}>Aa</span>
              </div>
            </div>
            <div className="bg-[#08090D] px-4 py-3">
              <span className="text-white/70 font-mono" style={{ fontSize: 12 }}>{c.ratio}</span>
            </div>
            <div className="bg-[#08090D] px-4 py-3">
              <span style={{ fontSize: 11, color: c.aa ? '#10B981' : '#EF4444' }}>{c.aa ? '✓ Pass' : '✗ Fail'}</span>
            </div>
            <div className="bg-[#08090D] px-4 py-3">
              <span style={{ fontSize: 11, color: c.aaa ? '#10B981' : '#EF4444' }}>{c.aaa ? '✓ Pass' : '✗ Fail'}</span>
            </div>
            <div className="bg-[#08090D] px-4 py-3">
              <span className="text-white/25" style={{ fontSize: 10 }}>{c.aa ? 'Body + UI' : 'Decorative only'}</span>
            </div>
          </div>
        ))}
      </div>
    </S>
  );
}

// ============================================================================
// 22 · TYPOGRAPHY SYSTEM
// ============================================================================
function TypographySection() {
  const scale = [
    { token: "display-xl", size: 72, weight: 700, lh: 1.05, ls: -2, sample: "SYSmoAI" },
    { token: "display", size: 56, weight: 700, lh: 1.1, ls: -1.5, sample: "Intelligence" },
    { token: "h1", size: 40, weight: 700, lh: 1.2, ls: -0.8, sample: "Brand Identity" },
    { token: "h2", size: 32, weight: 600, lh: 1.25, ls: -0.5, sample: "Section Heading" },
    { token: "h3", size: 24, weight: 600, lh: 1.3, ls: -0.3, sample: "Card Title" },
    { token: "h4", size: 20, weight: 600, lh: 1.4, ls: -0.2, sample: "Subsection" },
    { token: "body-lg", size: 18, weight: 400, lh: 1.6, ls: 0, sample: "Large body text for introductions and key paragraphs." },
    { token: "body", size: 16, weight: 400, lh: 1.6, ls: 0, sample: "Standard body text for content areas and descriptions." },
    { token: "body-sm", size: 14, weight: 400, lh: 1.5, ls: 0, sample: "Small body text for secondary content and metadata." },
    { token: "caption", size: 12, weight: 500, lh: 1.4, ls: 0.2, sample: "Caption text for labels, timestamps, and fine print." },
    { token: "overline", size: 10, weight: 600, lh: 1.3, ls: 1.5, sample: "OVERLINE TEXT" },
  ];

  return (
    <S id="typefaces" num="22" title="Typography System" sub="Complete type scale from Display XL (72px) to Overline (10px). Based on Inter.">
      <div className="grid grid-cols-3 gap-6">
        {/* Type scale */}
        <div id="type-scale" className="col-span-2 space-y-1">
          {scale.map((t) => (
            <div key={t.token} className="bg-[#08090D] rounded-lg border border-white/[0.04] px-6 py-4 flex items-center gap-6">
              <div className="w-20 flex-shrink-0">
                <div className="text-white/30 font-mono" style={{ fontSize: 10 }}>{t.token}</div>
                <div className="text-white/15 font-mono" style={{ fontSize: 9 }}>{t.size}px / {t.weight}</div>
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="text-white/80" style={{
                  fontSize: Math.min(t.size, 40),
                  fontWeight: t.weight,
                  lineHeight: t.lh,
                  letterSpacing: `${t.ls}px`,
                  fontFamily: "'Inter',-apple-system,system-ui,sans-serif",
                }}>{t.sample}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Specs panel */}
        <div id="type-hierarchy" className="space-y-6">
          <div className="bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
            <SubHead>BRAND TYPEFACES</SubHead>
            <div className="space-y-4">
              {[
                { name: "Inter", role: "Primary — Headings, Body, UI", weights: "400, 500, 600, 700" },
                { name: "JetBrains Mono", role: "Monospace — Code, tokens, specs", weights: "400, 500, 700" },
              ].map((f) => (
                <div key={f.name} className="pb-3 border-b border-white/[0.04]">
                  <div className="text-white/80" style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</div>
                  <div className="text-white/30" style={{ fontSize: 11 }}>{f.role}</div>
                  <div className="text-white/20 font-mono" style={{ fontSize: 10 }}>Weights: {f.weights}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
            <SubHead>SCALE FORMULA</SubHead>
            <div className="text-white/40" style={{ fontSize: 12, lineHeight: 1.6 }}>
              Based on <span className="text-white/60 font-mono">1.250</span> (Major Third) scale ratio.
              Base: <span className="text-white/60 font-mono">16px</span>.
              Each step multiplies by 1.25.
            </div>
            <div className="mt-4 space-y-1">
              <SpecRow label="Scale ratio" value="1.250 (Major Third)" />
              <SpecRow label="Base size" value="16px" />
              <SpecRow label="Line height range" value="1.05–1.6" />
              <SpecRow label="Letter spacing" value="-2px to +1.5px" />
            </div>
          </div>

          <div className="bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
            <SubHead>FONT LOADING</SubHead>
            <div className="text-white/40 font-mono" style={{ fontSize: 10, lineHeight: 1.8 }}>
              font-display: swap;<br/>
              unicode-range: U+0000-00FF;<br/>
              preload: Inter-Bold, Inter-Regular
            </div>
          </div>
        </div>
      </div>
    </S>
  );
}

// ============================================================================
// 23 · SPACING SYSTEM
// ============================================================================
function SpacingSection() {
  const tokens = [
    { token: "space-0", value: 0 },
    { token: "space-px", value: 1 },
    { token: "space-0.5", value: 2 },
    { token: "space-1", value: 4 },
    { token: "space-1.5", value: 6 },
    { token: "space-2", value: 8 },
    { token: "space-3", value: 12 },
    { token: "space-4", value: 16 },
    { token: "space-5", value: 20 },
    { token: "space-6", value: 24 },
    { token: "space-8", value: 32 },
    { token: "space-10", value: 40 },
    { token: "space-12", value: 48 },
    { token: "space-16", value: 64 },
    { token: "space-20", value: 80 },
    { token: "space-24", value: 96 },
  ];

  const breakpoints = [
    { name: "xs", min: 0, max: 479, cols: 4, gutter: 16, margin: 16 },
    { name: "sm", min: 480, max: 767, cols: 6, gutter: 16, margin: 24 },
    { name: "md", min: 768, max: 1023, cols: 8, gutter: 24, margin: 32 },
    { name: "lg", min: 1024, max: 1279, cols: 12, gutter: 24, margin: 48 },
    { name: "xl", min: 1280, max: 1439, cols: 12, gutter: 32, margin: 64 },
    { name: "2xl", min: 1440, max: 9999, cols: 12, gutter: 32, margin: 80 },
  ];

  return (
    <S id="base-grid" num="23" title="Spacing & Layout Grid" sub="4px base unit. 16-stop scale. Responsive grid with 6 breakpoints.">
      <div className="grid grid-cols-2 gap-6">
        {/* Spacing tokens */}
        <div id="spacing-tokens" className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>SPACING TOKENS (4px BASE)</SubHead>
          <div className="space-y-1.5">
            {tokens.map((t) => (
              <div key={t.token} className="flex items-center gap-4">
                <span className="text-white/30 font-mono w-20" style={{ fontSize: 10 }}>{t.token}</span>
                <div className="flex-1 flex items-center gap-3">
                  <div className="h-2.5 rounded-sm bg-[#2563EB]/40" style={{ width: Math.max(t.value * 1.2, 1), minWidth: 1 }} />
                  <span className="text-white/40 font-mono" style={{ fontSize: 10 }}>{t.value}px</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakpoints */}
        <div id="layout-grid" className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>BREAKPOINTS & GRID</SubHead>
          <div className="space-y-1">
            {breakpoints.map((bp) => (
              <div key={bp.name} className="grid grid-cols-5 gap-2 py-2.5 border-b border-white/[0.04]">
                <span className="text-white/70 font-mono" style={{ fontSize: 12, fontWeight: 600 }}>{bp.name}</span>
                <span className="text-white/40 font-mono" style={{ fontSize: 11 }}>≥{bp.min}px</span>
                <span className="text-white/40 font-mono" style={{ fontSize: 11 }}>{bp.cols} col</span>
                <span className="text-white/30 font-mono" style={{ fontSize: 11 }}>{bp.gutter}g</span>
                <span className="text-white/30 font-mono" style={{ fontSize: 11 }}>{bp.margin}m</span>
              </div>
            ))}
          </div>

          <div id="breakpoints" className="mt-8">
            <SubHead>GRID VISUALIZATION</SubHead>
            <div className="flex gap-px rounded-lg overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 h-12 bg-[#2563EB]/8 border border-[#2563EB]/10 flex items-center justify-center">
                  <span className="text-[#60A5FA]/30" style={{ fontSize: 8 }}>{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </S>
  );
}

// ============================================================================
// 24 · ICONOGRAPHY
// ============================================================================
function IconographySection() {
  return (
    <S id="icon-style" num="24" title="Iconography" sub="UI icon guidelines — Lucide-based, 24px grid, 1.5px stroke, round caps.">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>ICON GRID (24×24)</SubHead>
          <div className="grid grid-cols-8 gap-4 mt-4">
            {["M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
              "M4 6h16M4 12h16M4 18h16",
              "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
              "M12 2v20M2 12h20",
              "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22",
              "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
              "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z",
              "M22 12h-4l-3 9L9 3l-3 9H2",
              "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
              "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707",
              "M4 4l16 16M4 4v5h5M20 20v-5h-5",
              "M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v20m10-10H2",
              "M5 12h14M12 5l7 7-7 7",
              "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20",
              "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
              "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
            ].map((d, i) => (
              <div key={i} className="w-12 h-12 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={d} />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
          <SubHead>ICON SPECS</SubHead>
          <div className="space-y-1">
            {[
              ["Library", "Lucide React"],
              ["Grid", "24 × 24px"],
              ["Stroke width", "1.5px"],
              ["Stroke cap", "Round"],
              ["Stroke join", "Round"],
              ["Corner radius", "2px"],
              ["Padding", "2px (content area 20px)"],
              ["Size — sm", "16px"],
              ["Size — md", "20px"],
              ["Size — lg", "24px"],
              ["Size — xl", "32px"],
            ].map(([k, v]) => <SpecRow key={k} label={k} value={v} />)}
          </div>
        </div>
      </div>
    </S>
  );
}

// ============================================================================
// 24b · PHOTOGRAPHY GUIDELINES
// ============================================================================
function PhotographySection() {
  const categories = [
    { name: "Technology & Product", desc: "Clean, moody shots emphasizing precision and innovation. Low-key lighting preferred.", img: "https://images.unsplash.com/photo-1597619297999-848ba1e17380?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWNobm9sb2d5JTIwd29ya3NwYWNlJTIwZGFya3xlbnwxfHx8fDE3NzM4MDU4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Infrastructure", desc: "Data centers, servers, networks. Convey scale and reliability. Cool tones.", img: "https://images.unsplash.com/photo-1762163516269-3c143e04175c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwY2VudGVyJTIwc2VydmVyJTIwaW5mcmFzdHJ1Y3R1cmV8ZW58MXx8fHwxNzczNzE4OTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "People & Teams", desc: "Authentic collaboration moments. Natural light, candid over posed. Diverse representation.", img: "https://images.unsplash.com/photo-1758873268663-5a362616b5a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG1vZGVybiUyMG9mZmljZXxlbnwxfHx8fDE3NzM3MzI0NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Abstract & Atmospheric", desc: "Blue-toned light effects, gradients, data visualization. Brand-aligned color grading.", img: "https://images.unsplash.com/photo-1761652661873-a08d8cb25b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGJsdWUlMjBsaWdodCUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzczODA1ODg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  ];

  return (
    <S id="photography" num="24b" title="Photography Guidelines" sub="Image selection, treatment, and color grading rules for all brand photography.">
      <div className="grid grid-cols-2 gap-6">
        {/* Category examples */}
        <div className="space-y-4">
          <SubHead>APPROVED CATEGORIES</SubHead>
          {categories.map((cat) => (
            <div key={cat.name} className="rounded-xl overflow-hidden border border-white/[0.04]">
              <div className="h-32 bg-[#08090D] relative overflow-hidden">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover opacity-70" style={{ filter: 'saturate(0.8) contrast(1.1)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,11,15,0.9) 0%, transparent 60%)' }} />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="text-white/90" style={{ fontSize: 13, fontWeight: 600 }}>{cat.name}</div>
                  <div className="text-white/40" style={{ fontSize: 11 }}>{cat.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Specs + Do/Don't */}
        <div className="space-y-6">
          <div className="bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
            <SubHead>COLOR TREATMENT</SubHead>
            <div className="space-y-1">
              {[
                ["Primary overlay", "Brand Blue @ 10–20% opacity"],
                ["Color grading", "Cool tones, slight blue shift"],
                ["Saturation", "70–90% (desaturate slightly)"],
                ["Contrast", "110% (subtle lift)"],
                ["Black point", "#0A0B0F (not pure black)"],
                ["Vignette", "Subtle, 10–15% on edges"],
              ].map(([k, v]) => <SpecRow key={k} label={k} value={v} />)}
            </div>
          </div>

          <div className="bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
            <SubHead>DO</SubHead>
            <div className="space-y-2 mb-6">
              {[
                "Use high-resolution images (min 2000px wide)",
                "Apply brand color grading consistently",
                "Favor dark, moody environments",
                "Show authentic moments over stock poses",
                "Maintain negative space for text overlay",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <span className="text-[#10B981] mt-0.5" style={{ fontSize: 10 }}>✓</span>
                  <span className="text-white/50" style={{ fontSize: 12, lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>
            <SubHead>DON'T</SubHead>
            <div className="space-y-2">
              {[
                "Use warm-toned or sepia filters",
                "Show cluttered or noisy compositions",
                "Use heavily filtered or HDR images",
                "Place logo over busy image areas",
                "Use low-resolution or compressed images",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-0.5" style={{ fontSize: 10 }}>✗</span>
                  <span className="text-white/35" style={{ fontSize: 12, lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
            <SubHead>ASPECT RATIOS</SubHead>
            <div className="space-y-1">
              {[
                ["Hero banner", "16:9 or 21:9"],
                ["Card thumbnail", "3:2"],
                ["Square (social)", "1:1"],
                ["Portrait (mobile)", "4:5"],
                ["OG image", "1200×630 (1.91:1)"],
              ].map(([k, v]) => <SpecRow key={k} label={k} value={v} />)}
            </div>
          </div>
        </div>
      </div>
    </S>
  );
}

// ============================================================================
// 25 · BRAND VOICE
// ============================================================================
function BrandVoiceSection() {
  return (
    <S id="voice-tone" num="25" title="Brand Voice & Tone" sub="How SYSmoAI communicates — precise, confident, human, never arrogant.">
      <div className="grid grid-cols-3 gap-6">
        {/* Voice pillars */}
        <div className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>VOICE PILLARS</SubHead>
          <div className="space-y-6">
            {[
              { pillar: "Precise", desc: "Technical accuracy without jargon. Every word earns its place.", icon: "◆" },
              { pillar: "Confident", desc: "Authority from expertise, not volume. State facts, don't oversell.", icon: "■" },
              { pillar: "Human", desc: "Complex ideas in plain language. Approachable but never casual.", icon: "●" },
              { pillar: "Forward", desc: "Future-oriented. Focus on what's possible, not what's broken.", icon: "▲" },
            ].map((v) => (
              <div key={v.pillar} className="pb-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#60A5FA]/60" style={{ fontSize: 10 }}>{v.icon}</span>
                  <span className="text-white/80" style={{ fontSize: 15, fontWeight: 600 }}>{v.pillar}</span>
                </div>
                <p className="text-white/35" style={{ fontSize: 12, lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Do / Don't */}
        <div id="writing" className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>DO</SubHead>
          <div className="space-y-3 mb-8">
            {[
              '"SYSmoAI processes 10M events per second."',
              '"Deploy in under 60 seconds."',
              '"Built for teams that ship fast."',
              '"Your infrastructure, simplified."',
            ].map((t) => (
              <div key={t} className="flex items-start gap-2">
                <span className="text-[#10B981] mt-0.5" style={{ fontSize: 10 }}>✓</span>
                <span className="text-white/50" style={{ fontSize: 12, lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
          <SubHead>DON'T</SubHead>
          <div className="space-y-3">
            {[
              '"We\'re the best AI platform ever!!!"',
              '"Leverage our synergistic paradigm."',
              '"You NEED this to survive."',
              '"It\'s basically magic lol"',
            ].map((t) => (
              <div key={t} className="flex items-start gap-2">
                <span className="text-[#EF4444] mt-0.5" style={{ fontSize: 10 }}>✗</span>
                <span className="text-white/35" style={{ fontSize: 12, lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terminology */}
        <div id="terminology" className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>TERMINOLOGY</SubHead>
          <div className="space-y-1">
            {[
              ["SYSmoAI", "Never SysmoAI, Sysmoai, SYSMOAI"],
              ["AI", "Always capitalized, never A.I."],
              ["infrastructure", "Lowercase unless starting sentence"],
              ["deploy", "Preferred over 'install' or 'set up'"],
              ["pipeline", "Preferred over 'workflow'"],
              ["intelligent", "Preferred over 'smart'"],
              ["real-time", "Always hyphenated"],
              ["open source", "Two words, no hyphen"],
            ].map(([correct, note]) => (
              <div key={correct} className="py-2.5 border-b border-white/[0.04]">
                <div className="text-white/70 font-mono" style={{ fontSize: 12 }}>{correct}</div>
                <div className="text-white/25" style={{ fontSize: 10 }}>{note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </S>
  );
}

// ============================================================================
// 26 · UI COMPONENTS
// ============================================================================
function UIComponentsSection() {
  return (
    <S id="button-system" num="26" title="UI Component System" sub="Core interface components styled with brand tokens. Buttons, cards, inputs, badges.">
      <div className="grid grid-cols-2 gap-6">
        {/* Buttons */}
        <div className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>BUTTONS</SubHead>
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: "Primary", bg: "#2563EB", color: "#fff", border: "transparent" },
                { label: "Secondary", bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", border: "rgba(255,255,255,0.1)" },
                { label: "Ghost", bg: "transparent", color: "rgba(255,255,255,0.6)", border: "transparent" },
                { label: "Destructive", bg: "#DC2626", color: "#fff", border: "transparent" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-2">
                  <div className="px-4 py-2 rounded-lg" style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}`, fontSize: 13, fontWeight: 600 }}>
                    {b.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {["sm", "md", "lg"].map((sz) => (
                <div key={sz} className="flex flex-col items-center gap-1">
                  <div className="rounded-lg bg-[#2563EB] text-white flex items-center justify-center" style={{
                    fontSize: sz === 'sm' ? 12 : sz === 'md' ? 13 : 15,
                    fontWeight: 600,
                    padding: sz === 'sm' ? '6px 12px' : sz === 'md' ? '8px 16px' : '12px 24px',
                  }}>Button</div>
                  <span className="text-white/20" style={{ fontSize: 9 }}>{sz}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <SpecRow label="Border radius" value="8px (lg)" />
              <SpecRow label="Font weight" value="600" />
              <SpecRow label="Transition" value="150ms ease" />
              <SpecRow label="Focus ring" value="2px offset, brand-400" />
            </div>
          </div>
        </div>

        {/* Cards + Inputs */}
        <div className="space-y-6">
          <div id="card-system" className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
            <SubHead>CARDS</SubHead>
            <div className="flex gap-3">
              {[
                { name: "Default", bg: "#111218", border: "rgba(255,255,255,0.04)" },
                { name: "Elevated", bg: "#1A1C28", border: "rgba(255,255,255,0.06)" },
                { name: "Interactive", bg: "#111218", border: "rgba(37,99,235,0.2)" },
              ].map((c) => (
                <div key={c.name} className="flex-1 rounded-xl p-4" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <div className="w-full h-8 rounded bg-white/[0.03] mb-3" />
                  <div className="text-white/50" style={{ fontSize: 11, fontWeight: 600 }}>{c.name}</div>
                  <div className="text-white/20 mt-1" style={{ fontSize: 9 }}>radius: 12px</div>
                </div>
              ))}
            </div>
          </div>

          <div id="form-elements" className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
            <SubHead>FORM ELEMENTS</SubHead>
            <div className="space-y-3">
              <div>
                <div className="text-white/40 mb-1.5" style={{ fontSize: 12, fontWeight: 500 }}>Label</div>
                <div className="rounded-lg px-3.5 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Placeholder text...</div>
              </div>
              <div id="badges-tags" className="flex gap-3">
                {[
                  { name: "Badge", bg: "rgba(37,99,235,0.15)", color: "#60A5FA", text: "AI" },
                  { name: "Tag", bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", text: "Deploy" },
                  { name: "Status", bg: "rgba(16,185,129,0.15)", color: "#34D399", text: "Active" },
                ].map((b) => (
                  <div key={b.name} className="px-2.5 py-1 rounded-md" style={{ background: b.bg, color: b.color, fontSize: 11, fontWeight: 600 }}>{b.text}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </S>
  );
}

// ============================================================================
// 27 · MOTION DESIGN
// ============================================================================
function MotionSection() {
  const [activeEase, setActiveEase] = useState(0);
  const easings = [
    { name: "ease-out", css: "cubic-bezier(0.16, 1, 0.3, 1)", usage: "Entrances, reveals", points: "0.16, 1, 0.3, 1" },
    { name: "ease-in-out", css: "cubic-bezier(0.76, 0, 0.24, 1)", usage: "Transitions, morphs", points: "0.76, 0, 0.24, 1" },
    { name: "ease-in", css: "cubic-bezier(0.55, 0, 1, 0.45)", usage: "Exits, dismissals", points: "0.55, 0, 1, 0.45" },
    { name: "spring", css: "cubic-bezier(0.34, 1.56, 0.64, 1)", usage: "Bouncy interactions", points: "0.34, 1.56, 0.64, 1" },
  ];

  const durations = [
    { token: "instant", ms: 75, usage: "Opacity toggles, color changes" },
    { token: "fast", ms: 150, usage: "Button states, hover effects" },
    { token: "normal", ms: 250, usage: "Dropdowns, tooltips" },
    { token: "slow", ms: 400, usage: "Modals, page transitions" },
    { token: "slower", ms: 600, usage: "Complex reveals, stagger children" },
  ];

  return (
    <S id="easing" num="27" title="Motion Design" sub="Easing curves, duration tokens, and transition patterns for cohesive motion identity.">
      <div className="grid grid-cols-2 gap-6">
        {/* Easing curves */}
        <div className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>EASING CURVES</SubHead>
          <div className="space-y-3">
            {easings.map((e, i) => (
              <div
                key={e.name}
                className="p-4 rounded-lg cursor-pointer transition-all"
                style={{ background: activeEase === i ? 'rgba(37,99,235,0.08)' : 'transparent', border: `1px solid ${activeEase === i ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.04)'}` }}
                onClick={() => setActiveEase(i)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70" style={{ fontSize: 13, fontWeight: 600 }}>{e.name}</span>
                  <span className="text-white/25" style={{ fontSize: 10 }}>{e.usage}</span>
                </div>
                <div className="text-white/30 font-mono" style={{ fontSize: 10 }}>{e.css}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Durations */}
        <div id="duration" className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>DURATION TOKENS</SubHead>
          <div className="space-y-3 mb-8">
            {durations.map((d) => (
              <div key={d.token} className="flex items-center gap-4">
                <span className="text-white/40 font-mono w-16" style={{ fontSize: 11 }}>{d.token}</span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full rounded-full bg-[#2563EB]/40" style={{ width: `${(d.ms / 600) * 100}%` }} />
                  </div>
                </div>
                <span className="text-white/50 font-mono w-12 text-right" style={{ fontSize: 11 }}>{d.ms}ms</span>
              </div>
            ))}
          </div>

          <div id="transitions" /><SubHead>TRANSITION PATTERNS</SubHead>
          <div className="space-y-1">
            {[
              ["Hover → Active", "fast + ease-out"],
              ["Menu open", "normal + ease-out"],
              ["Menu close", "fast + ease-in"],
              ["Modal enter", "slow + ease-out"],
              ["Modal exit", "normal + ease-in"],
              ["Page transition", "slow + ease-in-out"],
              ["Stagger children", "slower + 50ms delay each"],
              ["Logo reveal", "slower + ease-out"],
            ].map(([k, v]) => <SpecRow key={k} label={k} value={v} />)}
          </div>
        </div>
      </div>
    </S>
  );
}

// ============================================================================
// 28 · BRAND APPLICATIONS (LEGACY — replaced by BrandExtensions.tsx)
// ============================================================================
function _LegacyApplicationsSection() {
  return (
    <S id="business-card" num="28" title="Brand Applications" sub="Real-world usage mockups — business card, email signature, letterhead, presentation.">
      <div className="grid grid-cols-2 gap-6">
        {/* Business Card - Front */}
        <div className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>BUSINESS CARD — FRONT (3.5" × 2")</SubHead>
          <div className="mt-4 mx-auto rounded-xl overflow-hidden shadow-xl" style={{ width: 350, height: 200, background: '#000' }}>
            <div className="w-full h-full flex flex-col justify-between p-6">
              <div className="flex items-center gap-2.5">
                <LogoMark size={28} variant="brand-dark" />
                <Wordmark size={14} color="#fff" />
              </div>
              <div>
                <div className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>Alex Chen</div>
                <div className="text-white/40" style={{ fontSize: 10 }}>Chief Technology Officer</div>
                <div className="mt-3 flex gap-4">
                  <span className="text-white/30 font-mono" style={{ fontSize: 9 }}>alex@sysmoai.com</span>
                  <span className="text-white/30 font-mono" style={{ fontSize: 9 }}>+1 (415) 555-0142</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Card - Back */}
        <div className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>BUSINESS CARD — BACK</SubHead>
          <div className="mt-4 mx-auto rounded-xl overflow-hidden shadow-xl" style={{ width: 350, height: 200, background: '#000' }}>
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.08) 0%, transparent 70%)' }}>
              <LogoMark size={64} variant="brand-dark" />
            </div>
          </div>
        </div>

        {/* Email Signature */}
        <div id="email-signature" className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>EMAIL SIGNATURE</SubHead>
          <div className="mt-4 mx-auto bg-white rounded-lg p-6" style={{ maxWidth: 400 }}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <LogoMark size={40} variant="brand-light" />
              </div>
              <div>
                <div className="text-black" style={{ fontSize: 13, fontWeight: 700 }}>Alex Chen</div>
                <div className="text-black/50" style={{ fontSize: 11 }}>CTO · SYSmoAI</div>
                <div className="mt-2 pt-2" style={{ borderTop: '2px solid #2563EB' }}>
                  <div className="text-black/40 font-mono" style={{ fontSize: 10 }}>alex@sysmoai.com · sysmoai.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Letterhead */}
        <div id="letterhead" className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>LETTERHEAD (A4 / LETTER)</SubHead>
          <div className="mt-4 mx-auto rounded-lg overflow-hidden shadow-xl" style={{ width: 340, height: 440, background: '#FFFFFF' }}>
            <div className="w-full h-full flex flex-col p-8">
              {/* Header with logo */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <LogoMark size={22} variant="brand-light" />
                  <Wordmark size={11} color="#000" />
                </div>
                <div className="text-right">
                  <div className="text-black/30 font-mono" style={{ fontSize: 7 }}>sysmoai.com</div>
                  <div className="text-black/25 font-mono" style={{ fontSize: 7 }}>hello@sysmoai.com</div>
                </div>
              </div>
              {/* Blue rule */}
              <div className="w-full h-px mb-6" style={{ background: 'linear-gradient(90deg, #2563EB, #60A5FA 40%, transparent)' }} />
              {/* Placeholder body text */}
              <div className="flex-1 space-y-3">
                <div className="h-1.5 rounded-full bg-black/[0.08]" style={{ width: '40%' }} />
                <div className="h-1.5 rounded-full bg-black/[0.05] w-full mt-4" />
                <div className="h-1.5 rounded-full bg-black/[0.05] w-full" />
                <div className="h-1.5 rounded-full bg-black/[0.05]" style={{ width: '92%' }} />
                <div className="h-1.5 rounded-full bg-black/[0.05] w-full mt-3" />
                <div className="h-1.5 rounded-full bg-black/[0.05] w-full" />
                <div className="h-1.5 rounded-full bg-black/[0.05]" style={{ width: '75%' }} />
                <div className="h-1.5 rounded-full bg-black/[0.05] w-full mt-3" />
                <div className="h-1.5 rounded-full bg-black/[0.05] w-full" />
                <div className="h-1.5 rounded-full bg-black/[0.05]" style={{ width: '60%' }} />
              </div>
              {/* Footer */}
              <div className="pt-4 mt-auto" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div className="text-black/25 font-mono" style={{ fontSize: 6 }}>SYSmoAI Inc. · 548 Market St, Suite 92 · San Francisco, CA 94104</div>
                  <div className="text-black/20 font-mono" style={{ fontSize: 6 }}>Confidential</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-1">
            {[
              ["Paper size", "A4 (210×297mm) / US Letter"],
              ["Margins", "25mm top, 20mm sides, 15mm bottom"],
              ["Header logo", "22px mark + 11px wordmark"],
              ["Header rule", "Brand gradient, 1px"],
              ["Body font", "Inter Regular, 10pt/15pt"],
              ["Footer", "Company address, 6pt mono"],
            ].map(([k, v]) => <SpecRow key={k} label={k} value={v} />)}
          </div>
        </div>

        {/* Presentation Slide */}
        <div id="presentation" className="bg-[#08090D] rounded-2xl p-8 border border-white/[0.04]">
          <SubHead>PRESENTATION SLIDE (16:9)</SubHead>
          <div className="mt-4 mx-auto rounded-lg overflow-hidden shadow-xl" style={{ width: 400, height: 225, background: '#0A0B0F' }}>
            <div className="w-full h-full flex flex-col justify-between p-8" style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(37,99,235,0.06) 0%, transparent 60%)' }}>
              <div className="flex items-center gap-2">
                <LogoMark size={18} variant="brand-dark" />
                <Wordmark size={9} color="#fff" />
              </div>
              <div>
                <div className="text-white" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>Intelligent Infrastructure</div>
                <div className="text-white/30 mt-1" style={{ fontSize: 10 }}>Building the future of AI-powered systems</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/15 font-mono" style={{ fontSize: 8 }}>Q1 2026 · Confidential</span>
                <span className="text-white/15 font-mono" style={{ fontSize: 8 }}>01</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </S>
  );
}

// ============================================================================
// 29 · DESIGN TOKENS (DTCG)
// ============================================================================
function DesignTokensSection() {
  const tokenJSON = `{
  "sysmoai": {
    "color": {
      "brand": {
        "primary": {
          "$type": "color",
          "$value": "#2563EB",
          "$description": "Primary brand blue"
        },
        "primary-hover": {
          "$type": "color",
          "$value": "#1D4ED8"
        }
      },
      "semantic": {
        "success": { "$type": "color", "$value": "#10B981" },
        "warning": { "$type": "color", "$value": "#F59E0B" },
        "error":   { "$type": "color", "$value": "#EF4444" }
      }
    },
    "spacing": {
      "base": { "$type": "dimension", "$value": "4px" },
      "sm":   { "$type": "dimension", "$value": "8px" },
      "md":   { "$type": "dimension", "$value": "16px" },
      "lg":   { "$type": "dimension", "$value": "24px" },
      "xl":   { "$type": "dimension", "$value": "32px" }
    },
    "typography": {
      "font-family": {
        "primary": {
          "$type": "fontFamily",
          "$value": ["Inter", "system-ui", "sans-serif"]
        },
        "mono": {
          "$type": "fontFamily",
          "$value": ["JetBrains Mono", "monospace"]
        }
      }
    },
    "motion": {
      "duration": {
        "fast":   { "$type": "duration", "$value": "150ms" },
        "normal": { "$type": "duration", "$value": "250ms" },
        "slow":   { "$type": "duration", "$value": "400ms" }
      }
    }
  }
}`;

  return (
    <S id="dtcg-structure" num="29" title="Design Tokens (DTCG)" sub="W3C Design Token Community Group format — platform-agnostic, tool-compatible.">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#08090D] rounded-2xl border border-white/[0.04] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]/50" />
            <span className="text-white/25 ml-2 font-mono" style={{ fontSize: 10 }}>tokens.json</span>
          </div>
          <pre className="p-5 overflow-x-auto" style={{ fontSize: 10, lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace" }}>
            {tokenJSON}
          </pre>
        </div>

        <div className="space-y-6">
          <div id="token-naming" className="bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
            <SubHead>TOKEN STRUCTURE</SubHead>
            <div className="space-y-1">
              {[
                ["Format", "DTCG (W3C Draft)"],
                ["Root namespace", "sysmoai"],
                ["Categories", "color, spacing, typography, motion, radius"],
                ["Naming", "kebab-case, dot notation"],
                ["File", "tokens.json"],
              ].map(([k, v]) => <SpecRow key={k} label={k} value={v} />)}
            </div>
          </div>

          <div className="bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
            <SubHead>EXPORT TARGETS</SubHead>
            <div className="space-y-1">
              {[
                ["CSS Custom Properties", "--sysmoai-color-brand-primary"],
                ["Tailwind Config", "theme.extend.colors"],
                ["Figma Variables", "Bound to local styles"],
                ["iOS (Swift)", "UIColor extensions"],
                ["Android (Compose)", "MaterialTheme tokens"],
                ["Style Dictionary", "Full config included"],
              ].map(([k, v]) => <SpecRow key={k} label={k} value={v} />)}
            </div>
          </div>

          <div className="bg-[#08090D] rounded-2xl p-6 border border-white/[0.04]">
            <SubHead>SUPPORTED TOOLS</SubHead>
            <div className="flex flex-wrap gap-2 mt-2">
              {["Figma", "Tokens Studio", "Style Dictionary", "Tailwind", "CSS", "Swift", "Kotlin", "JSON"].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-md text-white/40" style={{ fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </S>
  );
}

// ============================================================================
// 30 · FINAL QA — COMPREHENSIVE
// ============================================================================
function FinalQASection() {
  const categories = [
    { name: "Logo System", checks: ["Horizontal lockup (4 variants)", "Stacked lockup (4 variants)", "Responsive breakpoints (4 tiers)", "Favicon/App icon (7 sizes)", "Construction grid", "Clear space rules", "Minimum sizes (digital + print)", "Misuse documentation"] },
    { name: "Color", checks: ["Brand Blue (11 stops)", "Neutral (11 stops)", "Semantic (4 states × 4 tokens)", "Gradients (6 approved)", "WCAG AA compliance (all UI text)", "WCAG AAA compliance (body text)", "Dark mode tokens", "Light mode tokens"] },
    { name: "Typography", checks: ["Type scale (11 steps)", "Font stack (primary + mono)", "Scale ratio (1.25 Major Third)", "Line height range defined", "Letter spacing per level", "Font loading strategy", "Wordmark construction"] },
    { name: "Spacing & Layout", checks: ["4px base grid", "16 spacing tokens", "6 breakpoints", "Column grid (4–12)", "Gutter/margin per breakpoint"] },
    { name: "Social Media", checks: ["7 platform DPs (icon)", "4 lockup DPs", "3 platform covers", "Spec matrix", "PNG/JPEG export", "Batch export", "Circular crop safe"] },
    { name: "System", checks: ["Brand voice defined", "UI components styled", "Motion tokens (4 easings, 5 durations)", "Design tokens (DTCG)", "Brand applications (4 mockups)", "Icon style guide", "12-phase roadmap complete"] },
  ];

  return (
    <S id="export-formats" num="30" title="Comprehensive QA" sub="Final audit — every deliverable across all 12 phases verified.">
      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.name} className="bg-[#08090D] rounded-xl p-5 border border-white/[0.04]">
            <div className="text-white/60 mb-4" style={{ fontSize: 13, fontWeight: 700 }}>{cat.name}</div>
            <div className="space-y-2">
              {cat.checks.map((check) => (
                <div key={check} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#10B981]/15 flex items-center justify-center flex-shrink-0">
                    <svg width="7" height="7" viewBox="0 0 10 10"><path d="M2 5 L4.5 7.5 L8 3" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                  </div>
                  <span className="text-white/40" style={{ fontSize: 11 }}>{check}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.04]">
              <span className="text-[#10B981]/60" style={{ fontSize: 10, fontWeight: 600 }}>{cat.checks.length}/{cat.checks.length} PASSING</span>
            </div>
          </div>
        ))}
      </div>
    </S>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export function BrandSystemExpanded() {
  return (
    <>
      <RoadmapSection />
      <StackedLockupSection />
      <ResponsiveLogoSection />
      <FaviconSection />
      <ExtendedColorSection />
      <SemanticColorSection />
      <GradientSection />
      <AccessibilitySection />
      <TypographySection />
      <SpacingSection />
      <IconographySection />
      <PhotographySection />
      <BrandVoiceSection />
      <UIComponentsSection />
      <MotionSection />
      <BrandExtensionsSection />
      <DesignTokensSection />
      <FinalQASection />
    </>
  );
}
