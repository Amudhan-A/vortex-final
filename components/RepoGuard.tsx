"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSavedRepo } from "@/lib/config";

export function RepoGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === "/setup") {
      setReady(true);
      return;
    }

    const repo = getSavedRepo();
    if (!repo) {
      setReady(false);        // ← reset ready so children don't flash
      router.replace("/setup");
    } else {
      setReady(true);
    }
  }, [pathname]);             // ← pathname change re-checks localStorage fresh

  // Listen for localStorage changes from other tabs or same-tab saves
  useEffect(() => {
    const handleStorage = () => {
      const repo = getSavedRepo();
      if (repo && pathname !== "/setup") {
        setReady(true);
      } else if (!repo && pathname !== "/setup") {
        setReady(false);
        router.replace("/setup");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [pathname]);

  if (!ready) return null;
  return <>{children}</>;
}