from fastapi import APIRouter, HTTPException

from backend.core.email_worker import GmailWorker
from backend.utils.file_helper import extract_text_from_file
from backend.core.ai_engine import AIEngine
from backend.utils.supabase_helper import SupabaseHelper
router = APIRouter()

@router.post("/sync-gmail")
async def sync_gmail_resumes():
    try:
        worker = GmailWorker()
        engine = AIEngine()
        db_helper = SupabaseHelper()
        
        # 1. 메일 수집 (키워드: '지원')
        messages = worker.fetch_emails_with_attachments(query="지원 has:attachment")
        if not messages:
            return {"message": "새로운 지원 메일이 없습니다."}

        processed_count = 0
        for msg in messages:
            # 2. 파일 다운로드 및 텍스트 추출
            file_path, snippet = worker.get_attachment(msg['id'])
            if not file_path: continue
            
            raw_text = extract_text_from_file(file_path)
            
            # 3. AI 분석
            analysis_result = engine.analyze_resume(raw_text)
            
            # 4. DB 저장 (테스트용 이메일 대신 실제 Snippet이나 더미 이메일 활용 가능)
            # 여기서는 편의상 snippet에서 이메일 형식을 찾아보거나 임시 이메일을 넣습니다.
            db_helper.save_applicant_data(analysis_result, f"applicant_{msg['id']}@example.com")
            processed_count += 1

        return {"message": f"성공적으로 {processed_count}개의 이력서를 분석하고 저장했습니다."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/applicants")
async def get_applicants():
    try:
        db_helper = SupabaseHelper()
        data = db_helper.get_applicants()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))