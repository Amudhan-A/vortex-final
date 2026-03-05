from analyzer import analyze
from shared.types import GitContext, CommitInfo, PRContext

# ---- fake commit history (simulating Dev1 output) ----
commits = [
    CommitInfo("1", "add login", "alice", "2024", "", []),
    CommitInfo("2", "fix bug", "alice", "2024", "", []),
    CommitInfo("3", "update token", "bob", "2024", "", []),
]

prs = []

# ---- mock GitContext (Dev1 output) ----
context = GitContext(
    repo="test_repo",
    filepath="example.py",
    function_name="validate_user",
    commits=commits,
    prs=prs
)

# ---- run analyzer pipeline ----
analysis, ownership = analyze(context)

print("=== ANALYSIS ===")
print(analysis)

print("\n=== OWNERSHIP ===")
print(ownership)