"use client";

import { RepoDashboard } from "@/components/dashboard/RepoDashboard";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TestPage() {

  const router = useRouter();

  const [repoData, setRepoData] = useState<any>(null);

  useEffect(() => {
    async function loadRepo() {

      const res = await fetch(
        "http://localhost:8000/functions?repo_name=git-blame-app-backend"
      );

      const data = await res.json();

      setRepoData({
        repoName: "git-blame-app-backend",
        branch: "main",
        lastAnalyzed: new Date().toISOString(),
        totalFunctions: data.functions.length,
        contributors: [],
        recentFunctions: data.functions.map((f: any) => ({
          functionName: f.function_name,
          filepath: f.filepath,
          primaryOwner: "",
          whyItExists: "",
          blastRadius: [],
          generatedAt: ""
        }))
      });
    }

    loadRepo();
  }, []);

  if (!repoData) return <div>Loading...</div>;

  return (
    <div className="flex gap-6 p-6 h-full">
      <div className="flex-1 overflow-y-auto">
        <RepoDashboard
          {...repoData}
          onInspect={(fn) => router.push(`/inspect?fn=${fn}`)}
        />
      </div>

      <div className="w-72 shrink-0">
        <StatsPanel commitFrequency={[]} ownership={[]} />
      </div>
    </div>
  );
}