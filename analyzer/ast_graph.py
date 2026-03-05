import ast
from collections import defaultdict, deque
from typing import Dict, Set

from shared.types import AnalysisResult


class CallGraphBuilder(ast.NodeVisitor):
    """
    Walks the AST and builds a function call graph.

    graph format:
        {
            "function_a": {"function_b", "function_c"},
            "function_b": {"function_d"}
        }
    """

    def __init__(self):
        self.graph: Dict[str, Set[str]] = defaultdict(set)
        self.current_function: str | None = None

    def visit_FunctionDef(self, node: ast.FunctionDef):
        """
        When entering a function definition,
        set current_function so we know who the caller is.
        """
        previous_function = self.current_function
        self.current_function = node.name

        self.generic_visit(node)

        self.current_function = previous_function

    def visit_Call(self, node: ast.Call):
        """
        Detect function calls inside functions.
        """
        if self.current_function is None:
            return

        # direct function calls like foo()
        if isinstance(node.func, ast.Name):
            callee = node.func.id
            self.graph[self.current_function].add(callee)

        # method calls like obj.foo()
        elif isinstance(node.func, ast.Attribute):
            callee = node.func.attr
            self.graph[self.current_function].add(callee)

        self.generic_visit(node)


def _reverse_graph(graph: Dict[str, Set[str]]) -> Dict[str, Set[str]]:
    """
    Reverse call graph to compute callers.
    """
    reverse = defaultdict(set)

    for caller, callees in graph.items():
        for callee in callees:
            reverse[callee].add(caller)

    return reverse


def _compute_blast_radius(function_name: str, reverse_graph: Dict[str, Set[str]]) -> Set[str]:
    """
    Blast radius = all functions that depend (directly or indirectly)
    on the target function.
    """
    visited = set()
    queue = deque([function_name])

    while queue:
        current = queue.popleft()

        for caller in reverse_graph.get(current, []):
            if caller not in visited:
                visited.add(caller)
                queue.append(caller)

    return visited


def build_ast_graph(filepath: str, function_name: str) -> AnalysisResult:
    """
    Main entry point used by the API layer.

    Steps:
    1. Parse file
    2. Build call graph
    3. Compute callers
    4. Compute callees
    5. Compute blast radius
    """

    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()

    tree = ast.parse(source)

    builder = CallGraphBuilder()
    builder.visit(tree)

    graph = builder.graph
    reverse_graph = _reverse_graph(graph)

    callees = list(graph.get(function_name, []))
    callers = list(reverse_graph.get(function_name, []))

    blast_radius = list(
        _compute_blast_radius(function_name, reverse_graph)
    )

    return AnalysisResult(
        function_name=function_name,
        callers=callers,
        callees=callees,
        blast_radius=blast_radius,
    )