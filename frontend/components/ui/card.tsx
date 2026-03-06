"use client";

import React, { useEffect, useRef } from "react";
import { Code2, Zap, FileText, User, GitBranch, Clock, ChevronRight } from "lucide-react";

// ─── Glow core ────────────────────────────────────────────────────────────────

const glowStyles = `
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }
  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
    );
    filter: brightness(2);
  }
  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
    );
  }
  [data-glow] [data-glow] {
    position: absolute;
    inset: 0;
    will-change: filter;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    border-width: calc(var(--border-size) * 20);
    filter: blur(calc(var(--border-size) * 10));
    background: none;
    pointer-events: none;
    border: none;
  }
  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }
`;

function GlowBase({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = (e: PointerEvent) => {
      if (!cardRef.current) return;
      cardRef.current.style.setProperty("--x", e.clientX.toFixed(2));
      cardRef.current.style.setProperty("--xp", (e.clientX / window.innerWidth).toFixed(2));
      cardRef.current.style.setProperty("--y", e.clientY.toFixed(2));
      cardRef.current.style.setProperty("--yp", (e.clientY / window.innerHeight).toFixed(2));
    };
    document.addEventListener("pointermove", sync);
    return () => document.removeEventListener("pointermove", sync);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: glowStyles }} />
      <div
        ref={cardRef}
        data-glow
        onClick={onClick}
        style={{
          "--base": 150,
          "--spread": 60,
          "--radius": "6",
          "--border": "1",
          "--backdrop": "hsl(0 0% 10% / 0.85)",
          "--backup-border": "#3e3e42",
          "--size": "220",
          "--outer": "1",
          "--border-size": "calc(var(--border, 1) * 1px)",
          "--spotlight-size": "calc(var(--size, 150) * 1px)",
          "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
          backgroundImage: `radial-gradient(
            var(--spotlight-size) var(--spotlight-size) at
            calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
            hsl(var(--hue, 150) 80% 50% / 0.06), transparent
          )`,
          backgroundColor: "var(--backdrop)",
          backgroundAttachment: "fixed",
          border: "1px solid #3e3e42",
          position: "relative",
          touchAction: "none",
        } as React.CSSProperties}
        className={`rounded-sm relative cursor-pointer transition-colors duration-200 hover:border-[#4ec9b0]/40 ${className}`}
      >
        <div ref={innerRef} data-glow />
        {children}
      </div>
    </>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FunctionCardProps {
  functionName: string;
  filepath: string;
  primaryOwner: string;
  whyItExists: string;
  blastRadius: string[];
  generatedAt: string;
  onClick?: () => void;
}

export interface SearchResultCardProps {
  functionName: string;
  filepath: string;
  repo: string;
  snippet: string;
  owner: string;
  onClick?: () => void;
}

export interface DocumentCardProps {
  title: string;
  functionName: string;
  generatedAt: string;
  format: "markdown" | "pdf" | "json";
  sizeLabel?: string;
  onDownload?: () => void;
  onClick?: () => void;
}

// ─── Inspector function card ──────────────────────────────────────────────────

export function FunctionCard({
  functionName,
  filepath,
  primaryOwner,
  whyItExists,
  blastRadius,
  generatedAt,
  onClick,
}: FunctionCardProps) {
  return (
    <GlowBase className="p-4 flex flex-col gap-3 w-full" onClick={onClick}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Code2 size={13} className="text-[#4ec9b0] shrink-0 mt-[1px]" />
          <span className="font-mono text-sm text-white">{functionName}</span>
        </div>
        <ChevronRight size={13} className="text-[#6b6b6b] shrink-0 mt-[2px]" />
      </div>

      {/* Filepath */}
      <span className="font-mono text-[10px] text-[#6b6b6b] truncate">{filepath}</span>

      {/* Why it exists */}
      <p className="font-mono text-xs text-[#d4d4d4] leading-relaxed line-clamp-2">
        {whyItExists}
      </p>

      {/* Blast radius preview */}
      {blastRadius.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {blastRadius.slice(0, 3).map((fn) => (
            <span
              key={fn}
              className="font-mono text-[10px] bg-[#2a2d2e] border border-[#3e3e42] text-[#6b6b6b] px-2 py-[2px] rounded-sm"
            >
              {fn}
            </span>
          ))}
          {blastRadius.length > 3 && (
            <span className="font-mono text-[10px] text-[#6b6b6b] px-1 py-[2px]">
              +{blastRadius.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#3e3e42]">
        <div className="flex items-center gap-1">
          <User size={11} className="text-[#6b6b6b]" />
          <span className="font-mono text-[10px] text-[#6b6b6b]">{primaryOwner}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={11} className="text-[#6b6b6b]" />
          <span className="font-mono text-[10px] text-[#6b6b6b]">
            {new Date(generatedAt).toISOString().slice(0, 10)}
          </span>
        </div>
      </div>
    </GlowBase>
  );
}

// ─── Search result card ───────────────────────────────────────────────────────

export function SearchResultCard({
  functionName,
  filepath,
  repo,
  snippet,
  owner,
  onClick,
}: SearchResultCardProps) {
  return (
    <GlowBase className="p-4 flex flex-col gap-2 w-full" onClick={onClick}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-[#4ec9b0] shrink-0" />
          <span className="font-mono text-sm text-white">{functionName}</span>
        </div>
        <span className="font-mono text-[10px] text-[#4ec9b0] bg-[#4ec9b0]/10 px-2 py-[2px] rounded-sm border border-[#4ec9b0]/20">
          match
        </span>
      </div>

      {/* Repo + filepath */}
      <div className="flex items-center gap-1">
        <GitBranch size={11} className="text-[#6b6b6b]" />
        <span className="font-mono text-[10px] text-[#6b6b6b]">{repo}</span>
        <span className="text-[#3e3e42] mx-1">/</span>
        <span className="font-mono text-[10px] text-[#6b6b6b] truncate">{filepath}</span>
      </div>

      {/* Snippet */}
      <p className="font-mono text-xs text-[#d4d4d4] leading-relaxed line-clamp-2 bg-[#1e1e1e] border border-[#3e3e42] px-3 py-2 rounded-sm">
        {snippet}
      </p>

      {/* Owner */}
      <div className="flex items-center gap-1 pt-1">
        <User size={11} className="text-[#6b6b6b]" />
        <span className="font-mono text-[10px] text-[#6b6b6b]">{owner}</span>
      </div>
    </GlowBase>
  );
}

// ─── Document card ────────────────────────────────────────────────────────────

const formatColors = {
  markdown: "text-[#4ec9b0] border-[#4ec9b0]/20 bg-[#4ec9b0]/10",
  pdf:      "text-[#f48771] border-[#f48771]/20 bg-[#f48771]/10",
  json:     "text-[#dcdcaa] border-[#dcdcaa]/20 bg-[#dcdcaa]/10",
};

export function DocumentCard({
  title,
  functionName,
  generatedAt,
  format,
  sizeLabel,
  onDownload,
  onClick,
}: DocumentCardProps) {
  return (
    <GlowBase className="p-4 flex flex-col gap-3 w-full" onClick={onClick}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-[#4ec9b0] shrink-0 mt-[1px]" />
          <span className="font-mono text-sm text-white truncate">{title}</span>
        </div>
        <span className={`font-mono text-[10px] px-2 py-[2px] rounded-sm border shrink-0 ${formatColors[format]}`}>
          .{format}
        </span>
      </div>

      {/* Function name */}
      <span className="font-mono text-[10px] text-[#6b6b6b]">
        fn: <span className="text-[#d4d4d4]">{functionName}</span>
      </span>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#3e3e42]">
        <div className="flex items-center gap-1">
          <Clock size={11} className="text-[#6b6b6b]" />
          <span className="font-mono text-[10px] text-[#6b6b6b]">
            {new Date(generatedAt).toLocaleDateString()}
          </span>
          {sizeLabel && (
            <span className="font-mono text-[10px] text-[#6b6b6b] ml-2">{sizeLabel}</span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDownload?.(); }}
          className="font-mono text-[10px] text-[#4ec9b0] hover:text-white transition-colors"
        >
          download
        </button>
      </div>
    </GlowBase>
  );
}