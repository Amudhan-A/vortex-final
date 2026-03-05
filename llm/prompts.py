from shared.types import GitContext, AnalysisResult, OwnershipResult

def build_decision_log_prompt(git_context: GitContext, analysis_result: AnalysisResult, ownership_result: OwnershipResult) -> str:

    commits_text = "\n".join([
        f"- [{c.date}] {c.author}: {c.message.strip()}"
        f"\n  issues: {', '.join(c.linked_issues) or 'none'}"
        f"\n  diff:\n{(c.diff_snippet[:500] if c.diff_snippet else 'no diff available')}\n"
        for c in git_context.commits[:5]
    ]) or "No commits available."


    prs_text = "\n".join([
        f"- PR #{pr.pr_number}: {pr.title}\n {(pr.body or '').strip()[:300]}"
        for pr in git_context.prs
    ]) or "No PRs available."

    callers_text = ", ".join(analysis_result.callers) or "none"
    callees_text = ", ".join(analysis_result.callees) or "none"
    blast_text = ", ".join(analysis_result.blast_radius) or "none"

    return f"""
You are a senior software engineer performing codebase archaeology.

Using ONLY the provided data, produce a decision log for the function below.

Requirements:

* Use only evidence from the context.
* Do NOT speculate or invent information.
* If evidence is missing, return an empty list or a short neutral statement.
* Be concise and factual.
* Output valid JSON only. No markdown, explanations, or extra text.

Context:
FUNCTION: {git_context.function_name}
FILE: {git_context.filepath}
REPO: {git_context.repo}

PRIMARY_OWNER: {ownership_result.primary_owner}
OWNER_CONFIDENCE: {ownership_result.confidence:.0%}

CALLS:
{callees_text}

CALLED_BY:
{callers_text}

BLAST_RADIUS:
{blast_text}

COMMITS:
{commits_text}

PULL_REQUESTS:
{prs_text}

Task:
Summarize the historical and architectural intent of the function.

Return JSON with:

* why_it_exists: short explanation of the function's purpose inferred from usage and history
* key_decisions: important implementation or design changes visible in commits or PRs
* linked_issues: referenced issue numbers, PR IDs, or tickets found in commit/PR text

Return EXACTLY this structure:

Respond in this exact JSON format with no extra text or markdown:
{{"why_it_exists": "...", "key_decisions": ["...", "..."], "linked_issues": ["...", "..."]}}

"""