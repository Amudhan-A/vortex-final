"use client";

import { usePathname } from "next/navigation";
import VortexSidebar from "@/components/ui/sidebar";
import { RepoGuard } from "@/components/RepoGuard";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSetup = pathname === "/setup";

  return (
    <div className="flex h-screen overflow-hidden">
      {!isSetup && <VortexSidebar />}
      <main className="flex-1 bg-[#1e1e1e] overflow-auto text-[#d4d4d4]">
        <RepoGuard>
          {children}
        </RepoGuard>
      </main>
    </div>
  );
}