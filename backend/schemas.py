from pydantic import BaseModel
from typing import List, Optional, Dict


class RepairRequest(BaseModel):
    entity_description: Optional[str] = None
    target_name: str
    target_data: List[Dict]
    pivot_names: List[str]
    pivot_data: List[Dict]
    reasoner_name: str
    index_name: Optional[str] = None
    index_type: Optional[str] = None
    reranker_type: Optional[str] = None
