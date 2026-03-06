"use client";

import React, { useRef, useState, MouseEvent, ReactNode, CSSProperties } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant =
  | "primary"    // solid green — main CTAs e.g. "Analyze", "Run"
  | "secondary"  // dark bg + border — secondary actions e.g. "Export", "Copy"
  | "ghost"      // no bg, no border — subtle actions e.g. "Cancel", "Back"
  | "danger"     // red tint — destructive actions e.g. "Delete"
  | "outline"    // border glow on hover — nav/filter buttons

type ButtonSize = "sm" | "md" | "lg"

interface VortexButtonProps {
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const sizeMap: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-[11px]",
  md: "px-4 py-2 text-xs",
  lg: "px-6 py-3 text-sm",
}

const variantMap: Record<ButtonVariant, {
  base: string;
  hover: string;
  ripple: string;
  glow: string;
}> = {
  primary: {
    base:   "bg-[#4ec9b0]/10 border border-[#4ec9b0]/40 text-[#4ec9b0]",
    hover:  "hover:bg-[#4ec9b0]/20 hover:border-[#4ec9b0]/70 hover:text-white",
    ripple: "rgba(78,201,176,0.25)",
    glow:   "#4ec9b0",
  },
  secondary: {
    base:   "bg-[#252526] border border-[#3e3e42] text-[#d4d4d4]",
    hover:  "hover:border-[#4ec9b0]/40 hover:text-white",
    ripple: "rgba(78,201,176,0.12)",
    glow:   "#4ec9b0",
  },
  ghost: {
    base:   "bg-transparent border border-transparent text-[#6b6b6b]",
    hover:  "hover:text-[#d4d4d4] hover:border-[#3e3e42]",
    ripple: "rgba(212,212,212,0.08)",
    glow:   "#6b6b6b",
  },
  danger: {
    base:   "bg-[#f48771]/10 border border-[#f48771]/30 text-[#f48771]",
    hover:  "hover:bg-[#f48771]/20 hover:border-[#f48771]/60 hover:text-white",
    ripple: "rgba(244,135,113,0.2)",
    glow:   "#f48771",
  },
  outline: {
    base:   "bg-transparent border border-[#3e3e42] text-[#d4d4d4]",
    hover:  "hover:border-[#4ec9b0]/50 hover:text-[#4ec9b0]",
    ripple: "rgba(78,201,176,0.1)",
    glow:   "#4ec9b0",
  },
}

const RIPPLE_STYLES = `
  @keyframes vortex-ripple {
    0%   { transform: scale(0); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }
  .vortex-ripple-span {
    animation: vortex-ripple 600ms ease-out forwards;
  }
`

interface RippleState {
  key: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VortexButton({
  children,
  onClick,
  variant = "secondary",
  size = "md",
  disabled = false,
  className = "",
  icon,
  iconPosition = "left",
  fullWidth = false,
}: VortexButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<RippleState[]>([]);

  const { base, hover, ripple, glow } = variantMap[variant];

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setGlowPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const key = Date.now();
    setRipples((prev) => [...prev, { key, x, y, size, color: ripple }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.key !== key)), 600);
    onClick?.(e);
  };

  const classes = [
    "relative inline-flex items-center justify-center gap-2",
    "font-mono rounded-sm overflow-hidden",
    "transition-all duration-200 cursor-pointer select-none",
    "focus:outline-none focus-visible:ring-1 focus-visible:ring-[#4ec9b0]/50",
    sizeMap[size],
    base,
    hover,
    fullWidth ? "w-full" : "",
    disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: RIPPLE_STYLES }} />
      <button
        ref={buttonRef}
        className={classes}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={disabled}
      >
        {/* Glow */}
        <div
          className="absolute pointer-events-none rounded-full transition-opacity duration-200"
          style={{
            width: 120,
            height: 120,
            left: glowPos.x - 60,
            top: glowPos.y - 60,
            background: `radial-gradient(circle, ${glow}22 0%, transparent 70%)`,
            opacity: hovered ? 1 : 0,
          } as CSSProperties}
        />

        {/* Ripples */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm">
          {ripples.map((r) => (
            <span
              key={r.key}
              className="absolute rounded-full vortex-ripple-span"
              style={{ left: r.x, top: r.y, width: r.size, height: r.size, backgroundColor: r.color } as CSSProperties}
            />
          ))}
        </div>

        {/* Content */}
        {icon && iconPosition === "left" && <span className="relative z-10 flex items-center">{icon}</span>}
        {children && <span className="relative z-10">{children}</span>}
        {icon && iconPosition === "right" && <span className="relative z-10 flex items-center">{icon}</span>}
      </button>
    </>
  );
}

export default VortexButton;