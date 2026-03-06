"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommitFrequencyPoint {
  date: string;
  commits: number;
}

export interface OwnershipSlice {
  name: string;
  functions: number;
}

export interface StatsPanelProps {
  commitFrequency: CommitFrequencyPoint[];
  ownership: OwnershipSlice[];
}

// ─── Color palette for ownership pie ─────────────────────────────────────────

const PIE_COLORS = [
  "#4ec9b0",
  "#dcdcaa",
  "#9cdcfe",
  "#ce9178",
  "#c586c0",
  "#6b6b6b",
];

// ─── Custom tooltip for bar chart ─────────────────────────────────────────────

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#252526] border border-[#3e3e42] rounded-sm px-3 py-2">
      <p className="font-mono text-[10px] text-[#6b6b6b] mb-1">{label}</p>
      <p className="font-mono text-xs text-[#4ec9b0]">
        {payload[0].value} commits
      </p>
    </div>
  );
}

// ─── Custom tooltip for pie chart ────────────────────────────────────────────

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#252526] border border-[#3e3e42] rounded-sm px-3 py-2">
      <p className="font-mono text-xs text-[#d4d4d4]">{payload[0].name}</p>
      <p className="font-mono text-[10px] text-[#4ec9b0]">
        {payload[0].value} functions
      </p>
    </div>
  );
}

// ─── Active pie shape ─────────────────────────────────────────────────────────

function ActiveShape(props: any) {
  const {
    cx, cy, innerRadius, outerRadius,
    startAngle, endAngle, fill,
  } = props;

  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
        {title}
      </span>
      <div className="bg-[#252526] border border-[#3e3e42] rounded-sm p-4">
        {children}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StatsPanel({ commitFrequency, ownership }: StatsPanelProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const totalFunctions = ownership.reduce((sum, o) => sum + o.functions, 0);

  return (
    <div className="flex flex-col gap-6">

      {/* Only show commit frequency if there's data */}
      {commitFrequency.length > 0 && (
        <PanelSection title="Commit Frequency">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={commitFrequency}
              margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              barCategoryGap="30%"
            >
              <XAxis dataKey="date" tick={{ fontFamily: "monospace", fontSize: 9, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "monospace", fontSize: 9, fill: "#6b6b6b" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "#2a2d2e" }} />
              <Bar dataKey="commits" fill="#4ec9b0" radius={[2, 2, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </PanelSection>
      )}


      {/* Ownership breakdown */}
      <PanelSection title="Ownership Breakdown">
        <div className="flex items-center gap-4">

          {/* Pie */}
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
                activeShape={<ActiveShape />}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                strokeWidth={0}
              >
                {ownership.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                    opacity={
                      activeIndex === undefined || activeIndex === i ? 1 : 0.4
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {ownership.map((slice, i) => {
              const pct = Math.round((slice.functions / totalFunctions) * 100);
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
                    style={{
                      color: activeIndex === i ? "#d4d4d4" : "#6b6b6b",
                    }}
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
      </PanelSection>

    </div>
  );
}

export default StatsPanel;