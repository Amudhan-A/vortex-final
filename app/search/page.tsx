"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSavedRepo } from "@/lib/config";
import { searchFunctions, SearchResult } from "@/services/api";
import { Search, Zap, ArrowRight } from "lucide-react";

const SUGGESTIONS = [
  "analyze",
  "compute",
  "build",
  "fetch",
  "mine",
];

export default function SearchPage() {
  const router = useRouter();
  const REPO = getSavedRepo() ?? "";

  console.log("REPO:", REPO);


  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setLastQuery(q.trim());
    try {
      const data = await searchFunctions(REPO, q.trim());
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
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
            placeholder="Search functions, files, or owners..."
            className="flex-1 bg-transparent outline-none font-mono text-sm text-[#d4d4d4] placeholder:text-[#6b6b6b]"
            autoFocus
          />
          {query && (
            <button
              onClick={() => handleSearch(query)}
              className="font-mono text-[10px] text-[#4ec9b0] hover:text-white transition-colors"
            >
              search
            </button>
          )}
        </div>

        {/* Suggestions */}
        {!results && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
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
      <div className="flex-1 overflow-y-auto px-6 py-4">

        {loading && (
          <div className="flex flex-col gap-2">
            {[1,2,3].map(n => (
              <div key={n} className="h-16 bg-[#252526] border border-[#3e3e42] rounded-sm animate-pulse" />
            ))}
          </div>
        )}

        {!loading && results === null && (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-20">
            <Zap size={24} className="text-[#3e3e42]" />
            <p className="font-mono text-sm text-[#6b6b6b]">Search your codebase</p>
          </div>
        )}

        {!loading && results !== null && results.length === 0 && (
          <p className="font-mono text-sm text-[#6b6b6b]">
            No results for <span className="text-[#d4d4d4]">"{lastQuery}"</span>
          </p>
        )}

        {!loading && results !== null && results.length > 0 && (
          <div className="flex flex-col gap-2 max-w-2xl">
            <p className="font-mono text-[10px] text-[#6b6b6b] mb-2">
              {results.length} results for <span className="text-[#4ec9b0]">"{lastQuery}"</span>
            </p>
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => router.push(`/inspect?fn=${encodeURIComponent(r.function_name)}&filepath=${encodeURIComponent(r.filepath)}`)}
                className="flex items-center gap-4 bg-[#252526] border border-[#3e3e42] rounded-sm px-4 py-3 hover:border-[#4ec9b0]/40 transition-colors text-left group w-full"
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-mono text-sm text-white">{r.function_name}</span>
                  <span className="font-mono text-[10px] text-[#6b6b6b] truncate">{r.filepath}</span>
                </div>
                <span className="font-mono text-[10px] text-[#4ec9b0] shrink-0">
                  {r.ownership?.primary_owner ?? "unknown"}
                </span>
                <ArrowRight size={12} className="text-[#3e3e42] group-hover:text-[#4ec9b0] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}