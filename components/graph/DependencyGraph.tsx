"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { VortexButton } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NodeType = "root" | "direct" | "indirect" | "callee";

export interface GraphNode {
  id: string;
  label: string;
  filepath: string;
  type: NodeType;
}

export interface GraphEdge {
  source: string;
  target: string;
  animated?: boolean;
}

export interface DependencyGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootId: string;
  onNodeClick?: (node: GraphNode) => void;
}

// ─── Color config ─────────────────────────────────────────────────────────────

const NODE_COLORS: Record<NodeType, { fill: string; stroke: string; glow: string }> = {
  root:     { fill: "#4ec9b0",  stroke: "#4ec9b0",  glow: "#4ec9b0" },
  direct:   { fill: "#f48771",  stroke: "#f48771",  glow: "#f48771" },
  indirect: { fill: "#dcdcaa",  stroke: "#dcdcaa",  glow: "#dcdcaa" },
  callee:   { fill: "#9cdcfe",  stroke: "#9cdcfe",  glow: "#9cdcfe" },
};

const NODE_RADIUS: Record<NodeType, number> = {
  root:     28,
  direct:   18,
  indirect: 14,
  callee:   14,
};

// ─── Legend item ──────────────────────────────────────────────────────────────

function LegendItem({ type, label }: { type: NodeType; label: string }) {
  const { fill } = NODE_COLORS[type];
  return (
    <div className="flex items-center gap-2">
      <div className="size-2 rounded-full" style={{ backgroundColor: fill }} />
      <span className="font-mono text-[10px] text-[#6b6b6b]">{label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DependencyGraph({
  nodes,
  edges,
  rootId,
  onNodeClick,
}: DependencyGraphProps) {
  const svgRef      = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip]   = useState<{ x: number; y: number; node: GraphNode } | null>(null);
  const [dims, setDims]         = useState({ w: 800, h: 500 });
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Track container size
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const { w, h } = dims;
    const cx = w / 2;
    const cy = h / 2;

    // ── Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", w)
      .attr("height", h);

    // ── Defs: filters + gradients
    const defs = svg.append("defs");

    // Glow filters per type
    Object.entries(NODE_COLORS).forEach(([type, colors]) => {
      const filter = defs.append("filter")
        .attr("id", `glow-${type}`)
        .attr("x", "-50%").attr("y", "-50%")
        .attr("width", "200%").attr("height", "200%");
      filter.append("feGaussianBlur")
        .attr("stdDeviation", type === "root" ? "6" : "4")
        .attr("result", "coloredBlur");
      const merge = filter.append("feMerge");
      merge.append("feMergeNode").attr("in", "coloredBlur");
      merge.append("feMergeNode").attr("in", "SourceGraphic");
    });

    // Edge gradient
    defs.append("linearGradient")
      .attr("id", "edge-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#4ec9b0", opacity: 0.8 },
        { offset: "100%", color: "#3e3e42", opacity: 0.2 },
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color)
      .attr("stop-opacity", d => d.opacity);

    // Animated dash marker
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -4 8 8")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L8,0L0,4")
      .attr("fill", "#4ec9b0")
      .attr("opacity", 0.6);

    // ── Zoom layer
    const g = svg.append("g").attr("class", "zoom-layer");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);


    // recompute node types relative to root
    const nodeMap = new Map(nodes.map(n => [n.id, { ...n }]));

    nodeMap.forEach(node => {
    if (node.id === rootId) {
        node.type = "root";
        return;
    }

    const isDirect = edges.some(e => e.target === node.id && e.source === rootId);
    const isCallee = edges.some(e => e.source === node.id && e.target === rootId);

    if (isDirect) node.type = "direct";
    else if (isCallee) node.type = "callee";
    else node.type = "indirect";
    });

    const computedNodes = Array.from(nodeMap.values());

    // ── Radial layout
    const nonRootNodes = computedNodes.filter(n => n.id !== rootId);
    const direct   = nonRootNodes.filter(n => n.type === "direct");
    const indirect = nonRootNodes.filter(n => n.type === "indirect");
    const callee   = nonRootNodes.filter(n => n.type === "callee");

    const RADII = { direct: 160, indirect: 280, callee: 160 };

    const positionMap = new Map<string, { x: number; y: number }>();
    positionMap.set(rootId, { x: cx, y: cy });

    const placeNodes = (nodeList: GraphNode[], radius: number, angleOffset = 0) => {
      nodeList.forEach((node, i) => {
        const angle = angleOffset + (i / nodeList.length) * 2 * Math.PI;
        positionMap.set(node.id, {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        });
      });
    };

    placeNodes(direct,   RADII.direct,   -Math.PI / 2);
    placeNodes(indirect, RADII.indirect, -Math.PI / 2 + Math.PI / indirect.length || 0);
    placeNodes(callee,   RADII.callee,   Math.PI / 2);

    // ── Draw orbit rings
    [RADII.direct, RADII.indirect].forEach((r, i) => {
      g.append("circle")
        .attr("cx", cx).attr("cy", cy).attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#3e3e42")
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "4 6")
        .attr("opacity", 0.4);
    });

    // ── Draw edges
    const edgeGroup = g.append("g").attr("class", "edges");

    edges.forEach((edge, idx) => {
      const src  = positionMap.get(edge.source);
      const tgt  = positionMap.get(edge.target);
      if (!src || !tgt) return;

      const targetNode = computedNodes.find(n => n.id === edge.target);
      const color = targetNode ? NODE_COLORS[targetNode.type].stroke : "#3e3e42";

      // Static base edge
      edgeGroup.append("line")
        .attr("x1", src.x).attr("y1", src.y)
        .attr("x2", tgt.x).attr("y2", tgt.y)
        .attr("stroke", "#3e3e42")
        .attr("stroke-width", 1)
        .attr("opacity", 0.4);

      // Animated pulse edge
      if (edge.animated !== false) {
        const pulseId = `pulse-${idx}`;
        const pathD = `M${src.x},${src.y} L${tgt.x},${tgt.y}`;
        const totalLen = Math.hypot(tgt.x - src.x, tgt.y - src.y);

        const pulseLine = edgeGroup.append("line")
          .attr("x1", src.x).attr("y1", src.y)
          .attr("x2", tgt.x).attr("y2", tgt.y)
          .attr("stroke", color)
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", `${totalLen * 0.15} ${totalLen * 0.85}`)
          .attr("stroke-dashoffset", totalLen)
          .attr("opacity", 0.8)
          .attr("marker-end", "url(#arrowhead)");

        // Animate the dash traveling along the edge
        const delay = idx * 120;
        const duration = 1800 + Math.random() * 600;

        function animatePulse() {
          pulseLine
            .attr("stroke-dashoffset", totalLen)
            .transition()
            .duration(duration)
            .delay(delay % duration)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", -totalLen * 0.15)
            .on("end", animatePulse);
        }
        animatePulse();
      }
    });

    // ── Draw nodes
    const nodeGroup = g.append("g").attr("class", "nodes");

    computedNodes.forEach((node) => {
      const pos = positionMap.get(node.id);
      if (!pos) return;

      const colors = NODE_COLORS[node.type];
      const r = NODE_RADIUS[node.type];
      const isRoot = node.id === rootId;

      const nodeG = nodeGroup.append("g")
        .attr("transform", `translate(${pos.x}, ${pos.y})`)
        .attr("cursor", "pointer")
        .on("mouseenter", function (event) {
          d3.select(this).select("circle.main")
            .transition().duration(200)
            .attr("r", r * 1.3)
            .attr("filter", `url(#glow-${node.type})`);
          d3.select(this).select("circle.ring")
            .transition().duration(200)
            .attr("opacity", 0.6);

          const svgRect = svgRef.current!.getBoundingClientRect();
          setTooltip({
            x: event.clientX - svgRect.left,
            y: event.clientY - svgRect.top,
            node,
          });
        })
        .on("mouseleave", function () {
          d3.select(this).select("circle.main")
            .transition().duration(200)
            .attr("r", r)
            .attr("filter", isRoot ? `url(#glow-${node.type})` : "none");
          d3.select(this).select("circle.ring")
            .transition().duration(200)
            .attr("opacity", 0);
          setTooltip(null);
        })
        .on("click", () => onNodeClick?.(node));

      // Outer pulse ring (root only continuous, others on hover)
      nodeG.append("circle")
        .attr("class", "ring")
        .attr("r", r + 8)
        .attr("fill", "none")
        .attr("stroke", colors.glow)
        .attr("stroke-width", 1)
        .attr("opacity", isRoot ? 0.3 : 0);

      if (isRoot) {
        // Continuous pulse for root
        function pulseRoot(sel: d3.Selection<SVGCircleElement, unknown, null, undefined>) {
          sel.transition()
            .duration(1600)
            .ease(d3.easeSinInOut)
            .attr("r", r + 12)
            .attr("opacity", 0.05)
            .transition()
            .duration(1600)
            .ease(d3.easeSinInOut)
            .attr("r", r + 6)
            .attr("opacity", 0.3)
            .on("end", function() { pulseRoot(d3.select(this as SVGCircleElement)); });
        }
        pulseRoot(nodeG.select<SVGCircleElement>("circle.ring"));
      }

      // Main circle
      nodeG.append("circle")
        .attr("class", "main")
        .attr("r", r)
        .attr("fill", isRoot ? colors.fill : `${colors.fill}22`)
        .attr("stroke", colors.stroke)
        .attr("stroke-width", isRoot ? 2 : 1.5)
        .attr("filter", isRoot ? `url(#glow-${node.type})` : "none");

      // Label
      const maxLen = isRoot ? 12 : 9;
      const labelText = node.label.length > maxLen
        ? node.label.slice(0, maxLen) + "…"
        : node.label;

      nodeG.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", isRoot ? "0.35em" : "0.35em")
        .attr("font-family", "monospace")
        .attr("font-size", isRoot ? 11 : 9)
        .attr("fill", isRoot ? "#1e1e1e" : colors.fill)
        .attr("font-weight", isRoot ? "bold" : "normal")
        .attr("pointer-events", "none")
        .text(labelText);

      // Filepath label below node (non-root)
      if (!isRoot) {
        const fileLabel = node.filepath.split("/").pop() || node.filepath;
        nodeG.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", r + 14)
          .attr("font-family", "monospace")
          .attr("font-size", 8)
          .attr("fill", "#6b6b6b")
          .attr("pointer-events", "none")
          .text(fileLabel.length > 14 ? fileLabel.slice(0, 14) + "…" : fileLabel);
      }
    });

  }, [nodes, edges, rootId, dims, onNodeClick]);

  // ── Zoom controls
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300)
      .call(zoomRef.current.scaleBy, 1.4);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300)
      .call(zoomRef.current.scaleBy, 0.7);
  };

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(400)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div className="flex flex-col bg-[#252526] border border-[#3e3e42] rounded-sm overflow-hidden h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3e3e42] shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-white">Dependency Graph</span>
          <span className="font-mono text-[10px] text-[#6b6b6b]">
            {nodes.length} nodes · {edges.length} edges
          </span>
        </div>
        <div className="flex items-center gap-1">
          <VortexButton variant="ghost" size="sm" onClick={handleZoomIn}  icon={<ZoomIn  size={12} />} />
          <VortexButton variant="ghost" size="sm" onClick={handleZoomOut} icon={<ZoomOut size={12} />} />
          <VortexButton variant="ghost" size="sm" onClick={handleReset}   icon={<RotateCcw size={12} />} />
        </div>
      </div>

      {/* Graph canvas */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden bg-[#1e1e1e]">
        {/* Background grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#2a2d2e" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* D3 SVG */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: "grab" }}
        />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-10 bg-[#252526] border border-[#3e3e42] rounded-sm px-3 py-2 flex flex-col gap-1"
            style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
          >
            <span className="font-mono text-xs text-white">{tooltip.node.label}</span>
            <span className="font-mono text-[10px] text-[#6b6b6b]">{tooltip.node.filepath}</span>
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: NODE_COLORS[tooltip.node.type].fill }}
            >
              {tooltip.node.type}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-[#3e3e42] shrink-0">
        <LegendItem type="root"     label="root function" />
        <LegendItem type="direct"   label="direct impact" />
        <LegendItem type="indirect" label="indirect impact" />
        <LegendItem type="callee"   label="calls" />
        <span className="font-mono text-[10px] text-[#3e3e42] ml-auto">
          scroll to zoom · drag to pan
        </span>
      </div>

    </div>
  );
}

export default DependencyGraph;