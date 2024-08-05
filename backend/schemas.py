from pydantic import BaseModel
from typing import List, Optional, Dict
from fastapi import UploadFile


class RepairRequest(BaseModel):
    index_name: Optional[str] = None
    index_type: Optional[str] = None
    reranker_type: Optional[str] = None
    language_model_name: str
    pivot_names: List[str]
    pivot_data: List[Dict]
    target_name: str
    target_data: List[Dict]
