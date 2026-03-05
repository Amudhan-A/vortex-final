from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["git_blame"]

call_graph_collection = db["call_graph"]
functions_collection = db["functions"]