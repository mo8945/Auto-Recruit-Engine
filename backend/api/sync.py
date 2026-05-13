import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.email_worker import GmailWorker
from core.ai_engine import AIEngine
from services.pipeline_service import run_resume_pipeline
from services.auth_service import verify_passcode
from services.applicant_service import update_status_and_notify
from services.admin_service import delete_all_season_data
from database import supabase

router = APIRouter()

class AuthRequest(BaseModel):
    passcode: str

class StatusUpdateRequest(BaseModel):
    status: str

@router.post("/sync")
async def sync_gmail_resumes(auth: AuthRequest):
    # 패스코드 문자열 변환 검증
    if not verify_passcode(str(auth.passcode)):
        raise HTTPException(status_code=401, detail="인사팀 비밀번호가 틀렸습니다.")

    try:
        worker = GmailWorker()
        engine = AIEngine()
        target_query = "has:attachment label:inbox ([지원] OR [입사지원] OR [채용] OR 이력서 OR 자기소개서 OR 포트폴리오)"
        messages = worker.fetch_emails_with_attachments(query=target_query)
        
        if not messages:
            return {"message": "신규 메일이 없습니다."}

        success_count = 0
        for msg in messages:
            try:
                await run_resume_pipeline(msg.get('id'), worker, engine)
                success_count += 1
            except Exception as inner_e:
                print(f"⚠️ 개별 메일 처리 실패: {inner_e}")
                continue

        return {"message": f"총 {success_count}건 동기화 완료"}
    
    except Exception as e:
        # 🐧 이 부분이 핵심입니다! 에러 원인을 프론트엔드로 전달합니다.
        error_detail = f"지메일 인증 실패: {str(e)}"
        print(f"❌ {error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)

@router.get("/applicants")
async def get_applicants():
    """
    지원자 목록 조회 (AI 요약 평탄화 포함)
    """
    try:
        applicants_res = supabase.table("applicants").select("*").order("created_at", desc=True).execute()
        resumes_res = supabase.table("resumes").select("*").execute()
        
        applicants = applicants_res.data or []
        all_resumes = resumes_res.data or []

        for app in applicants:
            # ID 타입 매칭
            app_resumes = [r for r in all_resumes if str(r.get('applicant_id')) == str(app.get('id'))]
            app['resumes'] = app_resumes
            
            # 최신 요약본 상위로 노출
            if app_resumes:
                latest = sorted(app_resumes, key=lambda x: x.get('created_at', ''), reverse=True)[0]
                app['summary_text'] = latest.get('summary_text')
            else:
                app['summary_text'] = None
                
        return applicants
    except Exception as e:
        print(f"조회 에러: {e}")
        return []

# backend/api/sync.py 전체 수정
@router.put("/applicants/{applicant_id}/status")
async def update_applicant_status(applicant_id: str, request: StatusUpdateRequest):
    try:
        # 🐧 여기서 단순히 DB만 고치지 말고, 메일 발송 서비스(update_status_and_notify)를 호출해야 합니다!
        await update_status_and_notify(applicant_id, request.status)
        
        return {"message": f"상태가 {request.status}로 변경되었으며 메일이 발송되었습니다."}
    except Exception as e:
        print(f"❌ 상태 변경/메일 발송 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
# backend/api/sync.py (또는 별도 admin 라우터)

@router.post("/admin/clear-all")
async def clear_all_data(auth: AuthRequest):
    # 1. 패스코드 검증
    if not verify_passcode(str(auth.passcode)):
        raise HTTPException(status_code=401, detail="인사팀 비밀번호가 틀렸습니다.")

    # 2. 서비스 호출
    try:
        await delete_all_season_data()
        return {"message": "정상적으로 초기화되었습니다."}
    except Exception as e:
        # 에러 상세 내용을 찍어주면 디버깅이 더 편합니다.
        raise HTTPException(status_code=500, detail=f"서버 에러: {str(e)}")