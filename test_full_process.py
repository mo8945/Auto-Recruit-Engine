from backend.core.email_worker import GmailWorker
from backend.utils.file_helper import extract_text_from_file
from backend.core.ai_engine import AIEngine
import dotenv
from backend.utils.supabase_helper import SupabaseHelper
import os
from pathlib import Path

env_path = Path(__file__).parent / ".env"
dotenv.load_dotenv(dotenv_path=env_path)
print(f"DEBUG: URL={os.getenv('SUPABASE_URL')}")

def main():
    worker = GmailWorker()
    engine = AIEngine()
    
    print("1. 메일 수집 중...")
    messages = worker.fetch_emails_with_attachments(query="지원 has:attachment")
    
    if not messages:
        print("분석할 메일이 없습니다.")
        return

    # 첫 번째 메일 처리
    file_path, _ = worker.get_attachment(messages[0]['id'])
    
    print(f"2. 파일 추출 완료: {file_path}")
    raw_text = extract_text_from_file(file_path)
    
    print("3. AI 분석 엔진 가동 (GPT-4o)...")
    analysis_result = engine.analyze_resume(raw_text)
    
    # 4. Supabase 저장
    print("4. Supabase DB에 저장 중...")
    db_helper = SupabaseHelper()
    # 테스트용 이메일 주소 사용
    applicant_id = db_helper.save_applicant_data(analysis_result, "test_user@example.com")
    
    print(f"\n✅ 모든 과정 완료! 생성된 지원자 ID: {applicant_id}")
    
    print("\n--- [최종 분석 결과] ---")
    import json
    print(json.dumps(analysis_result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()