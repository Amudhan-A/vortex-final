"use client";

import React, { useState } from "react";
import { Code2, ChevronRight, ChevronDown, Zap, GitBranch } from "lucide-react";
import { AnimatedBadge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Severity = "direct" | "indirect";

export interface BlastRadiusEntry {
  functionName: string;
  filepath: string;
  severity: Severity;
}

export interface BlastRadiusListProps {
  functionName: string;
  entries: BlastRadiusEntry[];
  onInspect?: (functionName: string) => void;
}

// ─── Severity config ──────────────────────────────────────────────────────────

const severityConfig: Record<Severity, { label: string; color: string; dimColor: string }> = {
  direct:   { label: "direct",   color: "#f48771", dimColor: "#f4877130" },
  indirect: { label: "indirect", color: "#dcdcaa", dimColor: "#dcdcaa30" },
};

// ─── File group ───────────────────────────────────────────────────────────────

function FileGroup({
  filepath,
  entries,
  onInspect,
}: {
  filepath: string;
  entries: BlastRadiusEntry[];
  onInspect?: (fn: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const directCount   = entries.filter((e) => e.severity === "direct").length;
  const indirectCount = entries.filter((e) => e.severity === "indirect").length;

  return (
    <div className="flex flex-col">
      {/* File header */}
      <button
        onClick={() => setExpanded((s) => !s)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-[#2a2d2e] transition-colors group w-full text-left"
      >
        <ChevronDown
          size={11}
          className={`text-[#6b6b6b] shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-0" : "-rotate-90"
          }`}
        />
        <GitBranch size={11} className="text-[#6b6b6b] shrink-0" />
        <span className="font-mono text-[11px] text-[#d4d4d4] truncate flex-1">
          {filepath}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {directCount > 0 && (
            <span
              className="font-mono text-[9px] px-1.5 py-[1px] rounded-sm border"
              style={{
                color: severityConfig.direct.color,
                borderColor: severityConfig.direct.dimColor,
                backgroundColor: severityConfig.direct.dimColor,
              }}
            >
              {directCount} direct
            </span>
          )}
          {indirectCount > 0 && (
            <span
              className="font-mono text-[9px] px-1.5 py-[1px] rounded-sm border"
              style={{
                color: severityConfig.indirect.color,
                borderColor: severityConfig.indirect.dimColor,
                backgroundColor: severityConfig.indirect.dimColor,
              }}
            >
              {indirectCount} indirect
            </span>
          )}
        </div>
      </button>

      {/* Function rows */}
      {expanded && (
        <div className="flex flex-col pl-6">
          {entries.map((entry) => {
            const { color, dimColor } = severityConfig[entry.severity];
            return (
              <button
                key={entry.functionName}
                onClick={() => onInspect?.(entry.functionName)}
                className="flex items-center gap-2 px-3 py-[6px] hover:bg-[#2a2d2e] border border-transparent hover:border-[#3e3e42] rounded-sm transition-colors group w-full text-left"
              >
                {/* Severity dot */}
                <div
                  className="size-[6px] rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />

                {/* Function name */}
                <Code2 size={11} className="text-[#6b6b6b] shrink-0 group-hover:text-[#4ec9b0] transition-colors" />
                <span className="font-mono text-[11px] text-[#d4d4d4] truncate flex-1 group-hover:text-white transition-colors">
                  {entry.functionName}
                </span>

                {/* Severity label */}
                <span
                  className="font-mono text-[9px] shrink-0"
                  style={{ color }}
                >
                  {entry.severity}
                </span>

                <ChevronRight
                  size={10}
                  className="text-[#3e3e42] shrink-0 group-hover:text-[#4ec9b0] transition-colors"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BlastRadiusList({
  functionName,
  entries,
  onInspect,
}: BlastRadiusListProps) {
  const directCount   = entries.filter((e) => e.severity === "direct").length;
  const indirectCount = entries.filter((e) => e.severity === "indirect").length;

  // Group by filepath
  const grouped = entries.reduce<Record<string, BlastRadiusEntry[]>>((acc, entry) => {
    if (!acc[entry.filepath]) acc[entry.filepath] = [];
    acc[entry.filepath].push(entry);
    return acc;
  }, {});

  return (
    <div className="flex flex-col bg-[#252526] border border-[#3e3e42] rounded-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#3e3e42]">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-[#f48771]" />
          <span className="font-mono text-sm text-white">Blast Radius</span>
          <span className="font-mono text-[10px] text-[#6b6b6b]">
            — changes to{" "}
            <span className="text-[#4ec9b0]">{functionName}</span> affect:
          </span>
        </div>
        <AnimatedBadge
          text={`${entries.length} affected`}
          variant={directCount > 3 ? "live" : "new"}
        />
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#3e3e42]">
        <span
          className="font-mono text-[10px] px-2 py-[2px] rounded-sm border"
          style={{
            color: severityConfig.direct.color,
            borderColor: severityConfig.direct.dimColor,
            backgroundColor: severityConfig.direct.dimColor,
          }}
        >
          {directCount} direct
        </span>
        <span
          className="font-mono text-[10px] px-2 py-[2px] rounded-sm border"
          style={{
            color: severityConfig.indirect.color,
            borderColor: severityConfig.indirect.dimColor,
            backgroundColor: severityConfig.indirect.dimColor,
          }}
        >
          {indirectCount} indirect
        </span>
        <span className="font-mono text-[10px] text-[#6b6b6b]">
          across {Object.keys(grouped).length} files
        </span>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="px-4 py-6 text-center">
          <p className="font-mono text-xs text-[#6b6b6b]">
            No affected functions found.
          </p>
        </div>
      )}

      {/* File groups */}
      <div className="flex flex-col divide-y divide-[#3e3e42]">
        {Object.entries(grouped).map(([filepath, groupEntries]) => (
          <FileGroup
            key={filepath}
            filepath={filepath}
            entries={groupEntries}
            onInspect={onInspect}
          />
        ))}
      </div>

    </div>
  );
}

export default BlastRadiusList;