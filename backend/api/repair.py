from fastapi import APIRouter, HTTPException
from schemas import RepairRequest
from core.repair import repair_data

router = APIRouter()


@router.post("/")
async def repair_endpoint(request: RepairRequest):
    response = await repair_data(
        request.index_name,
        request.index_type,
        request.reranker_type,
        request.language_model_name,
        request.pivot_names,
        request.pivot_data,
        request.target_name,
        request.target_data,
    )
    if response["status"] == "fail":
        raise HTTPException(status_code=400, detail=response["message"])
    return response
