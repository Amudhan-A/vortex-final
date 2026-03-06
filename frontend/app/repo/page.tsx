"use client";

import React from "react";
import { GitBranch, Clock, Code2, User, Activity, ChevronRight } from "lucide-react";
import { FunctionCard } from "@/components/ui/card";
import { AnimatedBadge } from "@/components/ui/badge";
import { VortexButton } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

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
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  icon,
}: {
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

// ─── Contributor row ──────────────────────────────────────────────────────────

function ContributorRow({
  contributor,
  rank,
  max,
}: {
  contributor: Contributor;
  rank: number;
  max: number;
}) {
  const pct = Math.round((contributor.commits / max) * 100);

  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#3e3e42] last:border-0">
      {/* Rank */}
      <span className="font-mono text-[10px] text-[#6b6b6b] w-4 shrink-0">
        {rank === 1 ? "▲" : rank === 2 ? "▲" : "·"}
      </span>

      {/* Avatar */}
      <div className="size-6 rounded-sm bg-[#2a2d2e] border border-[#3e3e42] flex items-center justify-center shrink-0">
        <User size={11} className="text-[#4ec9b0]" />
      </div>

      {/* Name + bar */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-[#d4d4d4] truncate">{contributor.name}</span>
          <span className="font-mono text-[10px] text-[#6b6b6b] ml-2 shrink-0">
            {contributor.commits} commits
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-[2px] w-full bg-[#3e3e42] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4ec9b0] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Functions count */}
      <span className="font-mono text-[10px] text-[#6b6b6b] shrink-0">
        {contributor.functions} fn
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RepoDashboard({
  repoName,
  branch,
  lastAnalyzed,
  totalFunctions,
  contributors,
  recentFunctions,
  onInspect,
}: RepoDashboardProps) {
  const maxCommits = Math.max(...contributors.map((c) => c.commits), 1);

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <AnimatedBadge variant="live" text="connected" />
          </div>
          <h1 className="font-mono text-xl text-white mt-2">{repoName}</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <GitBranch size={11} className="text-[#6b6b6b]" />
              <span className="font-mono text-[10px] text-[#6b6b6b]">{branch}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} className="text-[#6b6b6b]" />
              <span className="font-mono text-[10px] text-[#6b6b6b]">
                analyzed {new Date(lastAnalyzed).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <VortexButton variant="primary" size="sm" icon={<Activity size={12} />}>
          Re-analyze
        </VortexButton>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 flex-wrap">
        <StatTile
          label="Functions"
          value={totalFunctions}
          icon={<Code2 size={12} />}
        />
        <StatTile
          label="Contributors"
          value={contributors.length}
          icon={<User size={12} />}
        />
        <StatTile
          label="Top Owner"
          value={contributors[0]?.name ?? "—"}
          icon={<GitBranch size={12} />}
        />
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
              />
            ))}
          </div>
        </div>

        {/* Recent functions */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
              Recently Analyzed
            </span>
            <VortexButton variant="ghost" size="sm" icon={<ChevronRight size={11} />} iconPosition="right">
              view all
            </VortexButton>
          </div>
          <div className="flex flex-col gap-3">
            {recentFunctions.slice(0, 3).map((fn) => (
              <div key={fn.functionName} className="flex flex-col gap-1">
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