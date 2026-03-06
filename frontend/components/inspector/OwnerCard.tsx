"use client";

import React from "react";
import { User, Code2, ChevronRight } from "lucide-react";
import { VortexButton } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OwnerFunction {
  functionName: string;
  filepath: string;
}

export interface OwnerCardProps {
  primaryOwner: string;
  confidence: number;
  totalCommits: number;
  otherFunctions: OwnerFunction[];
  onInspect?: (functionName: string) => void;
}

// ─── Confidence bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 75 ? "#4ec9b0" :
    pct >= 45 ? "#dcdcaa" :
    "#f48771";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
          Confidence
        </span>
        <span className="font-mono text-[10px]" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div className="h-[3px] w-full bg-[#3e3e42] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OwnerCard({
  primaryOwner,
  confidence,
  totalCommits,
  otherFunctions,
  onInspect,
}: OwnerCardProps) {
  return (
    <div className="flex flex-col gap-4 bg-[#252526] border border-[#3e3e42] rounded-sm p-4">

      {/* Section label */}
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
        Ownership
      </span>

      {/* Owner identity */}
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-sm bg-[#4ec9b0]/10 border border-[#4ec9b0]/30 flex items-center justify-center shrink-0">
          <User size={15} className="text-[#4ec9b0]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-mono text-sm text-white">{primaryOwner}</span>
          <span className="font-mono text-[10px] text-[#6b6b6b]">
            {totalCommits} commits
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <ConfidenceBar value={confidence} />

      {/* Divider */}
      <div className="h-px bg-[#3e3e42]" />

      {/* Other functions */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
          Also owns
        </span>

        {otherFunctions.length === 0 ? (
          <p className="font-mono text-[11px] text-[#6b6b6b]">
            No other functions found.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {otherFunctions.slice(0, 5).map((fn) => (
              <button
                key={fn.functionName}
                onClick={() => onInspect?.(fn.functionName)}
                className="flex items-center gap-2 w-full text-left px-2 py-[6px] rounded-sm hover:bg-[#2a2d2e] border border-transparent hover:border-[#3e3e42] transition-colors group"
              >
                <Code2 size={11} className="text-[#6b6b6b] shrink-0 group-hover:text-[#4ec9b0] transition-colors" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-mono text-[11px] text-[#d4d4d4] truncate group-hover:text-white transition-colors">
                    {fn.functionName}
                  </span>
                  <span className="font-mono text-[9px] text-[#6b6b6b] truncate">
                    {fn.filepath}
                  </span>
                </div>
                <ChevronRight
                  size={10}
                  className="text-[#3e3e42] shrink-0 group-hover:text-[#4ec9b0] transition-colors"
                />
              </button>
            ))}
          </div>
        )}

        {otherFunctions.length > 5 && (
          <VortexButton variant="ghost" size="sm" fullWidth>
            +{otherFunctions.length - 5} more
          </VortexButton>
        )}
      </div>

    </div>
  );
}

export default OwnerCard;