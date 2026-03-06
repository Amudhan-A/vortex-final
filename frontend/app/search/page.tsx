// app/search/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSavedRepo } from "@/lib/config";
import { useAsk } from "@/hooks/useAsk";
import { Search, Zap, ArrowRight, Loader2, Code2, User } from "lucide-react";

const SUGGESTIONS = [
  "Who owns the authentication logic?",
  "What breaks if analyze changes?",
  "Why does compute_ownership exist?",
  "What does build_ast_graph call?",
  "Which functions have the highest blast radius?",
];

export default function SearchPage() {
  const router = useRouter();
  const REPO = getSavedRepo() ?? "";
  const { ask, loading, error, result } = useAsk();

  const [query, setQuery]       = useState("");
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLastQuery(q.trim());
    await ask(REPO, q.trim());
  };

  return (
    <div className="flex flex-col h-full">

      {/* Search bar */}
      <div className="px-6 py-5 border-b border-[#3e3e42]">
        <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#3e3e42] rounded-sm px-3 py-2 focus-within:border-[#4ec9b0]/50 max-w-2xl">
          <Search size={14} className="text-[#6b6b6b] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch(query)}
            placeholder="Ask anything about your codebase..."
            className="flex-1 bg-transparent outline-none font-mono text-sm text-[#d4d4d4] placeholder:text-[#6b6b6b]"
            autoFocus
          />
          {query && (
            <button
              onClick={() => handleSearch(query)}
              className="font-mono text-[10px] text-[#4ec9b0] hover:text-white transition-colors"
            >
              ask
            </button>
          )}
        </div>

        {/* Suggestions — only show before first search */}
        {!result && !loading && (
          <div className="flex items-center gap-2 mt-3 flex-wrap max-w-2xl">
            <span className="font-mono text-[10px] text-[#6b6b6b]">try:</span>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); handleSearch(s); }}
                className="font-mono text-[10px] text-[#4ec9b0] bg-[#4ec9b0]/10 border border-[#4ec9b0]/20 px-2 py-[2px] rounded-sm hover:bg-[#4ec9b0]/20 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 py-4 max-w-3xl">

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 size={14} className="text-[#4ec9b0] animate-spin" />
            <span className="font-mono text-xs text-[#6b6b6b]">
              analyzing codebase...
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="font-mono text-xs text-[#f48771]">Error: {error}</p>
        )}

        {/* Answer */}
        {result && !loading && (
          <div className="flex flex-col gap-6">

            {/* Question echo */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#6b6b6b]">Q:</span>
              <span className="font-mono text-sm text-[#d4d4d4]">{lastQuery}</span>
            </div>

            {/* LLM Answer */}
            <div className="bg-[#252526] border border-[#4ec9b0]/20 rounded-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={12} className="text-[#4ec9b0]" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#4ec9b0]">
                  answer
                </span>
              </div>
              <p className="font-mono text-sm text-[#d4d4d4] leading-relaxed whitespace-pre-wrap">
                {result.answer}
              </p>
            </div>

            {/* Sources */}
            {result.sources.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
                  context pulled from
                </span>
                <div className="flex flex-col gap-2">
                  {result.sources.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => router.push(
                        `/inspect?fn=${encodeURIComponent(src.function_name)}&filepath=${encodeURIComponent(src.filepath)}`
                      )}
                      className="flex items-center gap-3 bg-[#252526] border border-[#3e3e42] rounded-sm px-4 py-3 hover:border-[#4ec9b0]/40 transition-colors text-left group w-full"
                    >
                      <Code2 size={12} className="text-[#6b6b6b] shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-mono text-sm text-white">
                          {src.function_name}
                        </span>
                        <span className="font-mono text-[10px] text-[#6b6b6b] truncate">
                          {src.filepath}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <User size={11} className="text-[#6b6b6b]" />
                        <span className="font-mono text-[10px] text-[#4ec9b0]">
                          {src.ownership?.primary_owner ?? "unknown"}
                        </span>
                      </div>
                      <ArrowRight size={12} className="text-[#3e3e42] group-hover:text-[#4ec9b0] transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ask another */}
            <button
              onClick={() => { setQuery(""); }}
              className="font-mono text-[10px] text-[#6b6b6b] hover:text-[#4ec9b0] transition-colors w-fit"
            >
              ← ask another question
            </button>

          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-20">
            <Zap size={24} className="text-[#3e3e42]" />
            <p className="font-mono text-sm text-[#6b6b6b]">
              Ask anything about your codebase
            </p>
          </div>
        )}

      </div>
    </div>
  );
}