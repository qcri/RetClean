from fastapi import APIRouter, HTTPException
from schemas import RepairRequest
from core.repair import repair_data

router = APIRouter()


@router.post("/")
async def repair_endpoint(request: RepairRequest):
    response = await repair_data(
        request.entity_description,
        request.target_name,  # name of column to repair - string
        request.target_data,  # data of column to repair - list of str/none/null
        request.pivot_names,  # names of columns to use as context - list of strings
        request.pivot_data,  # data of columns to use as context - list of list of str/int/float
        request.reasoner_name,
        request.index_name,
        request.index_type,
        request.reranker_type,
    )
    if response["status"] == "fail":
        raise HTTPException(status_code=400, detail=response["message"])
    return response
