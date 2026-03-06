from collections import defaultdict
from typing import List

from shared.types import CommitInfo, OwnershipResult


def compute_ownership(commits: List[CommitInfo]) -> OwnershipResult:
    """
    Determine primary ownership of a function based on commit history.

    Strategy:
    1. Count commits per author
    2. Identify the author with the highest contribution
    3. Compute confidence = commits_by_owner / total_commits
    4. Return contributor breakdown
    """

    if not commits:
        return OwnershipResult(
            primary_owner="unknown",
            confidence=0.0,
            contributors=[]
        )

    author_commit_count = defaultdict(int)

    for commit in commits:
        author_commit_count[commit.author] += 1

    total_commits = len(commits)

    # Find primary owner
    primary_owner = max(author_commit_count, key=author_commit_count.get)
    owner_commits = author_commit_count[primary_owner]

    confidence = owner_commits / total_commits

    contributors = [
        {
            "author": author,
            "commits": count
        }
        for author, count in sorted(
            author_commit_count.items(),
            key=lambda x: x[1],
            reverse=True
        )
    ]

    return OwnershipResult(
        primary_owner=primary_owner,
        confidence=confidence,
        contributors=contributors
    )