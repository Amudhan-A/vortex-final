// hooks/useAsk.ts

import { useState } from "react";
import { askCodebase, AskResponse } from "@/services/api";

export function useAsk() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<AskResponse | null>(null);

  const ask = async (repo: string, question: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await askCodebase(repo, question);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { ask, loading, error, result };
}