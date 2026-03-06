from miner.git_processor import mine_git_history
from analyzer.analyze import analyze
from llm.synthesizer import generate_decision_log


def explain_function(repo_path, filepath, function_name, owner, repo_name):

    git_context = mine_git_history(
        repo_path,
        filepath,
        function_name,
        owner,
        repo_name
    )

    analysis, ownership = analyze(git_context)

    decision_log = generate_decision_log(
        git_context,
        analysis,
        ownership
    )

    return decision_log