from fastapi import APIRouter
from core import initialized_models

router = APIRouter()


@router.get("/")
async def get_models_endpoint():
    cloud = {"name": "Cloud Models", "options": []}
    local = {"name": "Local Models", "options": []}
    for name, model in initialized_models.items():
        if model.type == "cloud":
            cloud["options"].append(name)
        else:
            local["options"].append(name)
    models = {"cloud": cloud, "local": local}
    return {"status": "success", "models": models}
