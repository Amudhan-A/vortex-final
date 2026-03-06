import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from shared.types import (
    GitContext, CommitInfo, PRContext,
    AnalysisResult, OwnershipResult
)
from llm.synthesizer import generate_decision_log

mock_git = GitContext(
    repo="acme/backend",
    filepath="src/auth.py",
    function_name="validate_user",
    commits=[
        CommitInfo(
            sha="a1b2c3",
            message="Add JWT validation",
            author="alice",
            date="2025-01-10",
            diff_snippet="+def validate_user(token):",
            linked_issues=["#42"]
        ),
        CommitInfo(
            sha="d4e5f6",
            message="Cache token validation for performance",
            author="bob",
            date="2025-03-22",
            diff_snippet="+cache.set(token, result)",
            linked_issues=["#87"]
        )
    ],
    prs=[
        PRContext(
            pr_number=112,
            title="Switch from sessions to JWT",
            body="Sessions were causing issues in load balanced envs.",
            comments=["Looks good", "Added tests"],
            linked_issues=["#42"]
        )
    ]
)

mock_analysis = AnalysisResult(
    function_name="validate_user",
    callers=["login", "middleware.authenticate"],
    callees=["jwt.decode", "cache.get"],
    blast_radius=["auth.py:login", "middleware.py:authenticate"]
)

mock_ownership = OwnershipResult(
    primary_owner="alice",
    confidence=0.72,
    contributors=[{"name": "alice", "commits": 8}, {"name": "bob", "commits": 3}]
)

result = generate_decision_log(mock_git, mock_analysis, mock_ownership)
print(result)