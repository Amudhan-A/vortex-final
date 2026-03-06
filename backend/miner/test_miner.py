from miner.git_processor import mine_git_history

repo_path = "D:/vortex/project/backend"   # path to ANY git repo
filepath = "api/main.py" # file inside that repo
function_name = "root"
owner="Amudhan-A"
repo_name="git-blame-app-backend"

result = mine_git_history(repo_path, filepath, function_name,owner, repo_name) 

print(result)
print("Total commits found:", len(result.commits))

for c in result.commits[:5]:
    print(c.sha, c.message)