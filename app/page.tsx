"use client";

import { RepoDashboard } from "@/components/dashboard/RepoDashboard";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { useRouter } from "next/navigation";

const mockRepo = {
  repoName: "acme/backend",
  branch: "main",
  lastAnalyzed: "2026-03-05T00:00:00Z",
  totalFunctions: 142,
  contributors: [
    { name: "alice",   commits: 87, functions: 34 },
    { name: "bob",     commits: 54, functions: 21 },
    { name: "charlie", commits: 31, functions: 18 },
    { name: "diana",   commits: 19, functions: 9  },
    { name: "eve",     commits: 8,  functions: 4  },
  ],
  recentFunctions: [
    {
      functionName: "validate_user",
      filepath: "src/auth.py",
      primaryOwner: "alice",
      whyItExists: "Handles JWT validation introduced in PR #112.",
      blastRadius: ["auth.py:login", "middleware.py:authenticate"],
      generatedAt: "2026-03-05T00:00:00Z",
    },
    {
      functionName: "compute_ownership",
      filepath: "analyzer/ownership.py",
      primaryOwner: "bob",
      whyItExists: "Determines primary ownership based on commit frequency.",
      blastRadius: ["analyzer/analyze.py"],
      generatedAt: "2026-03-04T00:00:00Z",
    },
    {
      functionName: "build_ast_graph",
      filepath: "analyzer/ast_graph.py",
      primaryOwner: "charlie",
      whyItExists: "Parses Python source and builds a call graph.",
      blastRadius: ["analyzer/blast_radius.py"],
      generatedAt: "2026-03-03T00:00:00Z",
    },
  ],
};

const mockStats = {
  commitFrequency: [
    { date: "Feb 3",  commits: 4  },
    { date: "Feb 10", commits: 9  },
    { date: "Feb 17", commits: 6  },
    { date: "Feb 24", commits: 14 },
    { date: "Mar 3",  commits: 11 },
    { date: "Mar 5",  commits: 7  },
  ],
  ownership: [
    { name: "alice",   functions: 34 },
    { name: "bob",     functions: 21 },
    { name: "charlie", functions: 18 },
    { name: "diana",   functions: 9  },
    { name: "eve",     functions: 4  },
  ],
};

export default function TestPage() {
  const router = useRouter();
  return (
    <div className="flex gap-6 p-6 h-full">
      <div className="flex-1 overflow-y-auto">
        <RepoDashboard
          {...mockRepo}
          onInspect={(fn) => router.push(`/inspect?fn=${fn}`)}
        />
      </div>
      <div className="w-72 shrink-0">
        <StatsPanel {...mockStats} />
      </div>
    </div>
  );
}