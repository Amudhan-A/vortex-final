from shared.types import GitContext, AnalysisResult, OwnershipResult
from .ast_graph import build_ast_graph
from .ownership import compute_ownership


def analyze(git_context: GitContext) -> tuple[AnalysisResult, OwnershipResult]:
    """
    Runs the full analyzer pipeline.

    Steps:
    1. Build AST call graph
    2. Compute blast radius
    3. Compute code ownership
    """

    analysis = build_ast_graph(
        filepath=git_context.filepath,
        function_name=git_context.function_name
    )

    ownership = compute_ownership(
        git_context.commits
    )

    return analysis, ownership