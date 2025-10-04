'use client';

import { useRef, useCallback } from 'react';

interface HueWheelProps {
  value: number;
  onValueChange: (hue: number) => void;
  size?: number;
}

export function HueWheel({ value, onValueChange, size = 200 }: HueWheelProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getHueFromPosition = useCallback((x: number, y: number, rect: DOMRect) => {
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - rect.left - centerX;
    const dy = y - rect.top - centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;
    return Math.round(angle);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const hue = getHueFromPosition(e.clientX, e.clientY, rect);
      onValueChange(hue);
    }
  }, [getHueFromPosition, onValueChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const hue = getHueFromPosition(e.clientX, e.clientY, rect);
      onValueChange(hue);
    }
  }, [getHueFromPosition, onValueChange]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const radius = size / 2;
  const safeValue = isNaN(value) || value === null || value === undefined ? 0 : value;
  const angle = (safeValue - 90) * (Math.PI / 180);
  const indicatorX = radius + Math.cos(angle) * (radius - 15);
  const indicatorY = radius + Math.sin(angle) * (radius - 15);

  return (
    <div
      ref={canvasRef}
      className="relative cursor-pointer select-none touch-none"
      style={{ width: size, height: size }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="hue-gradient" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF0000" />
            <stop offset="16.66%" stopColor="#FFFF00" />
            <stop offset="33.33%" stopColor="#00FF00" />
            <stop offset="50%" stopColor="#00FFFF" />
            <stop offset="66.66%" stopColor="#0000FF" />
            <stop offset="83.33%" stopColor="#FF00FF" />
            <stop offset="100%" stopColor="#FF0000" />
          </linearGradient>
          <mask id="ring-mask">
            <circle cx={radius} cy={radius} r={radius} fill="white" />
            <circle cx={radius} cy={radius} r={radius - 30} fill="black" />
          </mask>
        </defs>

        {/* Color wheel ring using conic gradient simulation */}
        {Array.from({ length: 360 }).map((_, i) => {
          const startAngle = (i - 90) * (Math.PI / 180);
          const endAngle = (i + 1 - 90) * (Math.PI / 180);
          const x1 = radius + Math.cos(startAngle) * (radius - 30);
          const y1 = radius + Math.sin(startAngle) * (radius - 30);
          const x2 = radius + Math.cos(startAngle) * radius;
          const y2 = radius + Math.sin(startAngle) * radius;
          const x3 = radius + Math.cos(endAngle) * radius;
          const y3 = radius + Math.sin(endAngle) * radius;
          const x4 = radius + Math.cos(endAngle) * (radius - 30);
          const y4 = radius + Math.sin(endAngle) * (radius - 30);

          // Base logo hue is blue (≈240°). Show result of rotation: baseHue + rotation
          const resultHue = (240 + i) % 360;

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`}
              fill={`hsl(${resultHue}, 100%, 50%)`}
            />
          );
        })}

        {/* Indicator */}
        <circle
          cx={indicatorX}
          cy={indicatorY}
          r="8"
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
