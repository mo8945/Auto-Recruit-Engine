# api/sync.py
import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.email_worker import GmailWorker
from core.ai_engine import AIEngine
from services.pipeline_service import run_resume_pipeline
from services.auth_service import verify_passcode # [추가] 인증 모듈
from services.applicant_service import update_status_and_notify
from database import supabase

router = APIRouter()

# [추가] 프론트엔드에서 전송할 데이터 규격
class AuthRequest(BaseModel):
    passcode: str

@router.post("/sync")
async def sync_gmail_resumes(auth: AuthRequest):
    """
    패스코드를 확인하고 Gmail의 새 이력서를 동기화합니다.
    """
    # 1. 인사팀 패스코드 인증
    if not verify_passcode(auth.passcode):
        raise HTTPException(status_code=401, detail="인사팀 비밀번호가 틀렸습니다.")

    try:
        # 2. 작업 도구(Worker, Engine) 초기화
        worker = GmailWorker()
        engine = AIEngine()
        
        # 3. 타겟 메일 리스트 확보
        messages = worker.fetch_emails_with_attachments(query="has:attachment label:inbox")
        
        if not messages:
            return {"message": "신규 메일이 없습니다."}

        # 4. 파이프라인 병렬 실행 (최적화 완료)
        tasks = [run_resume_pipeline(msg['id'], worker, engine) for msg in messages]
        results = await asyncio.gather(*tasks)
        
        success_count = sum(1 for r in results if r is True)
        return {"message": f"총 {success_count}건의 새로운 지원자를 동기화했습니다."}

    except Exception as e:
        print(f"Sync Error: {e}")
        raise HTTPException(status_code=500, detail=f"동기화 중 오류 발생: {str(e)}")

@router.get("/applicants")
async def get_applicants():
    """
    대시보드용 지원자 전체 목록을 가져옵니다.
    """
    try:
        # 데이터 조인 (N+1 문제 방지를 위해 리스트 전체를 한 번에 조회)
        apps_res = supabase.table("applicants").select("*").execute()
        res_res = supabase.table("resumes").select("*").execute()
        kw_res = supabase.table("applicant_keywords").select("*").execute()
        
        applicants = apps_res.data
        all_resumes = res_res.data
        all_keywords = kw_res.data
        
        # 파이썬 레벨에서 매칭 (DB 부하 감소)
        for app in applicants:
            app['resumes'] = [r for r in all_resumes if r['applicant_id'] == app['id']]
            app['applicant_keywords'] = [k for k in all_keywords if k['applicant_id'] == app['id']]
                
        return applicants
    except Exception as e:
        print(f"데이터 조회 에러: {e}")
        return []

class StatusUpdateRequest(BaseModel):
    status: str

@router.patch("/applicants/{applicant_id}/status")
async def change_status(applicant_id: str, data: StatusUpdateRequest):
    try:
        await update_status_and_notify(applicant_id, data.status)
        return {"message": "상태 변경 및 안내 메일 발송 완료"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))