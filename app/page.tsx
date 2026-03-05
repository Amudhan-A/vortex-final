"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RepoDashboard } from "@/components/dashboard/RepoDashboard";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { listFunctions, getContributors } from "@/services/api";
import type { Contributor, FunctionData } from "@/services/api";

const REPO      = "D:\\vortex\\project\\backend";

export default function DashboardPage() {
  const router = useRouter();

  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [functions,    setFunctions]    = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      getContributors(REPO),
      listFunctions(REPO),
    ]).then(([contribs, fns]) => {
      setContributors(contribs);
      setFunctions(fns.map(f => ({
        functionName: f.function_name,
        filepath:     f.filepath,
        primaryOwner: f.ownership?.primary_owner ?? "unknown",
        whyItExists:  f.decision_log?.why_it_exists ?? "Click inspect to generate analysis.",
        blastRadius:  f.analysis?.blast_radius ?? [],
        generatedAt:  f.decision_log?.generated_at ?? new Date().toISOString(),
      })));
    }).finally(() => setLoading(false));
  }, []);

  // ownership breakdown for StatsPanel pie chart
  const ownershipStats = contributors.map(c => ({
    name:      c.name,
    functions: c.functions,
  }));

  if (loading) {
    return (
      <div className="flex gap-6 p-6 h-full">
        {[1, 2, 3].map(n => (
          <div key={n} className="h-48 flex-1 bg-[#252526] border border-[#3e3e42] rounded-sm animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-6 p-6 h-full">
      <div className="flex-1 overflow-y-auto">
        <RepoDashboard
          repoName={REPO}
          branch="main"
          lastAnalyzed={new Date().toISOString()}
          totalFunctions={functions.length}
          contributors={contributors}
          recentFunctions={functions.slice(0, 10)}
          onInspect={(fn) => {
            const match = functions.find(f => f.functionName === fn);
            const filepath = match?.filepath ?? "";
            router.push(`/inspect?fn=${fn}&filepath=${encodeURIComponent(filepath)}`);
          }}
        />
      </div>
      <div className="w-72 shrink-0">
        <StatsPanel
          commitFrequency={[]} // you don't have this endpoint yet — leave empty or add it later
          ownership={ownershipStats}
        />
      </div>
    </div>
  );
}