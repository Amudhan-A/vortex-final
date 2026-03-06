"use client";

import React, { useState, useRef } from "react";
import { Search, Zap, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchResultCard } from "@/components/ui/card";
import { VortexButton } from "@/components/ui/button";
import { AnimatedBadge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AskResult {
  functionName: string;
  filepath: string;
  repo: string;
  snippet: string;
  owner: string;
}

export interface AskPanelProps {
  onSearch: (query: string) => Promise<AskResult[]>;
}

// ─── Suggested queries ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "Who owns the authentication logic?",
  "What breaks if validate_user changes?",
  "Why does compute_ownership exist?",
  "Which functions does alice own?",
  "What calls jwt.decode?",
  "Show me high blast radius functions",
];

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <Loader2 size={13} className="text-[#4ec9b0] animate-spin" />
      <span className="font-mono text-xs text-[#6b6b6b]">
        analyzing codebase
        <span className="animate-pulse">...</span>
      </span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onSuggest }: { onSuggest: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 px-4">
      <div className="flex flex-col items-center gap-2">
        <div className="size-12 rounded-sm bg-[#4ec9b0]/10 border border-[#4ec9b0]/30 flex items-center justify-center">
          <Zap size={20} className="text-[#4ec9b0]" />
        </div>
        <p className="font-mono text-sm text-[#d4d4d4] text-center">
          Ask anything about your codebase
        </p>
        <p className="font-mono text-xs text-[#6b6b6b] text-center max-w-sm">
          Query functions, owners, blast radius, and decision history in plain English.
        </p>
      </div>

      {/* Suggestions */}
      <div className="flex flex-col gap-2 w-full max-w-lg">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b] text-center">
          Try asking
        </span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSuggest(s)}
              className="flex items-center gap-2 px-3 py-2 bg-[#252526] border border-[#3e3e42] rounded-sm hover:border-[#4ec9b0]/40 hover:bg-[#2a2d2e] transition-colors group text-left"
            >
              <ArrowRight
                size={11}
                className="text-[#3e3e42] group-hover:text-[#4ec9b0] transition-colors shrink-0"
              />
              <span className="font-mono text-[11px] text-[#6b6b6b] group-hover:text-[#d4d4d4] transition-colors">
                {s}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── No results state ─────────────────────────────────────────────────────────

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <p className="font-mono text-sm text-[#6b6b6b]">
        No results for{" "}
        <span className="text-[#d4d4d4]">"{query}"</span>
      </p>
      <p className="font-mono text-xs text-[#6b6b6b]">
        Try rephrasing or using a function name directly.
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AskPanel({ onSearch }: AskPanelProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery]     = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AskResult[] | null>(null);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setLoading(true);
    setResults(null);
    setLastQuery(trimmed);
    setQuery(trimmed);

    try {
      const data = await onSearch(trimmed);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = (s: string) => {
    setQuery(s);
    inputRef.current?.focus();
    handleSearch(s);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch(query);
  };

  const hasResults  = results !== null && results.length > 0;
  const hasNoResults = results !== null && results.length === 0;
  const showEmpty   = !loading && results === null;

  return (
    <div className="flex flex-col h-full">

      {/* Search input */}
      <div className="px-6 py-5 border-b border-[#3e3e42] shrink-0">
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <AnimatedBadge variant="live" text="connected" />
          </div>

          <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#3e3e42] rounded-sm px-3 py-2 focus-within:border-[#4ec9b0]/50 transition-colors">
            <Search size={14} className="text-[#6b6b6b] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your codebase..."
              className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-[#d4d4d4] placeholder:text-[#6b6b6b]"
              autoFocus
            />
            {query && (
              <VortexButton
                variant="primary"
                size="sm"
                onClick={() => handleSearch(query)}
                icon={<Zap size={11} />}
              >
                Ask
              </VortexButton>
            )}
          </div>

          {/* Last query label */}
          {lastQuery && !loading && (
            <p className="font-mono text-[10px] text-[#6b6b6b]">
              Results for{" "}
              <span className="text-[#4ec9b0]">"{lastQuery}"</span>
              {hasResults && (
                <span className="ml-2 text-[#3e3e42]">
                  — {results!.length} found
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-4 max-w-2xl">
            <TypingIndicator />
            {/* Skeleton cards */}
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-28 bg-[#252526] border border-[#3e3e42] rounded-sm animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {showEmpty && <EmptyState onSuggest={handleSuggest} />}

        {/* No results */}
        {hasNoResults && <NoResults query={lastQuery} />}

        {/* Results grid */}
        {hasResults && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
            {results!.map((result) => (
              <SearchResultCard
                key={`${result.repo}-${result.functionName}`}
                functionName={result.functionName}
                filepath={result.filepath}
                repo={result.repo}
                snippet={result.snippet}
                owner={result.owner}
                onClick={() =>
                  router.push(`/inspect?fn=${result.functionName}&repo=${result.repo}`)
                }
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default AskPanel;