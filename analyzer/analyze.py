from shared.types import GitContext, AnalysisResult, OwnershipResult
from .ast_graph import build_ast_graph
from .ownership import compute_ownership

from .repo_graph import build_repo_graph
from .blast_radius import compute_repo_blast_radius
import os

def analyze(git_context: GitContext) -> tuple[AnalysisResult, OwnershipResult]:
    """
    Runs the full analyzer pipeline.

    Steps:
    1. Build AST graph for the specific file
    2. Build repository-level call graph
    3. Compute repository-wide blast radius
    4. Compute ownership
    """

    # -------- FILE LEVEL ANALYSIS --------
    file_analysis = build_ast_graph(
        filepath=git_context.filepath,
        function_name=git_context.function_name
    )
    repo_path = os.path.normpath(git_context.repo)
    # -------- REPOSITORY LEVEL GRAPH --------
    repo_graph = build_repo_graph(git_context.repo)
 # -------- DEBUG --------
    print("Repo path:", repo_path)
    print("Total functions in repo graph:", len(repo_graph))
    print("Direct callers of function:", repo_graph.get(git_context.function_name, set()))


    blast_radius = list(
        compute_repo_blast_radius(
            git_context.function_name,
            repo_graph
        )
    )
    print("Blast radius result:", blast_radius)
    # -------- OWNERSHIP --------
    ownership = compute_ownership(
        git_context.commits
    )

    # -------- FINAL RESULT --------
    analysis = AnalysisResult(
        function_name=file_analysis.function_name,
        callers=file_analysis.callers,
        callees=file_analysis.callees,
        blast_radius=blast_radius
    )

    
    repo_graph = build_repo_graph(git_context.repo)

    # add these debug lines
    print("Total functions in repo graph:", len(repo_graph))
    print("Direct callers of function:", repo_graph.get(git_context.function_name, set()))

    blast_radius = list(
        compute_repo_blast_radius(
            git_context.function_name,
            repo_graph
        )
    )
    print("Blast radius result:", blast_radius)

    return analysis, ownership