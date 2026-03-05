import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import VortexSidebar from "@/components/ui/sidebar";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vortex",
  description: "Git blame for humans",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased bg-[#1e1e1e]`}>
        <div className="flex h-screen overflow-hidden">
          <VortexSidebar />
          <main className="flex-1 bg-[#1e1e1e] overflow-auto text-[#d4d4d4]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}