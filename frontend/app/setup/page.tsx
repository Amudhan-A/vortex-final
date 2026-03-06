"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveRepo } from "@/lib/config";

export default function SetupPage() {
  const router = useRouter();
  const [repoPath, setRepoPath] = useState("");

  const handleSubmit = () => {
    if (!repoPath.trim()) return;
    saveRepo(repoPath.trim());
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#1e1e1e]">
      <div className="flex flex-col gap-6 w-full max-w-md p-8 bg-[#252526] border border-[#3e3e42] rounded-sm">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-base text-white">Welcome to Vortex</span>
          <span className="font-mono text-[11px] text-[#6b6b6b]">
            Enter the absolute path to your local git repository
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
            Repository Path
          </label>
          <input
            type="text"
            value={repoPath}
            onChange={e => setRepoPath(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. D:\projects\my-repo or /home/user/my-repo"
            className="bg-[#1e1e1e] border border-[#3e3e42] rounded-sm px-3 py-2 font-mono text-xs text-[#d4d4d4] placeholder:text-[#6b6b6b] outline-none focus:border-[#4ec9b0]/50"
            autoFocus
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!repoPath.trim()}
          className="bg-[#4ec9b0]/10 border border-[#4ec9b0]/40 text-[#4ec9b0] font-mono text-xs px-4 py-2 rounded-sm hover:bg-[#4ec9b0]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}