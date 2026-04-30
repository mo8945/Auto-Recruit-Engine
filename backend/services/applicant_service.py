# services/applicant_service.py (수정 버전)
from database import supabase
from core.email_worker import GmailWorker
from prompts.email_templates import INTERVIEW_PROMPT, REJECTION_PROMPT, SUCCESS_PROMPT # SUCCESS 추가

async def update_status_and_notify(applicant_id: str, new_status: str):
    # 1. 지원자 정보 조회
    app_res = supabase.table("applicants").select("email, name").eq("id", applicant_id).single().execute()
    applicant = app_res.data
    
    # 2. DB 상태 업데이트
    supabase.table("applicants").update({"status": new_status}).eq("id", applicant_id).execute()
    
    # 3. 메일 발송 로직
    worker = GmailWorker()
    subject = f"[채용담당자] {applicant['name']}님, 최종 합격 및 입사 전형 결과 안내드립니다."
    body = ""

    # 상태별 템플릿 매칭
    if new_status == "면접 예정":
        body = INTERVIEW_PROMPT.format(name=applicant['name'])
    elif new_status == "불합격":
        body = REJECTION_PROMPT.format(name=applicant['name'])
    elif new_status == "최종 합격": # 합격 로직 추가
        body = SUCCESS_PROMPT.format(name=applicant['name'])

    # 4. 템플릿이 정의된 상태라면 메일 발송[cite: 8]
    if body:
        print(f"📧 {applicant['email']}로 메일 발송 시도 중...")
        success = worker.send_status_email(applicant['email'], subject, body)
        if success:
            print("✅ 메일 발송 성공!")
        else:
            print("❌ 메일 발송 실패 (Worker 에러)")
    return True