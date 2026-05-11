from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase # 기존에 만드신 supabase 설정 가져오기

router = APIRouter(prefix="/api/applicants", tags=["applicants"])

class StatusUpdate(BaseModel):
    status: str

@router.patch("/{applicant_id}/status")
async def update_status(applicant_id: str, payload: StatusUpdate):
    response = supabase.table("applicants").update({
        "status": payload.status
    }).eq("id", applicant_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="지원자를 찾을 수 없습니다.")
        
    return {"message": "성공", "data": response.data[0]}