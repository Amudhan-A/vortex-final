"use client";

import { AskPanel } from "@/components/search/AskPanel";
import type { AskResult } from "@/components/search/AskPanel";

// Mock search — replace with real API call later
const mockSearch = async (query: string): Promise<AskResult[]> => {
  await new Promise((r) => setTimeout(r, 1400)); // simulate latency

  if (query.toLowerCase().includes("no result")) return [];

  return [
    {
      functionName: "validate_user",
      filepath: "src/auth.py",
      repo: "acme/backend",
      snippet: "Handles JWT validation introduced in PR #112. Switched from sessions to JWT for load balanced environments.",
      owner: "alice",
    },
    {
      functionName: "authenticate",
      filepath: "middleware.py",
      repo: "acme/backend",
      snippet: "Middleware that calls validate_user on every protected route before passing to the handler.",
      owner: "alice",
    },
    {
      functionName: "refresh_token",
      filepath: "src/auth.py",
      repo: "acme/backend",
      snippet: "Reissues a JWT when the current token is close to expiry, calling validate_user internally.",
      owner: "bob",
    },
  ];
};

export default function TestPage() {
  return (
    <div className="h-screen">
      <AskPanel onSearch={mockSearch} />
    </div>
  );
}