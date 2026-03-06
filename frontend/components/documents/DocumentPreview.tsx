"use client";

import React, { useState } from "react";
import { FileText, User, Clock, Copy, Check, GitBranch } from "lucide-react";
import { AnimatedBadge } from "@/components/ui/badge";
import { VortexButton } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentPreviewProps {
  title: string;
  functionName: string;
  filepath: string;
  primaryOwner: string;
  generatedAt: string;
  markdownContent: string;
  onDownload?: () => void;
}

// ─── Minimal markdown renderer ────────────────────────────────────────────────
// Handles: h1-h3, bold, inline code, code blocks, bullet lists, paragraphs

function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre
          key={key++}
          className="bg-[#1e1e1e] border border-[#3e3e42] rounded-sm p-3 overflow-x-auto my-3"
        >
          <code className="font-mono text-xs text-[#9cdcfe] leading-relaxed">
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      i++;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="font-mono text-base text-white font-bold mt-5 mb-2 pb-1 border-b border-[#3e3e42]">
          {inlineFormat(line.slice(2))}
        </h1>
      );
      i++; continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="font-mono text-sm text-[#4ec9b0] font-bold mt-4 mb-2">
          {inlineFormat(line.slice(3))}
        </h2>
      );
      i++; continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="font-mono text-xs text-[#dcdcaa] font-bold mt-3 mb-1">
          {inlineFormat(line.slice(4))}
        </h3>
      );
      i++; continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="flex flex-col gap-1 my-2 pl-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#4ec9b0] font-mono text-xs mt-[2px] shrink-0">·</span>
              <span className="font-mono text-xs text-[#d4d4d4] leading-relaxed">
                {inlineFormat(item)}
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Horizontal rule
    if (line.startsWith("---") || line.startsWith("***")) {
      elements.push(
        <div key={key++} className="border-t border-[#3e3e42] my-4" />
      );
      i++; continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
      i++; continue;
    }

    // Paragraph
    elements.push(
      <p key={key++} className="font-mono text-xs text-[#d4d4d4] leading-relaxed">
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return elements;
}

// Inline formatting: **bold**, `code`
function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="font-mono text-[#4ec9b0] bg-[#1e1e1e] border border-[#3e3e42] px-1 py-[1px] rounded-sm text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DocumentPreview({
  title,
  functionName,
  filepath,
  primaryOwner,
  generatedAt,
  markdownContent,
  onDownload,
}: DocumentPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-[#252526] border border-[#3e3e42] rounded-sm overflow-hidden h-full">

      {/* Header */}
      <div className="flex flex-col gap-3 px-4 py-3 border-b border-[#3e3e42] shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={14} className="text-[#4ec9b0] shrink-0" />
            <span className="font-mono text-sm text-white truncate">{title}</span>
          </div>
          <AnimatedBadge variant="new" text="markdown" />
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <GitBranch size={11} className="text-[#6b6b6b]" />
            <span className="font-mono text-[10px] text-[#6b6b6b]">
              <span className="text-[#4ec9b0]">{functionName}</span>
              {" · "}
              {filepath}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <User size={11} className="text-[#6b6b6b]" />
            <span className="font-mono text-[10px] text-[#6b6b6b]">{primaryOwner}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={11} className="text-[#6b6b6b]" />
            <span className="font-mono text-[10px] text-[#6b6b6b]">
              {new Date(generatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <VortexButton
            variant="ghost"
            size="sm"
            icon={copied ? <Check size={12} /> : <Copy size={12} />}
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </VortexButton>
          <VortexButton
            variant="secondary"
            size="sm"
            onClick={onDownload}
          >
            Download .md
          </VortexButton>
        </div>
      </div>

      {/* Markdown content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex flex-col max-w-2xl">
          {renderMarkdown(markdownContent)}
        </div>
      </div>

    </div>
  );
}

export default DocumentPreview;