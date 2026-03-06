from collections import defaultdict, deque
from typing import Dict, Set


def reverse_graph(graph: Dict[str, Set[str]]):
    reverse = defaultdict(set)
    for caller, callees in graph.items():
        for callee in callees:
            reverse[callee].add(caller)
    return reverse


def compute_repo_blast_radius(function_name: str, graph: Dict[str, Set[str]]):
    reverse = reverse_graph(graph)

    # debug — remove after fixing
    print("Looking for:", function_name)
    print("Is it in reverse graph?", function_name in reverse)
    print("Reverse graph keys sample:", list(reverse.keys())[:10])

    visited = set()
    queue = deque([function_name])

    while queue:
        current = queue.popleft()
        for caller in reverse.get(current, set()):
            if caller not in visited:
                visited.add(caller)
                queue.append(caller)

    return visited