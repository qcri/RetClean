from fastapi import APIRouter, HTTPException
from core.llm import get_models

router = APIRouter()


@router.get("/")
async def get_models_endpoint():
    response = get_models()
    if response["status"] == "fail":
        raise HTTPException(status_code=400, detail=response["message"])
    return response
