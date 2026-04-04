import React, { useRef, useCallback, useState } from 'react';

// ============================================================================
// SOCIAL MEDIA ASSET GENERATOR — FULL PLATFORM COVERAGE
// ============================================================================
// Generates export-ready PNG/JPEG for:
//   Profile Pictures: Facebook, Instagram, WhatsApp, LinkedIn, TikTok, GitHub, Discord
//   Cover Photos: Facebook, LinkedIn, Discord
//   Universal sizes: 512×512, 1024×1024
// ============================================================================

// — SVG LOGO MARKUP (inline for canvas rendering) —
function getLogoSVG(variant: "brand-dark" | "brand-light" | "mono-white" | "mono-black", size: number): string {
  const sw = size <= 64 ? 3 : size <= 128 ? 2.5 : 2;
  const styles: Record<string, { fills: string[]; fillOps: number[]; strokes: string[]; strokeOps: number[] }> = {
    "brand-dark": {
      fills: ["#1E3A8A", "#2563EB", "#3B82F6"],
      fillOps: [0.3, 0.5, 1],
      strokes: ["#2563EB", "#3B82F6", "#60A5FA"],
      strokeOps: [0.6, 0.8, 1],
    },
    "brand-light": {
      fills: ["#1E3A8A", "#2563EB", "#1E3A8A"],
      fillOps: [0.08, 0.15, 0.85],
      strokes: ["#1E40AF", "#2563EB", "#1E3A8A"],
      strokeOps: [0.35, 0.55, 1],
    },
    "mono-white": {
      fills: ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
      fillOps: [0.12, 0.3, 1],
      strokes: ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
      strokeOps: [0.5, 0.7, 1],
    },
    "mono-black": {
      fills: ["#000000", "#000000", "#000000"],
      fillOps: [0.08, 0.2, 0.9],
      strokes: ["#000000", "#000000", "#000000"],
      strokeOps: [0.4, 0.6, 1],
    },
  };
  const s = styles[variant];
  const paths = [
    "M25 34 L50 24 L75 34 L75 54 L50 64 L25 54 Z",
    "M30 49 L50 40 L70 49 L70 64 L50 73 L30 64 Z",
    "M40 61 L50 56 L60 61 L60 71 L50 76 L40 71 Z",
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none">${paths.map((d, i) =>
    `<path d="${d}" fill="${s.fills[i]}" fill-opacity="${s.fillOps[i]}" stroke="${s.strokes[i]}" stroke-opacity="${s.strokeOps[i]}" stroke-width="${sw}" stroke-linejoin="round"/>`
  ).join('')}</svg>`;
}

function getWordmarkSVG(color: string, fontSize: number): string {
  const w = fontSize * 4.2;
  const h = fontSize * 1.4;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <text y="${fontSize}" font-family="Inter, SF Pro Display, -apple-system, system-ui, sans-serif" font-size="${fontSize}" fill="${color}" letter-spacing="-0.5">
      <tspan font-weight="700" letter-spacing="-0.02em">SYS</tspan><tspan font-weight="400" letter-spacing="-0.04em" opacity="0.65">mo</tspan><tspan font-weight="700" letter-spacing="0.02em">AI</tspan>
    </text>
  </svg>`;
}

// — CANVAS EXPORT ENGINE —
async function renderToCanvas(
  width: number,
  height: number,
  bgColor: string,
  elements: Array<{ svg: string; x: number; y: number; w: number; h: number }>,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Render each SVG element
  for (const el of elements) {
    const blob = new Blob([el.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    ctx.drawImage(img, el.x, el.y, el.w, el.h);
    URL.revokeObjectURL(url);
  }

  return canvas;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string, format: 'png' | 'jpeg') {
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpeg' ? 0.95 : undefined;
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = canvas.toDataURL(mime, quality);
  link.click();
}

// ============================================================================
// PLATFORM SPECS DATABASE
// ============================================================================
interface PlatformSpec {
  name: string;
  icon: string;
  color: string;
  profile: { width: number; height: number; note: string };
  cover?: { width: number; height: number; note: string };
}

const PLATFORMS: PlatformSpec[] = [
  {
    name: "Facebook",
    icon: "f",
    color: "#1877F2",
    profile: { width: 512, height: 512, note: "Displays 176×176 desktop, 128×128 mobile. Circular crop." },
    cover: { width: 820, height: 312, note: "Desktop 820×312. Mobile safe: 640×360 center." },
  },
  {
    name: "Instagram",
    icon: "◎",
    color: "#E4405F",
    profile: { width: 512, height: 512, note: "Stored 320×320. Circular crop. High contrast required." },
  },
  {
    name: "WhatsApp",
    icon: "✆",
    color: "#25D366",
    profile: { width: 512, height: 512, note: "Upload 500×500+. Circular crop. Compressed to JPEG." },
  },
  {
    name: "LinkedIn",
    icon: "in",
    color: "#0A66C2",
    profile: { width: 512, height: 512, note: "Recommended 400×400. Circular crop." },
    cover: { width: 1584, height: 396, note: "1584×396. Bottom 60px may be overlapped by profile." },
  },
  {
    name: "TikTok",
    icon: "♪",
    color: "#000000",
    profile: { width: 512, height: 512, note: "200×200 minimum. Circular crop." },
  },
  {
    name: "GitHub",
    icon: "⌥",
    color: "#181717",
    profile: { width: 512, height: 512, note: "Recommended 500×500. Circular crop on profiles." },
  },
  {
    name: "Discord",
    icon: "⌘",
    color: "#5865F2",
    profile: { width: 512, height: 512, note: "128×128 min, 512×512 recommended. Circular crop." },
    cover: { width: 960, height: 540, note: "Server banner. 960×540 recommended." },
  },
];

// ============================================================================
// EXPORT BUTTON COMPONENT
// ============================================================================
function ExportButton({
  label,
  onClick,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "primary";
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const handleClick = async () => {
    setState("loading");
    try {
      await onClick();
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("idle");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className="px-3 py-1.5 rounded-md transition-all cursor-pointer"
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.05em',
        background: variant === "primary"
          ? state === "done" ? "rgba(16,185,129,0.2)" : "rgba(37,99,235,0.15)"
          : state === "done" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
        color: state === "done" ? "#10B981" : variant === "primary" ? "#60A5FA" : "rgba(255,255,255,0.5)",
        border: `1px solid ${state === "done" ? "rgba(16,185,129,0.2)" : variant === "primary" ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      {state === "loading" ? "···" : state === "done" ? "✓ SAVED" : label}
    </button>
  );
}

// ============================================================================
// PROFILE PICTURE PREVIEW (with circular crop overlay)
// ============================================================================
function ProfilePreview({
  platform,
  bgColor,
  variant,
}: {
  platform: PlatformSpec;
  bgColor: string;
  variant: "brand-dark" | "brand-light" | "mono-white" | "mono-black";
}) {
  const previewSize = 120;
  const iconSize = Math.round(previewSize * 0.55);

  const handleExport = useCallback(async (format: 'png' | 'jpeg') => {
    const size = platform.profile.width;
    const logoSize = Math.round(size * 0.55);
    const logoOffset = Math.round((size - logoSize) / 2);
    const svg = getLogoSVG(variant, logoSize);
    const canvas = await renderToCanvas(size, size, bgColor, [
      { svg, x: logoOffset, y: logoOffset, w: logoSize, h: logoSize },
    ]);
    downloadCanvas(canvas, `SYSmoAI_DP_${platform.name}_${size}`, format);
  }, [platform, bgColor, variant]);

  return (
    <div className="flex flex-col items-center">
      {/* Circular preview */}
      <div className="relative mb-4">
        <div
          className="rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: previewSize,
            height: previewSize,
            background: bgColor,
            boxShadow: `0 0 0 1px ${bgColor === '#000000' || bgColor === '#0A0B0F' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: getLogoSVG(variant, iconSize) }} />
        </div>
        {/* Platform badge */}
        <div
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: platform.color, border: '2px solid #0A0B0F', fontSize: 11, color: '#fff', fontWeight: 700 }}
        >
          {platform.icon}
        </div>
      </div>

      {/* Platform name */}
      <div className="text-white/80 mb-1" style={{ fontSize: 13, fontWeight: 600 }}>{platform.name}</div>
      <div className="text-white/25 mb-3 text-center px-2" style={{ fontSize: 9, lineHeight: 1.4 }}>
        {platform.profile.width}×{platform.profile.height}px
      </div>

      {/* Export buttons */}
      <div className="flex gap-1.5">
        <ExportButton label="PNG" onClick={() => handleExport('png')} variant="primary" />
        <ExportButton label="JPEG" onClick={() => handleExport('jpeg')} />
      </div>
    </div>
  );
}

// ============================================================================
// COVER PHOTO PREVIEW
// ============================================================================
function CoverPreview({
  platform,
  bgColor,
  variant,
  wordColor,
}: {
  platform: PlatformSpec;
  bgColor: string;
  variant: "brand-dark" | "brand-light" | "mono-white" | "mono-black";
  wordColor: string;
}) {
  if (!platform.cover) return null;
  const { width, height } = platform.cover;
  const aspect = width / height;
  const previewW = 360;
  const previewH = Math.round(previewW / aspect);

  const handleExport = useCallback(async (format: 'png' | 'jpeg') => {
    const logoSize = Math.round(height * 0.4);
    const wordSize = Math.round(height * 0.15);
    const logoSvg = getLogoSVG(variant, logoSize);
    const wordSvg = getWordmarkSVG(wordColor, wordSize);
    const wordW = Math.round(wordSize * 4.2);
    const wordH = Math.round(wordSize * 1.4);
    const totalW = logoSize + 16 + wordW;
    const logoX = Math.round((width - totalW) / 2);
    const logoY = Math.round((height - logoSize) / 2);
    const wordX = logoX + logoSize + 16;
    const wordY = Math.round((height - wordH) / 2);
    const canvas = await renderToCanvas(width, height, bgColor, [
      { svg: logoSvg, x: logoX, y: logoY, w: logoSize, h: logoSize },
      { svg: wordSvg, x: wordX, y: wordY, w: wordW, h: wordH },
    ]);
    downloadCanvas(canvas, `SYSmoAI_Cover_${platform.name}_${width}x${height}`, format);
  }, [platform, bgColor, variant, wordColor, width, height]);

  return (
    <div className="bg-[#08090D] rounded-xl border border-white/[0.04] overflow-hidden">
      {/* Preview */}
      <div className="flex items-center justify-center p-6" style={{ minHeight: previewH + 48 }}>
        <div
          className="rounded-lg overflow-hidden flex items-center justify-center gap-3 relative"
          style={{
            width: previewW,
            height: previewH,
            background: bgColor,
            boxShadow: `0 0 0 1px ${bgColor === '#000000' || bgColor === '#0A0B0F' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: getLogoSVG(variant, Math.round(previewH * 0.4)) }} />
          <div dangerouslySetInnerHTML={{ __html: getWordmarkSVG(wordColor, Math.round(previewH * 0.14)) }} />
        </div>
      </div>

      {/* Info bar */}
      <div className="px-5 py-4 border-t border-white/[0.04] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: platform.color }} />
            <span className="text-white/70" style={{ fontSize: 13, fontWeight: 600 }}>{platform.name} Cover</span>
          </div>
          <span className="text-white/25 font-mono" style={{ fontSize: 10 }}>{width}×{height}px</span>
          <span className="text-white/15 ml-3" style={{ fontSize: 10 }}>{platform.cover.note}</span>
        </div>
        <div className="flex gap-1.5">
          <ExportButton label="PNG" onClick={() => handleExport('png')} variant="primary" />
          <ExportButton label="JPEG" onClick={() => handleExport('jpeg')} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOCKUP PROFILE (icon + wordmark inside DP)
// ============================================================================
function LockupProfilePreview({
  bgColor,
  variant,
  wordColor,
  label,
}: {
  bgColor: string;
  variant: "brand-dark" | "brand-light" | "mono-white" | "mono-black";
  wordColor: string;
  label: string;
}) {
  const previewSize = 120;
  const iconSize = Math.round(previewSize * 0.35);
  const wordSize = Math.round(previewSize * 0.11);

  const handleExport = useCallback(async (format: 'png' | 'jpeg', size: number) => {
    const logoSize = Math.round(size * 0.38);
    const wSize = Math.round(size * 0.12);
    const logoSvg = getLogoSVG(variant, logoSize);
    const wordSvg = getWordmarkSVG(wordColor, wSize);
    const wordW = Math.round(wSize * 4.2);
    const wordH = Math.round(wSize * 1.4);
    const logoX = Math.round((size - logoSize) / 2);
    const logoY = Math.round(size * 0.22);
    const wordX = Math.round((size - wordW) / 2);
    const wordY = logoY + logoSize + Math.round(size * 0.03);
    const canvas = await renderToCanvas(size, size, bgColor, [
      { svg: logoSvg, x: logoX, y: logoY, w: logoSize, h: logoSize },
      { svg: wordSvg, x: wordX, y: wordY, w: wordW, h: wordH },
    ]);
    downloadCanvas(canvas, `SYSmoAI_DP_Lockup_${label.replace(/\s/g, '_')}_${size}`, format);
  }, [bgColor, variant, wordColor, label]);

  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-full overflow-hidden flex flex-col items-center justify-center mb-4"
        style={{
          width: previewSize,
          height: previewSize,
          background: bgColor,
          boxShadow: `0 0 0 1px ${bgColor === '#000000' || bgColor === '#0A0B0F' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: getLogoSVG(variant, iconSize) }} />
        <div style={{ marginTop: 2 }} dangerouslySetInnerHTML={{ __html: getWordmarkSVG(wordColor, wordSize) }} />
      </div>
      <div className="text-white/60 mb-2" style={{ fontSize: 11, fontWeight: 600 }}>{label}</div>
      <div className="flex gap-1.5">
        <ExportButton label="512 PNG" onClick={() => handleExport('png', 512)} variant="primary" />
        <ExportButton label="1024 PNG" onClick={() => handleExport('png', 1024)} />
      </div>
    </div>
  );
}

// ============================================================================
// BATCH EXPORT
// ============================================================================
function BatchExportButton({ onExport }: { onExport: () => void }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const handleClick = async () => {
    setState("loading");
    try {
      await onExport();
      setState("done");
      setTimeout(() => setState("idle"), 3000);
    } catch {
      setState("idle");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className="px-5 py-2.5 rounded-lg transition-all cursor-pointer"
      style={{
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.05em',
        background: state === "done" ? "rgba(16,185,129,0.15)" : "rgba(37,99,235,0.12)",
        color: state === "done" ? "#10B981" : "#60A5FA",
        border: `1px solid ${state === "done" ? "rgba(16,185,129,0.25)" : "rgba(37,99,235,0.2)"}`,
      }}
    >
      {state === "loading" ? "EXPORTING..." : state === "done" ? "✓ ALL EXPORTED" : "EXPORT ALL ASSETS"}
    </button>
  );
}

// ============================================================================
// MAIN EXPORT: SOCIAL MEDIA SECTIONS
// ============================================================================
export function SocialMediaProfileSection() {
  const handleBatchExport = useCallback(async () => {
    for (const platform of PLATFORMS) {
      const size = platform.profile.width;
      const logoSize = Math.round(size * 0.55);
      const logoOffset = Math.round((size - logoSize) / 2);

      // Brand on dark
      const svgDark = getLogoSVG("brand-dark", logoSize);
      const canvasDark = await renderToCanvas(size, size, '#000000', [
        { svg: svgDark, x: logoOffset, y: logoOffset, w: logoSize, h: logoSize },
      ]);
      downloadCanvas(canvasDark, `SYSmoAI_DP_${platform.name}_Dark_${size}`, 'png');

      // Small delay to not overwhelm browser
      await new Promise(r => setTimeout(r, 200));

      // Mono white
      const svgWhite = getLogoSVG("mono-white", logoSize);
      const canvasWhite = await renderToCanvas(size, size, '#000000', [
        { svg: svgWhite, x: logoOffset, y: logoOffset, w: logoSize, h: logoSize },
      ]);
      downloadCanvas(canvasWhite, `SYSmoAI_DP_${platform.name}_Mono_${size}`, 'png');

      await new Promise(r => setTimeout(r, 200));
    }
  }, []);

  return (
    <>
      {/* ━━━ PROFILE PICTURES — ICON ONLY ━━━ */}
      <SocialSection
        id="social-profile-icon"
        num="09"
        title="Social Media — Profile Pictures (Icon)"
        subtitle="Icon-only DP assets for all platforms. 512×512 universal export, circular crop safe."
      >
        {/* Dark BG variants */}
        <div className="mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="text-white/30" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em' }}>ON DARK BACKGROUND</span>
        </div>
        <div className="grid grid-cols-7 gap-5 mb-10">
          {PLATFORMS.map((p) => (
            <ProfilePreview key={p.name + "-dark"} platform={p} bgColor="#000000" variant="brand-dark" />
          ))}
        </div>

        {/* Light BG variants */}
        <div className="mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="text-white/30" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em' }}>ON LIGHT BACKGROUND</span>
        </div>
        <div className="grid grid-cols-7 gap-5 mb-10">
          {PLATFORMS.map((p) => (
            <ProfilePreview key={p.name + "-light"} platform={p} bgColor="#FFFFFF" variant="brand-light" />
          ))}
        </div>

        {/* Mono variants */}
        <div className="mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="text-white/30" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em' }}>MONOCHROME</span>
        </div>
        <div className="grid grid-cols-7 gap-5">
          {PLATFORMS.map((p) => (
            <ProfilePreview key={p.name + "-mono"} platform={p} bgColor="#000000" variant="mono-white" />
          ))}
        </div>
      </SocialSection>

      {/* ━━━ PROFILE PICTURES — LOCKUP (ICON + WORDMARK) ━━━ */}
      <SocialSection
        id="social-profile-lockup"
        num="10"
        title="Social Media — Profile Pictures (Lockup)"
        subtitle="Stacked icon + wordmark for contexts where the name needs to be visible in the DP."
      >
        <div className="grid grid-cols-4 gap-8">
          <LockupProfilePreview bgColor="#000000" variant="brand-dark" wordColor="#FFFFFF" label="Brand Dark" />
          <LockupProfilePreview bgColor="#FFFFFF" variant="brand-light" wordColor="#000000" label="Brand Light" />
          <LockupProfilePreview bgColor="#000000" variant="mono-white" wordColor="#FFFFFF" label="Mono White" />
          <LockupProfilePreview bgColor="#FFFFFF" variant="mono-black" wordColor="#000000" label="Mono Black" />
        </div>
      </SocialSection>

      {/* ━━━ COVER PHOTOS ━━━ */}
      <SocialSection
        id="cover-photos"
        num="11"
        title="Social Media — Cover Photos"
        subtitle="Platform-specific banner dimensions with centered lockup."
      >
        <div className="space-y-4">
          {PLATFORMS.filter(p => p.cover).map((p) => (
            <div key={p.name + "-cover"} className="grid grid-cols-2 gap-4">
              <CoverPreview platform={p} bgColor="#000000" variant="brand-dark" wordColor="#FFFFFF" />
              <CoverPreview platform={p} bgColor="#FFFFFF" variant="brand-light" wordColor="#000000" />
            </div>
          ))}
        </div>
      </SocialSection>

      {/* ━━━ PLATFORM SPEC MATRIX ━━━ */}
      <SocialSection
        id="platform-matrix"
        num="12"
        title="Platform Specification Matrix"
        subtitle="Complete reference of all sizes, formats, and crop behaviors across platforms."
      >
        <div className="bg-[#08090D] rounded-2xl border border-white/[0.04] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-6 gap-px bg-white/[0.04]">
            {["Platform", "DP Size", "DP Crop", "Cover Size", "Formats", "Notes"].map((h) => (
              <div key={h} className="bg-[#0D0E14] px-5 py-3" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)' }}>
                {h}
              </div>
            ))}
          </div>
          {/* Table rows */}
          {PLATFORMS.map((p) => (
            <div key={p.name} className="grid grid-cols-6 gap-px bg-white/[0.04]">
              <div className="bg-[#08090D] px-5 py-3.5 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                <span className="text-white/70" style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</span>
              </div>
              <div className="bg-[#08090D] px-5 py-3.5">
                <span className="text-white/60 font-mono" style={{ fontSize: 12 }}>{p.profile.width}×{p.profile.height}</span>
              </div>
              <div className="bg-[#08090D] px-5 py-3.5">
                <span className="text-white/40" style={{ fontSize: 12 }}>Circle</span>
              </div>
              <div className="bg-[#08090D] px-5 py-3.5">
                <span className="text-white/60 font-mono" style={{ fontSize: 12 }}>
                  {p.cover ? `${p.cover.width}×${p.cover.height}` : "—"}
                </span>
              </div>
              <div className="bg-[#08090D] px-5 py-3.5">
                <span className="text-white/40" style={{ fontSize: 12 }}>PNG, JPEG</span>
              </div>
              <div className="bg-[#08090D] px-5 py-3.5">
                <span className="text-white/30" style={{ fontSize: 11 }}>{p.profile.note}</span>
              </div>
            </div>
          ))}
        </div>
      </SocialSection>

      {/* ━━━ BATCH EXPORT ━━━ */}
      <SocialSection
        id="batch-export"
        num="13"
        title="Batch Export"
        subtitle="Download all profile picture variants at once (brand dark + mono for each platform)."
      >
        <div className="bg-[#08090D] rounded-2xl border border-white/[0.04] p-10 flex flex-col items-center gap-6">
          <div className="text-white/30 text-center" style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 500 }}>
            Exports 14 PNG files — one brand-dark and one mono-white profile picture per platform at 512×512.
          </div>
          <BatchExportButton onExport={handleBatchExport} />
          <div className="text-white/15 font-mono" style={{ fontSize: 10 }}>
            7 platforms × 2 variants = 14 files
          </div>
        </div>
      </SocialSection>
    </>
  );
}

// ============================================================================
// UTILITY
// ============================================================================
function SocialSection({ id, num, title, subtitle, children }: { id?: string; num: string; title: string; subtitle: string; children: React.ReactNode }) {
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