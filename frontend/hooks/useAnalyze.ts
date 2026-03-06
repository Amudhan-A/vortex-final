import { useState } from "react";
import { analyzeFunction, explainFunction, FunctionData } from "@/services/api";

export function useAnalyze() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<FunctionData | null>(null);

  const analyze = async (params: {
    repo_path: string;
    filepath: string;
    function_name: string;
    owner: string;
    repo_name: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeFunction(params);
      setResult({
        repo: params.repo_path,
        filepath: params.filepath,
        function_name: params.function_name,
        analysis: data.analysis,
        ownership: data.ownership,
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { analyze, loading, error, result };
}