from .mongodb import functions_collection
from .mongodb import functions_collection, call_graph_collection


def save_function(data):
    """
    Insert a new function analysis document
    """
    return functions_collection.insert_one(data)


def update_function(repo, filepath, function_name, data):
    """
    Update existing function document
    """
    return functions_collection.update_one(
        {
            "repo": repo,
            "filepath": filepath,
            "function_name": function_name
        },
        {"$set": data},
        upsert=True
    )

   
    
def get_repo_functions(repo_name: str):

    results = functions_collection.find(
        {"repo": repo_name},
        {
            "_id": 0,  # remove Mongo ObjectId
            "filepath": 1,
            "function_name": 1
        }
    )

    return list(results)



def get_function(repo, filepath, function_name):

    return functions_collection.find_one(
        {
            "repo": repo,
            "filepath": filepath,
            "function_name": function_name
        },
        {"_id": 0}
    )

def get_repo_files(repo_name):

    return functions_collection.distinct("filepath", {"repo": repo_name})

    
    
    
    
    
    
    
    
    
    
    
    
    
def save_repo_graph(repo, graph):
    """
    Store repo dependency graph edges
    """
    call_graph_collection.delete_many({"repo": repo})

    edges = []

    for caller, callees in graph.items():
        for callee in callees:
            edges.append({
                "repo": repo,
                "caller": caller,
                "callee": callee
            })

    if edges:
        call_graph_collection.insert_many(edges)