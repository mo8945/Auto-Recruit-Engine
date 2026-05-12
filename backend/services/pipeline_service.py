# services/pipeline_service.py

from core.ai_engine import AIEngine
from core.email_worker import GmailWorker
from utils.file_helper import extract_text_from_file
from prompts.resume_prompts import RESUME_SUMMARY_PROMPT
from services.candidate_service import get_or_create_applicant
from services.resume_service import save_resume_data
from database import supabase

async def run_resume_pipeline(msg_id: str, worker: GmailWorker, engine: AIEngine):
    try:
        # 1. 중복 체크
        existing = supabase.table("resumes").select("id").eq("gmail_msg_id", msg_id).execute()
        if existing.data: 
            print(f"⏩ 이미 처리된 메일입니다: {msg_id}")
            return False

        # 2. 모든 첨부파일 가져오기
        file_paths, snippet, real_email = worker.get_message_details(msg_id)
        if not file_paths: return False
        
        applicant_email = real_email or f"unknown_{msg_id[:8]}@gmail.com"
        success_count = 0

        # 3. 파일별 반복 처리
        for path in file_paths:
            raw_text = extract_text_from_file(path)
            if not raw_text.strip(): continue
            
            # AI 분석 및 심층 요약 생성
            analysis_result = engine.analyze_resume(raw_text)
            deep_summary = engine.get_text_completion(raw_text, RESUME_SUMMARY_PROMPT)
            
            # 지원자 생성/조회 (이름 추출)
            name = analysis_result.get("name", "Unknown")
            app_id = get_or_create_applicant(name, applicant_email)
            
            # 키워드 데이터 추출
            keywords = analysis_result.get("keywords", [])
            
            # 💡 [핵심 수정] resume_service.py와 100% 동일하게 5개의 인자를 순서대로 넘깁니다!
            save_resume_data(
                app_id,         # 1. applicant_id
                msg_id,         # 2. gmail_msg_id
                raw_text,       # 3. raw_content
                deep_summary,   # 4. summary_text
                analysis_result.get("keywords", [])        # 5. keywords
            )
            
            success_count += 1
            
        return success_count > 0
    except Exception as e:
        print(f"❌ Pipeline Error: {e}")
        raise e