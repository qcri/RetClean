from fastapi import APIRouter, HTTPException
from schemas import RepairRequest
from core.repair import repair_data

router = APIRouter()


@router.post("/")
async def repair_endpoint(request: RepairRequest):
    response = await repair_data(
        request.entity_description,
        request.target_name,
        request.target_data,
        request.pivot_names,
        request.pivot_data,
        request.reasoner_name,
        request.index_name,
        request.index_type,
        request.reranker_type,
    )
    if response["status"] == "fail":
        raise HTTPException(status_code=400, detail=response["message"])
    return response
