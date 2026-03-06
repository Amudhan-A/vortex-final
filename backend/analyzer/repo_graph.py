import os
import ast
from collections import defaultdict
from typing import Dict, Set


class RepoCallGraphBuilder(ast.NodeVisitor):

    def __init__(self):
        self.graph: Dict[str, Set[str]] = defaultdict(set)
        self.current_function = None

    def visit_FunctionDef(self, node: ast.FunctionDef):
        prev = self.current_function
        self.current_function = node.name

        self.generic_visit(node)

        self.current_function = prev

    def visit_Call(self, node: ast.Call):
        if self.current_function is None:
            return

        if isinstance(node.func, ast.Name):
            callee = node.func.id
            self.graph[self.current_function].add(callee)

        elif isinstance(node.func, ast.Attribute):
            callee = node.func.attr
            self.graph[self.current_function].add(callee)

        self.generic_visit(node)


def build_repo_graph(repo_path: str) -> Dict[str, Set[str]]:
    """
    Builds a call graph for the entire repository.
    """

    graph = defaultdict(set)

    for root, _, files in os.walk(repo_path):

        for file in files:

            if file.endswith(".py"):

                path = os.path.join(root, file)

                with open(path, "r", encoding="utf-8") as f:
                    source = f.read()

                tree = ast.parse(source)

                builder = RepoCallGraphBuilder()
                builder.visit(tree)

                for k, v in builder.graph.items():
                    graph[k].update(v)

    return graph