import { useState } from "react";
import { explainFunction, FunctionData } from "@/services/api";

export function useExplain() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<FunctionData | null>(null);

  const explain = async (params: {
    repo_path: string;
    filepath: string;
    function_name: string;
    owner: string;
    repo_name: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await explainFunction(params);
      setResult({
        repo: params.repo_path,
        filepath: params.filepath,
        function_name: params.function_name,
        ...data,
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { explain, loading, error, result };
}