"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileText, FileJson, Check } from "lucide-react";
import { VortexButton } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DownloadFormat = "md" | "pdf" | "json";

export interface DownloadButtonProps {
  filename: string;
  markdownContent: string;
  jsonContent?: object;
  onDownload?: (format: DownloadFormat) => void;
}

// ─── Format config ────────────────────────────────────────────────────────────

const formatConfig: Record<DownloadFormat, {
  label: string;
  ext: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}> = {
  md: {
    label: "Markdown",
    ext: ".md",
    icon: <FileText size={12} />,
    color: "#4ec9b0",
    description: "Human readable",
  },
  pdf: {
    label: "PDF",
    ext: ".pdf",
    icon: <FileText size={12} />,
    color: "#f48771",
    description: "Print ready",
  },
  json: {
    label: "JSON",
    ext: ".json",
    icon: <FileJson size={12} />,
    color: "#dcdcaa",
    description: "Machine readable",
  },
};

// ─── Main component ───────────────────────────────────────────────────────────

export function DownloadButton({
  filename,
  markdownContent,
  jsonContent,
  onDownload,
}: DownloadButtonProps) {
  const [open, setOpen]           = useState(false);
  const [downloaded, setDownloaded] = useState<DownloadFormat | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>("md");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const triggerDownload = (format: DownloadFormat) => {
    const config = formatConfig[format];

    if (format === "md") {
      const blob = new Blob([markdownContent], { type: "text/markdown" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${filename}${config.ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }

    if (format === "json") {
      const content = jsonContent ?? { content: markdownContent };
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${filename}${config.ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }

    if (format === "pdf") {
      // PDF requires server-side generation — fire the callback
      onDownload?.(format);
    }

    setDownloaded(format);
    setSelectedFormat(format);
    setOpen(false);
    setTimeout(() => setDownloaded(null), 2000);
  };

  const current = formatConfig[selectedFormat];
  const isDownloaded = downloaded === selectedFormat;

  return (
    <div ref={dropdownRef} className="relative inline-flex">

      {/* Main button */}
      <div className="flex items-stretch">
        <VortexButton
          variant="primary"
          size="sm"
          icon={isDownloaded ? <Check size={12} /> : <Download size={12} />}
          onClick={() => triggerDownload(selectedFormat)}
          className="rounded-r-none border-r-0"
        >
          {isDownloaded ? "Downloaded!" : `Download ${current.ext}`}
        </VortexButton>

        {/* Chevron trigger */}
        <button
          onClick={() => setOpen((s) => !s)}
          className={`
            flex items-center justify-center px-2
            border border-[#4ec9b0]/40 border-l-0 rounded-r-sm
            bg-[#4ec9b0]/10 text-[#4ec9b0]
            hover:bg-[#4ec9b0]/20 transition-colors duration-200
            font-mono text-xs
          `}
        >
          <ChevronDown
            size={11}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-[#252526] border border-[#3e3e42] rounded-sm overflow-hidden z-50 shadow-xl">
          <div className="px-3 py-2 border-b border-[#3e3e42]">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b]">
              Choose format
            </span>
          </div>

          {(Object.entries(formatConfig) as [DownloadFormat, typeof formatConfig[DownloadFormat]][]).map(
            ([format, config]) => (
              <button
                key={format}
                onClick={() => triggerDownload(format)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2
                  hover:bg-[#2a2d2e] transition-colors duration-150
                  border-b border-[#3e3e42] last:border-0
                  ${selectedFormat === format ? "bg-[#2a2d2e]" : ""}
                `}
              >
                {/* Format icon */}
                <span style={{ color: config.color }}>{config.icon}</span>

                {/* Labels */}
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="font-mono text-xs text-[#d4d4d4]">
                    {config.label}
                    <span className="text-[#6b6b6b] ml-1">{config.ext}</span>
                  </span>
                  <span className="font-mono text-[10px] text-[#6b6b6b]">
                    {config.description}
                  </span>
                </div>

                {/* Selected indicator */}
                {selectedFormat === format && (
                  <Check size={11} className="text-[#4ec9b0] shrink-0" />
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default DownloadButton;