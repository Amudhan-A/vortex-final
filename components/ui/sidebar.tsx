"use client";

import React, { useState } from "react";
import {
  Search,
  GitBranch,
  Network,
  FileText,
  Settings,
  ChevronDown,
  User,
  Code2,
  Zap,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

// ─── Logo ────────────────────────────────────────────────────────────────────

function VortexLogo() {
  return (
    <div className="size-7 flex items-center justify-center">
      <GitBranch size={18} className="text-[#4ec9b0]" />
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function AvatarCircle() {
  return (
    <div className="relative rounded-full shrink-0 size-8 bg-[#2a2d2e] border border-[#3e3e42] flex items-center justify-center">
      <User size={14} className="text-[#d4d4d4]" />
    </div>
  );
}

// ─── Search ──────────────────────────────────────────────────────────────────

function SearchContainer({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [value, setValue] = useState("");

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`bg-[#1e1e1e] h-9 relative rounded-sm border border-[#3e3e42] flex items-center transition-all duration-500 ${
          isCollapsed ? "w-9 min-w-9 justify-center" : "w-full"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div className={`flex items-center justify-center shrink-0 ${isCollapsed ? "p-1" : "px-2"}`}>
          <Search size={13} className="text-[#6b6b6b]" />
        </div>

        <div
          className={`flex-1 transition-opacity duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <input
            type="text"
            placeholder="Search functions..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-transparent border-none outline-none font-mono text-xs text-[#d4d4d4] placeholder:text-[#6b6b6b] pr-2"
            tabIndex={isCollapsed ? -1 : 0}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Nav items config ────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  { id: "inspect",   label: "Inspector",   icon: <Code2 size={16} />,    href: "/inspect"   },
  { id: "graph",     label: "Graph",       icon: <Network size={16} />,  href: "/graph"     },
  { id: "search",    label: "Ask",         icon: <Zap size={16} />,      href: "/search"    },
  { id: "documents", label: "Documents",   icon: <FileText size={16} />, href: "/documents" },
];

// ─── Sidebar section content ─────────────────────────────────────────────────

interface SidebarSection {
  title: string;
  items: { label: string; sub?: string }[];
}

function getSidebarContent(activeSection: string): { title: string; sections: SidebarSection[] } {
  const map: Record<string, { title: string; sections: SidebarSection[] }> = {
    inspect: {
      title: "Inspector",
      sections: [
        {
          title: "Function Analysis",
          items: [
            { label: "Decision Log",    sub: "Why it exists"       },
            { label: "Blast Radius",    sub: "What breaks if changed" },
            { label: "Ownership",       sub: "Primary contributor" },
            { label: "Call Graph",      sub: "Callers & callees"   },
          ],
        },
        {
          title: "History",
          items: [
            { label: "Commit Timeline" },
            { label: "PR References"   },
            { label: "Linked Issues"   },
          ],
        },
      ],
    },
    graph: {
      title: "Graph",
      sections: [
        {
          title: "Views",
          items: [
            { label: "Dependency Graph" },
            { label: "Blast Radius Map" },
            { label: "Module Overview"  },
          ],
        },
        {
          title: "Filters",
          items: [
            { label: "By File"     },
            { label: "By Author"   },
            { label: "By Depth"    },
          ],
        },
      ],
    },
    search: {
      title: "Ask",
      sections: [
        {
          title: "Query",
          items: [
            { label: "Ask a Question"    },
            { label: "Recent Queries"    },
          ],
        },
        {
          title: "Examples",
          items: [
            { label: "Who owns this?"          },
            { label: "What calls validate()?"  },
            { label: "Why does this exist?"    },
          ],
        },
      ],
    },
    documents: {
      title: "Documents",
      sections: [
        {
          title: "Exports",
          items: [
            { label: "Decision Logs"  },
            { label: "Ownership Reports" },
            { label: "Full Analysis"  },
          ],
        },
        {
          title: "Formats",
          items: [
            { label: "Markdown" },
            { label: "PDF"      },
            { label: "JSON"     },
          ],
        },
      ],
    },
  };

  return map[activeSection] || map.inspect;
}

// ─── Icon nav button ─────────────────────────────────────────────────────────

function IconNavButton({
  children,
  isActive = false,
  onClick,
  title,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex items-center justify-center rounded-sm size-9 min-w-9 transition-colors duration-300 ${
        isActive
          ? "bg-[#2a2d2e] text-[#4ec9b0]"
          : "text-[#6b6b6b] hover:bg-[#2a2d2e] hover:text-[#d4d4d4]"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Left icon rail ───────────────────────────────────────────────────────────

function IconRail({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (s: string) => void;
}) {
  return (
    <aside className="bg-[#252526] flex flex-col items-center py-3 px-2 w-14 border-r border-[#3e3e42] h-screen">
      {/* Logo */}
      <div className="mb-4 size-9 flex items-center justify-center">
        <VortexLogo />
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-1 w-full items-center">
        {navItems.map((item) => (
          <IconNavButton
            key={item.id}
            isActive={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
            title={item.label}
          >
            {item.icon}
          </IconNavButton>
        ))}
      </div>

      <div className="flex-1" />

      {/* Bottom */}
      <div className="flex flex-col gap-1 items-center">
        <IconNavButton
          isActive={activeSection === "settings"}
          onClick={() => onSectionChange("settings")}
          title="Settings"
        >
          <Settings size={16} />
        </IconNavButton>
        <AvatarCircle />
      </div>
    </aside>
  );
}

// ─── Detail sidebar ───────────────────────────────────────────────────────────

function DetailSidebar({
  activeSection,
  isCollapsed,
  onToggleCollapse,
}: {
  activeSection: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Function Analysis", "Views", "Query", "Exports"]));
  const content = getSidebarContent(activeSection);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  return (
    <aside
      className={`bg-[#252526] flex flex-col border-r border-[#3e3e42] h-screen transition-all duration-500 overflow-hidden ${
        isCollapsed ? "w-0 px-0" : "w-56 px-3 py-3"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs uppercase tracking-widest text-[#4ec9b0]">
          {content.title}
        </span>
        <button
          onClick={onToggleCollapse}
          className="text-[#6b6b6b] hover:text-[#d4d4d4] transition-colors"
        >
          <ChevronDown size={14} className="rotate-90" />
        </button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <SearchContainer isCollapsed={false} />
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-3 overflow-y-auto flex-1">
        {content.sections.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full mb-1 group"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#6b6b6b] group-hover:text-[#d4d4d4] transition-colors">
                {section.title}
              </span>
              <ChevronDown
                size={11}
                className={`text-[#6b6b6b] transition-transform duration-300 ${
                  expandedSections.has(section.title) ? "rotate-0" : "-rotate-90"
                }`}
              />
            </button>

            {expandedSections.has(section.title) && (
              <div className="flex flex-col gap-[2px]">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col px-2 py-[6px] rounded-sm cursor-pointer hover:bg-[#2a2d2e] transition-colors group"
                  >
                    <span className="font-mono text-xs text-[#d4d4d4] group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                    {item.sub && (
                      <span className="font-mono text-[10px] text-[#6b6b6b] mt-[1px]">
                        {item.sub}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-[#3e3e42] flex items-center gap-2">
        <AvatarCircle />
        <div className="flex flex-col">
          <span className="font-mono text-xs text-[#d4d4d4]">dev</span>
          <span className="font-mono text-[10px] text-[#6b6b6b]">vortex</span>
        </div>
      </div>
    </aside>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function VortexSidebar() {
  const pathname = usePathname();
  const initial = navItems.find((n) => pathname?.startsWith(n.href))?.id ?? "inspect";
  const [activeSection, setActiveSection] = useState(initial);
  const [detailCollapsed, setDetailCollapsed] = useState(false);

  return (
    <div className="flex flex-row h-screen">
      <IconRail activeSection={activeSection} onSectionChange={setActiveSection} />
      <DetailSidebar
        activeSection={activeSection}
        isCollapsed={detailCollapsed}
        onToggleCollapse={() => setDetailCollapsed((s) => !s)}
      />
    </div>
  );
}

export default VortexSidebar;