from fastapi import APIRouter, HTTPException
from core.email_worker import GmailWorker
from utils.file_helper import extract_text_from_file
from core.ai_engine import AIEngine
from database import supabase 

router = APIRouter()

# 1. Gmail 동기화 및 AI 분석 API
@router.post("/sync")
async def sync_gmail_resumes():
    try:
        worker = GmailWorker()
        engine = AIEngine()
        
        # 메일 수집 (첨부파일이 있는 메일)
        messages = worker.fetch_emails_with_attachments(query="지원 has:attachment")
        if not messages:
            return {"message": "새로운 지원 메일이 없습니다."}

        processed_count = 0
        for msg in messages:
            # 파일 다운로드 및 텍스트 추출
            file_path, snippet = worker.get_attachment(msg['id'])
            if not file_path: continue
            
            raw_text = extract_text_from_file(file_path)
            analysis_result = engine.analyze_resume(raw_text)
            
            # 이메일 주소 생성 (실제 메일 주소 추출 로직이 없다면 ID 기반 임시 주소 사용)
            email = f"applicant_{msg['id']}@example.com"
            
            try:
                # [중요] 중복 체크: 이미 존재하는 이메일인지 확인
                existing = supabase.table("applicants").select("id").eq("email", email).execute()
                
                if not existing.data:
                    # 1) applicants 테이블 저장
                    res = supabase.table("applicants").insert({
                        "name": analysis_result.get("name", "Unknown"),
                        "email": email,
                        "status": "서류 접수"
                    }).execute()
                    
                    if res.data:
                        applicant_id = res.data[0]['id']
                        # 2) resumes 테이블(AI 분석 결과) 저장
                        supabase.table("resumes").insert({
                            "applicant_id": applicant_id,
                            "summary_text": analysis_result.get("summary", ""),
                            "raw_content": raw_text
                        }).execute()
                    
                    processed_count += 1
                else:
                    print(f"이미 처리된 지원자입니다: {email}")
            
            except Exception as db_e:
                print(f"DB 개별 저장 중 오류 발생 (건너뜀): {db_e}")
                continue

        return {"message": f"성공적으로 {processed_count}개의 새로운 이력서를 분석하고 저장했습니다."}
    
    except Exception as e:
        print(f"Error during sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 2. 지원자 목록 조회 API
@router.get("/applicants")
async def get_applicants():
    try:
        # DB에서 지원자 정보와 이력서 분석 정보(resumes)를 함께 가져옵니다.
        response = supabase.table("applicants").select("*, resumes(*)").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching applicants: {e}")
        raise HTTPException(status_code=500, detail=str(e))