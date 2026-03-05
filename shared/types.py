from dataclasses import dataclass
from typing import List, Dict


# ---------- Git Mining Layer (Dev1 output) ----------

@dataclass
class CommitInfo:
    sha: str
    message: str
    author: str
    date: str
    diff_snippet: str
    linked_issues: List[str]


@dataclass
class PRContext:
    pr_number: int
    title: str
    body: str
    comments: List[str]
    linked_issues: List[str]


@dataclass
class GitContext:
    repo: str
    filepath: str
    function_name: str
    commits: List[CommitInfo]
    prs: List[PRContext]


# ---------- Analyzer Layer (YOUR OUTPUT) ----------

@dataclass
class AnalysisResult:
    function_name: str
    callers: List[str]
    callees: List[str]
    blast_radius: List[str]


@dataclass
class OwnershipResult:
    primary_owner: str
    confidence: float
    contributors: List[Dict]


# ---------- LLM Layer ----------

@dataclass
class DecisionLog:
    function_name: str
    why_it_exists: str
    linked_issues: List[str]
    key_decisions: List[str]
    generated_at: str