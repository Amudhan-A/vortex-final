// app/inspect/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useExplain } from "@/hooks/useExplain";
import { FunctionPanel } from "@/components/inspector/FunctionPanel";
import { BlastRadiusList } from "@/components/inspector/BlastRadiusList";
import { OwnerCard } from "@/components/inspector/OwnerCard";

const REPO_PATH  = "D:\\vortex\\project\\backend";
const REPO_OWNER = "Amudhan-A";
const REPO_NAME  = "git-blame-app-backend";

export default function InspectPage() {
  const router       = useRouter();
  const params       = useSearchParams();

  // pre-fill from URL if coming from dashboard/search
  const [filepath,     setFilepath]     = useState(params.get("filepath") ?? "");
  const [functionName, setFunctionName] = useState(params.get("fn") ?? "");
  const [submitted,    setSubmitted]    = useState(
    !!(params.get("fn") && params.get("filepath"))
  );

  const { explain, loading, error, result } = useExplain();

  const handleSubmit = () => {
    if (!filepath || !functionName) return;
    setSubmitted(true);
    explain({
      repo_path:     REPO_PATH,
      filepath,
      function_name: functionName,
      owner:         REPO_OWNER,
      repo_name:     REPO_NAME,
    });
  };

  // ── Input form (shown when no function selected yet) ─────────────────────

  if (!submitted) {
    return (
      <div className="p-8 flex flex-col gap-6 max-w-xl">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs text-white">Inspect a Function</span>
          <span className="font-mono text-[10px] text-[#6b6b6b]">
            Enter a filepath and function name to analyze
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Filepath input */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
              Filepath
            </label>
            <input
              type="text"
              value={filepath}
              onChange={e => setFilepath(e.target.value)}
              placeholder="e.g. api/routes.py"
              className="bg-[#1e1e1e] border border-[#3e3e42] rounded-sm px-3 py-2 font-mono text-xs text-[#d4d4d4] placeholder:text-[#6b6b6b] outline-none focus:border-[#4ec9b0]/50"
            />
          </div>

          {/* Function name input */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
              Function Name
            </label>
            <input
              type="text"
              value={functionName}
              onChange={e => setFunctionName(e.target.value)}
              placeholder="e.g. analyze_function"
              className="bg-[#1e1e1e] border border-[#3e3e42] rounded-sm px-3 py-2 font-mono text-xs text-[#d4d4d4] placeholder:text-[#6b6b6b] outline-none focus:border-[#4ec9b0]/50"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!filepath || !functionName}
            className="bg-[#4ec9b0]/10 border border-[#4ec9b0]/40 text-[#4ec9b0] font-mono text-xs px-4 py-2 rounded-sm hover:bg-[#4ec9b0]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Analyze →
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex gap-6 p-6 h-full">
        <div className="flex-1 flex flex-col gap-4">
          {[1,2,3].map(n => (
            <div key={n} className="h-32 bg-[#252526] border border-[#3e3e42] rounded-sm animate-pulse" />
          ))}
        </div>
        <div className="w-80 flex flex-col gap-4">
          <div className="h-48 bg-[#252526] border border-[#3e3e42] rounded-sm animate-pulse" />
          <div className="h-48 bg-[#252526] border border-[#3e3e42] rounded-sm animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-8 flex flex-col gap-3">
        <p className="font-mono text-xs text-[#f48771]">Error: {error}</p>
        <button
          onClick={() => setSubmitted(false)}
          className="font-mono text-xs text-[#4ec9b0] hover:underline w-fit"
        >
          ← Try another function
        </button>
      </div>
    );
  }

  if (!result) return null;

  const { analysis, ownership, decision_log } = result;

  const blastEntries = (analysis?.blast_radius ?? []).map((fn, i) => ({
    functionName: fn,
    filepath,
    severity: (i < 3 ? "direct" : "indirect") as "direct" | "indirect",
  }));

  const linkedIssues = (decision_log?.linked_issues ?? []).map(id => ({
    id,
    title: id,
    type: (id.toLowerCase().includes("pr") ? "pr" : "issue") as "pr" | "issue",
  }));

  // ── Result ────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-6 p-6 h-full">

      {/* Back button */}
      <div className="absolute top-4 right-6">
        <button
          onClick={() => setSubmitted(false)}
          className="font-mono text-[10px] text-[#6b6b6b] hover:text-[#d4d4d4] transition-colors"
        >
          ← inspect another
        </button>
      </div>

      {/* Left — main panel */}
      <div className="flex-1 min-w-0">
        <FunctionPanel
          functionName={result.function_name}
          filepath={result.filepath}
          primaryOwner={ownership?.primary_owner ?? "unknown"}
          confidence={ownership?.confidence ?? 0}
          generatedAt={decision_log?.generated_at ?? new Date().toISOString()}
          whyItExists={decision_log?.why_it_exists ?? "No analysis yet."}
          keyDecisions={decision_log?.key_decisions ?? []}
          linkedIssues={linkedIssues}
          callers={analysis?.callers ?? []}
          callees={analysis?.callees ?? []}
          onViewGraph={() => router.push(`/graph?fn=${functionName}`)}
          onExport={() => router.push(`/documents?fn=${functionName}&filepath=${encodeURIComponent(filepath)}`)}
        />
      </div>

      {/* Right column */}
      <div className="w-80 shrink-0 flex flex-col gap-4">
        <OwnerCard
          primaryOwner={ownership?.primary_owner ?? "unknown"}
          confidence={ownership?.confidence ?? 0}
          totalCommits={0}
          otherFunctions={[]}
        />
        <BlastRadiusList
          functionName={result.function_name}
          entries={blastEntries}
        />
      </div>

    </div>
  );
}