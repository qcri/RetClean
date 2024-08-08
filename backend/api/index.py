from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from core.index import get_indexes, create_index, update_index, delete_index

router = APIRouter()


@router.get("/")
async def get_indexes_endpoint():
    response = await get_indexes()
    if response["status"] == "fail":
        raise HTTPException(status_code=400, detail=response["message"])
    return response


@router.post("/")
async def create_index_endpoint(
    index_name=Form(...), csv_files: list[UploadFile] = File(...)
):
    response = await create_index(index_name)
    if response["status"] == "fail":
        raise HTTPException(status_code=400, detail=response["message"])

    response = await update_index(index_name, csv_files)
    if response["status"] == "fail":
        raise HTTPException(status_code=400, detail=response["message"])
    return response


@router.put("/")
async def update_index_endpoint(
    index_name=Form(...), csv_files: list[UploadFile] = File(...)
):
    response = await update_index(index_name, csv_files)
    if response["status"] == "fail":
        raise HTTPException(status_code=400, detail=response["message"])
    return response


@router.delete("/{index_name}")
async def delete_index_endpoint(index_name: str):
    response = await delete_index(index_name)
    if response["status"] == "fail":
        raise HTTPException(status_code=400, detail=response["message"])
    return response
