from pydantic import BaseModel
from typing import Optional


class RepairRequest(BaseModel):
    entity_description: Optional[str] = None
    target_name: str
    target_data: list[dict]
    pivot_names: list[str]
    pivot_data: list[dict]
    reasoner_name: str
    index_name: Optional[str] = None
    index_type: Optional[str] = None
    reranker_type: Optional[str] = None
