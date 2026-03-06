import requests
from shared.types import PRContext


def fetch_pr_context(owner, repo, pr_number):

    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"

    response = requests.get(url)
    data = response.json()

    return PRContext(
        pr_number=pr_number,
        title=data["title"],
        body=data["body"],
        comments=[],
        linked_issues=[]
    )