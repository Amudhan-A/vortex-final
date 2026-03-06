import git
import re
from shared.types import CommitInfo, GitContext
from miner.github_fetcher import fetch_pr_context


def mine_git_history(repo_path: str, filepath: str, function_name: str, owner: str, repo_name: str):

    repo = git.Repo(repo_path)

    commits = []
    prs = []
    seen_prs = set()

    for commit in repo.iter_commits(paths=filepath):

        message = commit.message
        issues = re.findall(r"#(\d+)", message)

        # ---- Fetch PRs referenced in commit message ----
        for issue in issues:
            if issue not in seen_prs:
                try:
                    pr = fetch_pr_context(owner, repo_name, issue)
                    prs.append(pr)
                    seen_prs.add(issue)
                except:
                    pass

        # ---- Extract diff ----
        diff_text = ""

        if commit.parents:
            parent = commit.parents[0]

            diffs = commit.diff(parent, paths=filepath, create_patch=True)

            for diff in diffs:
                diff_text += diff.diff.decode("utf-8", errors="ignore")

        # ---- Build CommitInfo ----
        commit_info = CommitInfo(
            sha=commit.hexsha,
            message=message,
            author=str(commit.author),
            date=str(commit.committed_datetime),
            diff_snippet=diff_text,
            linked_issues=issues
        )

        commits.append(commit_info)

    return GitContext(
        repo=repo_path,
        filepath=filepath,
        function_name=function_name,
        commits=commits,
        prs=prs
    )