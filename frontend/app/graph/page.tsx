"use client";

import { useEffect, useState } from "react";
import DependencyGraph, {
  GraphNode,
  GraphEdge,
} from "@/components/graph/DependencyGraph";

type RepoMap = {
  nodes: string[];
  edges: { caller: string; callee: string };
};

export default function GraphPage() {

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [rootId, setRootId] = useState<string>("");

  useEffect(() => {
    async function loadGraph() {

      const repoPath = "D:\\vortex\\project\\backend";

      const res = await fetch(
        `http://localhost:8000/repo-map?repo=${encodeURIComponent(repoPath)}`
      );

      const data = await res.json();

      const root = "analyze"; // choose entrypoint
      setRootId(root);

      const graphNodes: GraphNode[] = data.nodes.map((name: string) => ({
        id: name,
        label: name,
        filepath: "unknown", // backend doesn't send yet
        type:
          name === root
            ? "root"
            : data.edges.some((e: any) => e.caller === root && e.callee === name)
            ? "callee"
            : data.edges.some((e: any) => e.callee === root && e.caller === name)
            ? "direct"
            : "indirect",
      }));

      const graphEdges: GraphEdge[] = data.edges.map((e: any) => ({
        source: e.caller,
        target: e.callee,
        animated: true,
      }));

      setNodes(graphNodes);
      setEdges(graphEdges);
    }

    loadGraph();
  }, []);

  return (
    <div className="h-screen p-6">
      <DependencyGraph
        nodes={nodes}
        edges={edges}
        rootId={rootId}
        onNodeClick={(node) => setRootId(node.id)}
      />
    </div>
  );
}