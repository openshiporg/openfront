interface SYSmoAILogoProps {
  size?: number;
  variant?: "mono-black" | "mono-white" | "brand-dark" | "brand-light";
  showGrid?: boolean;
}

export const SYSmoAILogo = ({
  size = 80,
  variant = "mono-white",
  showGrid = false,
}: SYSmoAILogoProps) => {
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {showGrid && (
        <g opacity={0.1}>
          <line x1="50" y1="0" x2="50" y2="100" stroke="#60A5FA" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#60A5FA" strokeWidth="0.5" />
          <rect x="22" y="22" width="56" height="56" stroke="#60A5FA" strokeWidth="0.3" strokeDasharray="2 2" />
        </g>
      )}
      <path
        d={paths.layer1}
        fill={s.l1Fill}
        fillOpacity={s.l1FillOp}
        stroke={s.l1Stroke}
        strokeOpacity={s.l1StrokeOp}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d={paths.layer2}
        fill={s.l2Fill}
        fillOpacity={s.l2FillOp}
        stroke={s.l2Stroke}
        strokeOpacity={s.l2StrokeOp}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d={paths.layer3}
        fill={s.l3Fill}
        fillOpacity={s.l3FillOp}
        stroke={s.l3Stroke}
        strokeOpacity={s.l3StrokeOp}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface SYSmoAIWordmarkProps {
  size?: number;
  color?: string;
  tracking?: number;
}

export const SYSmoAIWordmark = ({
  size = 36,
  color = "white",
  tracking = -0.5,
}: SYSmoAIWordmarkProps) => (
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
