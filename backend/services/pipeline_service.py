# services/pipeline_service.py
from core.ai_engine import AIEngine
from core.email_worker import GmailWorker
from utils.file_helper import extract_text_from_file
from prompts.resume_prompts import RESUME_SUMMARY_PROMPT
from services.candidate_service import get_or_create_applicant
from services.resume_service import save_resume_data
from database import supabase

# 파라미터에 worker와 engine을 추가합니다.
async def run_resume_pipeline(msg_id: str, worker, engine):
    try:
        # 1. 중복 체크
        existing = supabase.table("resumes").select("id").eq("gmail_msg_id", msg_id).execute()
        if existing.data: return False

        # [삭제] 여기서 새로 생성하던 코드를 지웁니다.
        # worker = GmailWorker() -> X
        # engine = AIEngine()    -> X

        # 2. 메일 및 파일 처리 (넘겨받은 worker 사용)
        file_path, snippet, real_email = worker.get_attachment(msg_id)
        if not file_path: return False
        
        raw_text = extract_text_from_file(file_path)
        
        # [중요] AI 엔진 호출 (동기 함수라면 그대로, 비동기라면 await 필요)
        # 현재 ai_engine.py 구조상 동기 함수이므로 그대로 두되, 예외 처리를 강화합니다.
        analysis_result = engine.analyze_resume(raw_text)
        deep_summary = engine.get_text_completion(raw_text, RESUME_SUMMARY_PROMPT)
        
        # 3. 지원자 및 이력서 저장
        applicant_email = real_email or f"unknown_{msg_id[:8]}@gmail.com"
        app_id = get_or_create_applicant(
            analysis_result.get("name", "Unknown"),
            applicant_email
        )
        
        save_resume_data(
            app_id, msg_id, raw_text, deep_summary, 
            analysis_result.get("keywords", [])
        )
        return True
    except Exception as e:
        print(f"❌ Pipeline Error for {msg_id}: {e}")
        raise e # 상위 sync.py로 에러 전달