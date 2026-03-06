from miner.github_fetcher import fetch_pr_context

owner = "facebook"
repo = "react"
pr_number = 27000

pr = fetch_pr_context(owner, repo, pr_number)

print("PR Title:", pr.title)
print("PR Body:", pr.body[:200])  # print first 200 chars