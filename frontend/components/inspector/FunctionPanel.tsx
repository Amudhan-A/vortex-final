"use client";

import React, { useState } from "react";
import {
  Code2, GitPullRequest, ArrowUpRight,
  ArrowDownLeft, ExternalLink, User, Clock
} from "lucide-react";
import { AnimatedBadge } from "@/components/ui/badge";
import { VortexButton } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LinkedIssue {
  id: string;       // e.g. "#42" or "PR #112"
  title: string;
  type: "issue" | "pr";
  url?: string;
}

export interface FunctionPanelProps {
  functionName: string;
  filepath: string;
  primaryOwner: string;
  confidence: number;
  generatedAt: string;
  // Tab: Why it exists
  whyItExists: string;
  keyDecisions: string[];
  // Tab: Linked issues
  linkedIssues: LinkedIssue[];
  // Tab: Callers & callees
  callers: string[];
  callees: string[];
  // Actions
  onExport?: () => void;
  onViewGraph?: () => void;
}

type Tab = "why" | "issues" | "calls";

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative font-mono text-[11px] uppercase tracking-widest px-3 py-2 transition-colors duration-200 ${
        active ? "text-[#4ec9b0]" : "text-[#6b6b6b] hover:text-[#d4d4d4]"
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`ml-1.5 font-mono text-[9px] px-1 py-[1px] rounded-sm border ${
            active
              ? "border-[#4ec9b0]/40 text-[#4ec9b0] bg-[#4ec9b0]/10"
              : "border-[#3e3e42] text-[#6b6b6b]"
          }`}
        >
          {count}
        </span>
      )}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#4ec9b0]" />
      )}
    </button>
  );
}

// ─── Why it exists tab ────────────────────────────────────────────────────────

function WhyTab({
  whyItExists,
  keyDecisions,
}: {
  whyItExists: string;
  keyDecisions: string[];
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
          Purpose
        </span>
        <p className="font-mono text-sm text-[#d4d4d4] leading-relaxed bg-[#1e1e1e] border border-[#3e3e42] rounded-sm p-4">
          {whyItExists}
        </p>
      </div>

      {/* Key decisions */}
      {keyDecisions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
            Key Decisions
          </span>
          <div className="flex flex-col gap-2">
            {keyDecisions.map((decision, i) => (
              <div
                key={i}
                className="flex gap-3 bg-[#1e1e1e] border border-[#3e3e42] rounded-sm p-3"
              >
                <span className="font-mono text-[10px] text-[#4ec9b0] shrink-0 mt-[1px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-mono text-xs text-[#d4d4d4] leading-relaxed">
                  {decision}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Linked issues tab ────────────────────────────────────────────────────────

function IssuesTab({ linkedIssues }: { linkedIssues: LinkedIssue[] }) {
  if (linkedIssues.length === 0) {
    return (
      <p className="font-mono text-xs text-[#6b6b6b] py-4">
        No linked issues or PRs found.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {linkedIssues.map((issue) => (
        <div
          key={issue.id}
          className="flex items-start gap-3 bg-[#1e1e1e] border border-[#3e3e42] rounded-sm p-3 hover:border-[#4ec9b0]/30 transition-colors group"
        >
          {/* Icon */}
          <div className="shrink-0 mt-[1px]">
            {issue.type === "pr" ? (
              <GitPullRequest size={13} className="text-[#4ec9b0]" />
            ) : (
              <div className="size-[13px] rounded-full border border-[#4ec9b0] flex items-center justify-center">
                <div className="size-[5px] rounded-full bg-[#4ec9b0]" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#4ec9b0]">
                {issue.id}
              </span>
              <span className="font-mono text-[10px] text-[#3e3e42]">·</span>
              <span className="font-mono text-xs text-[#d4d4d4] truncate">
                {issue.title}
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#6b6b6b] mt-1">
              {issue.type === "pr" ? "pull request" : "issue"}
            </span>
          </div>

          {/* Link */}
          {issue.url && (
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-[#6b6b6b] hover:text-[#4ec9b0] transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Callers & callees tab ────────────────────────────────────────────────────

function CallsTab({
  callers,
  callees,
  functionName,
}: {
  callers: string[];
  callees: string[];
  functionName: string;
}) {
  return (
    <div className="flex flex-col gap-5">

      {/* Callers */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ArrowDownLeft size={12} className="text-[#4ec9b0]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
            Called By
          </span>
          <span className="font-mono text-[9px] text-[#3e3e42]">
            {callers.length} callers
          </span>
        </div>
        {callers.length === 0 ? (
          <p className="font-mono text-xs text-[#6b6b6b]">No callers found.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {callers.map((caller) => (
              <div
                key={caller}
                className="flex items-center gap-2 font-mono text-xs text-[#d4d4d4] bg-[#1e1e1e] border border-[#3e3e42] rounded-sm px-3 py-2 hover:border-[#4ec9b0]/30 transition-colors"
              >
                <Code2 size={11} className="text-[#6b6b6b] shrink-0" />
                {caller}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Center — the function itself */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#3e3e42]" />
        <div className="flex items-center gap-2 bg-[#4ec9b0]/10 border border-[#4ec9b0]/40 rounded-sm px-3 py-1">
          <Code2 size={12} className="text-[#4ec9b0]" />
          <span className="font-mono text-xs text-[#4ec9b0]">{functionName}</span>
        </div>
        <div className="flex-1 h-px bg-[#3e3e42]" />
      </div>

      {/* Callees */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ArrowUpRight size={12} className="text-[#dcdcaa]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
            Calls
          </span>
          <span className="font-mono text-[9px] text-[#3e3e42]">
            {callees.length} callees
          </span>
        </div>
        {callees.length === 0 ? (
          <p className="font-mono text-xs text-[#6b6b6b]">No callees found.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {callees.map((callee) => (
              <div
                key={callee}
                className="flex items-center gap-2 font-mono text-xs text-[#d4d4d4] bg-[#1e1e1e] border border-[#3e3e42] rounded-sm px-3 py-2 hover:border-[#dcdcaa]/30 transition-colors"
              >
                <Code2 size={11} className="text-[#6b6b6b] shrink-0" />
                {callee}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FunctionPanel({
  functionName,
  filepath,
  primaryOwner,
  confidence,
  generatedAt,
  whyItExists,
  keyDecisions,
  linkedIssues,
  callers,
  callees,
  onExport,
  onViewGraph,
}: FunctionPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("why");

  return (
    <div className="flex flex-col gap-0 bg-[#252526] border border-[#3e3e42] rounded-sm overflow-hidden h-full">

      {/* Header */}
      <div className="flex flex-col gap-3 p-4 border-b border-[#3e3e42]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-[#4ec9b0] shrink-0" />
              <span className="font-mono text-base text-white truncate">
                {functionName}
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#6b6b6b] truncate pl-5">
              {filepath}
            </span>
          </div>
          <AnimatedBadge variant="owner" text={primaryOwner} />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 pl-1">
          <div className="flex items-center gap-1">
            <User size={11} className="text-[#6b6b6b]" />
            <span className="font-mono text-[10px] text-[#6b6b6b]">
              {Math.round(confidence * 100)}% confidence
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={11} className="text-[#6b6b6b]" />
            <span className="font-mono text-[10px] text-[#6b6b6b]">
              {new Date(generatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pl-1">
          <VortexButton
            variant="secondary"
            size="sm"
            onClick={onViewGraph}
          >
            View Graph
          </VortexButton>
          <VortexButton
            variant="ghost"
            size="sm"
            onClick={onExport}
          >
            Export
          </VortexButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3e3e42] px-2">
        <TabButton
          label="Why it exists"
          active={activeTab === "why"}
          onClick={() => setActiveTab("why")}
        />
        <TabButton
          label="Issues & PRs"
          active={activeTab === "issues"}
          onClick={() => setActiveTab("issues")}
          count={linkedIssues.length}
        />
        <TabButton
          label="Callers & Callees"
          active={activeTab === "calls"}
          onClick={() => setActiveTab("calls")}
          count={callers.length + callees.length}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "why" && (
          <WhyTab
            whyItExists={whyItExists}
            keyDecisions={keyDecisions}
          />
        )}
        {activeTab === "issues" && (
          <IssuesTab linkedIssues={linkedIssues} />
        )}
        {activeTab === "calls" && (
          <CallsTab
            callers={callers}
            callees={callees}
            functionName={functionName}
          />
        )}
      </div>

    </div>
  );
}

export default FunctionPanel;