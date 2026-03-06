import json
from datetime import datetime
import ollama
from dotenv import load_dotenv

load_dotenv()


from shared.types import GitContext, AnalysisResult, OwnershipResult, DecisionLog
from llm.prompts import build_decision_log_prompt





def generate_decision_log(git_context: GitContext, analysis_result: AnalysisResult, ownership_result: OwnershipResult) -> DecisionLog:

    prompt = build_decision_log_prompt(git_context, analysis_result, ownership_result)

    try:
        response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}]
    )
        raw = response["message"]["content"]
        clean = raw.strip().removeprefix("```json").removesuffix("```").strip()
        parsed = json.loads(clean)

    except json.JSONDecodeError:
        parsed = {
            "why_it_exists": "Could not generate analysis.",
            "key_decisions": [],
            "linked_issues": []
        }

    return DecisionLog(
        function_name=git_context.function_name,
        why_it_exists=parsed["why_it_exists"],
        linked_issues=parsed.get("linked_issues", []),
        key_decisions=parsed["key_decisions"],
        generated_at=datetime.utcnow().isoformat()
    )