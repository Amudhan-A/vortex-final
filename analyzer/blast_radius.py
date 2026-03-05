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

    visited = set()
    queue = deque([function_name])

    while queue:

        current = queue.popleft()

        for caller in reverse.get(current, []):

            if caller not in visited:

                visited.add(caller)
                queue.append(caller)

    return visited