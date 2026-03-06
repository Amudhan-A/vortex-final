from db.repository import save_function

data = {
    "repo": "test_repo",
    "filepath": "auth/login.py",
    "function_name": "login",
    "analysis": {
        "callers": [],
        "callees": ["validate_user"],
        "blast_radius": []
    },
    "ownership": {
        "primary_owner": "alice",
        "confidence": 0.8
    }
}

result = save_function(data)

print("Inserted ID:", result.inserted_id)