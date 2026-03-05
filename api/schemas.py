from pydantic import BaseModel


class ExplainRequest(BaseModel):
    repo_path: str
    filepath: str
    function_name: str
    owner: str
    repo_name: str