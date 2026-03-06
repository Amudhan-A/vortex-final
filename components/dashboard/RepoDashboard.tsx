"use client";

import React, { useState } from "react";
import { GitBranch, Clock, Code2, User, ChevronRight, Search } from "lucide-react";
import { FunctionCard } from "@/components/ui/card";
import { AnimatedBadge } from "@/components/ui/badge";
import { VortexButton } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export interface Contributor {
  name: string;
  commits: number;
  functions: number;
}

export interface RecentFunction {
  functionName: string;
  filepath: string;
  primaryOwner: string;
  whyItExists: string;
  blastRadius: string[];
  generatedAt: string;
}

export interface RepoDashboardProps {
  repoName: string;
  branch: string;
  lastAnalyzed: string;
  totalFunctions: number;
  contributors: Contributor[];
  recentFunctions: RecentFunction[];
  onInspect?: (functionName: string) => void;
  onViewAll?: () => void;
  onContributorClick?: (name: string) => void;
  onGoToInspect?: () => void;
  ownership?: { name: string; functions: number }[];
}

const PIE_COLORS = [
  "#4ec9b0",
  "#dcdcaa",
  "#9cdcfe",
  "#ce9178",
  "#c586c0",
  "#6b6b6b",
];

function StatTile({ label, value, icon }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 bg-[#252526] border border-[#3e3e42] rounded-sm p-4 flex-1 min-w-[120px]">
      <div className="flex items-center gap-2 text-[#6b6b6b]">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <span className="font-mono text-2xl text-white">{value}</span>
    </div>
  );
}

function ContributorRow({ contributor, rank, max, onClick }: {
  contributor: Contributor;
  rank: number;
  max: number;
  onClick?: () => void;
}) {
  const pct = Math.round((contributor.commits / max) * 100);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 py-2 border-b border-[#3e3e42] last:border-0 hover:bg-[#2a2d2e] cursor-pointer transition-colors px-1 rounded-sm"
    >
      <span className="font-mono text-[10px] text-[#6b6b6b] w-4 shrink-0">
        {rank === 1 ? "▲" : rank === 2 ? "▲" : "·"}
      </span>
      <div className="size-6 rounded-sm bg-[#2a2d2e] border border-[#3e3e42] flex items-center justify-center shrink-0">
        <User size={11} className="text-[#4ec9b0]" />
      </div>
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-[#d4d4d4] truncate">{contributor.name}</span>
          <span className="font-mono text-[10px] text-[#6b6b6b] ml-2 shrink-0">
            {contributor.commits} commits
          </span>
        </div>
        <div className="h-[2px] w-full bg-[#3e3e42] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4ec9b0] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="font-mono text-[10px] text-[#6b6b6b] shrink-0">
        {contributor.functions} fn
      </span>
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#252526] border border-[#3e3e42] rounded-sm px-3 py-2">
      <p className="font-mono text-xs text-[#d4d4d4]">{payload[0].name}</p>
      <p className="font-mono text-[10px] text-[#4ec9b0]">{payload[0].value} functions</p>
    </div>
  );
}

function OwnershipChart({ ownership }: { ownership: { name: string; functions: number }[] }) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const total = ownership.reduce((sum, o) => sum + o.functions, 0);

  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
        Ownership Breakdown
      </span>
      <div className="bg-[#252526] border border-[#3e3e42] rounded-sm p-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <PieChart width={120} height={120}>
              <Pie
                data={ownership}
                dataKey="functions"
                nameKey="name"
                cx={55}
                cy={55}
                innerRadius={30}
                outerRadius={50}
                strokeWidth={0}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                {ownership.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                    opacity={activeIndex === undefined || activeIndex === i ? 1 : 0.4}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {ownership.map((slice, i) => {
              const pct = Math.round((slice.functions / total) * 100);
              return (
                <div
                  key={slice.name}
                  className="flex items-center gap-2 cursor-default"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                >
                  <div
                    className="size-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                      opacity: activeIndex === undefined || activeIndex === i ? 1 : 0.4,
                    }}
                  />
                  <span
                    className="font-mono text-[11px] truncate flex-1"
                    style={{ color: activeIndex === i ? "#d4d4d4" : "#6b6b6b" }}
                  >
                    {slice.name}
                  </span>
                  <span className="font-mono text-[10px] text-[#6b6b6b] shrink-0">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RepoDashboard({
  repoName,
  branch,
  lastAnalyzed,
  totalFunctions,
  contributors,
  recentFunctions,
  onInspect,
  onViewAll,
  onContributorClick,
  onGoToInspect,
  ownership,
}: RepoDashboardProps) {
  const maxCommits = Math.max(...contributors.map((c) => c.commits), 1);
  const [analyzedDate, setAnalyzedDate] = React.useState("");

  React.useEffect(() => {
    setAnalyzedDate(new Date(lastAnalyzed).toLocaleDateString());
  }, [lastAnalyzed]);

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <AnimatedBadge variant="live" text="connected" />
          <h1 className="font-mono text-xl text-white mt-2">{repoName}</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <GitBranch size={11} className="text-[#6b6b6b]" />
              <span className="font-mono text-[10px] text-[#6b6b6b]">{branch}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} className="text-[#6b6b6b]" />
              <span className="font-mono text-[10px] text-[#6b6b6b]">
                analyzed {analyzedDate}
              </span>
            </div>
          </div>
        </div>

        <VortexButton
          variant="primary"
          size="sm"
          icon={<Search size={12} />}
          onClick={onGoToInspect}
        >
          Inspect
        </VortexButton>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 flex-wrap">
        <StatTile label="Functions"    value={totalFunctions}               icon={<Code2 size={12} />} />
        <StatTile label="Contributors" value={contributors.length}          icon={<User size={12} />} />
        <StatTile label="Top Owner"    value={contributors[0]?.name ?? "—"} icon={<GitBranch size={12} />} />
      </div>

      {/* Two column layout */}
      <div className="flex gap-6 flex-col lg:flex-row">

        {/* Contributors */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
              Top Contributors
            </span>
            <span className="font-mono text-[10px] text-[#3e3e42]">by commits</span>
          </div>
          <div className="bg-[#252526] border border-[#3e3e42] rounded-sm px-4 py-2">
            {contributors.slice(0, 6).map((c, i) => (
              <ContributorRow
                key={c.name}
                contributor={c}
                rank={i + 1}
                max={maxCommits}
                onClick={() => onContributorClick?.(c.name)}
              />
            ))}
          </div>
        {/* Ownership chart — sits right under the table */}
          {ownership && ownership.length > 0 && (
            <OwnershipChart ownership={ownership} />
          )}
        </div>

        {/* Recent functions */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
              Recently Analyzed
            </span>
            <VortexButton
              variant="ghost"
              size="sm"
              icon={<ChevronRight size={11} />}
              iconPosition="right"
              onClick={onViewAll}
            >
              view all
            </VortexButton>
          </div>
          <div className="flex flex-col gap-3">
            {recentFunctions.slice(0, 3).map((fn) => (
              <div key={fn.functionName}>
                <FunctionCard
                  functionName={fn.functionName}
                  filepath={fn.filepath}
                  primaryOwner={fn.primaryOwner}
                  whyItExists={fn.whyItExists}
                  blastRadius={fn.blastRadius}
                  generatedAt={fn.generatedAt}
                  onClick={() => onInspect?.(fn.functionName)}
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      

    </div>
  );
}

export default RepoDashboard;