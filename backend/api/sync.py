from fastapi import APIRouter, HTTPException
from core.email_worker import GmailWorker
from utils.file_helper import extract_text_from_file
from core.ai_engine import AIEngine
from database import supabase 
from prompts.resume_prompts import RESUME_ANALYSIS_PROMPT, RESUME_SUMMARY_PROMPT

router = APIRouter()

@router.post("/sync")
async def sync_gmail_resumes():
    try:
        worker = GmailWorker()
        engine = AIEngine()
        
        messages = worker.fetch_emails_with_attachments(query="지원 has:attachment")
        if not messages:
            return {"message": "새로운 지원 메일이 없습니다."}

        processed_count = 0
        for msg in messages:
            try:
                file_path, snippet = worker.get_attachment(msg['id'])
                if not file_path: continue
                
                raw_text = extract_text_from_file(file_path)
                
                # 1) JSON 파서를 사용하는 키워드 분석
                analysis_result = engine.analyze_resume(raw_text)
                
                # 2) [수정] 텍스트 파서를 사용하는 심층 요약 분석 (에러 방지)
                deep_summary = engine.get_text_completion(raw_text, RESUME_SUMMARY_PROMPT)
                
                email = f"applicant_{msg['id']}@example.com"
                
                # 지원자 저장
                existing = supabase.table("applicants").select("id").eq("email", email).execute()
                if existing.data:
                    applicant_id = existing.data[0]['id']
                else:
                    res = supabase.table("applicants").insert({
                        "name": analysis_result.get("name", "Unknown"),
                        "email": email,
                        "status": "서류 접수"
                    }).execute()
                    applicant_id = res.data[0]['id']

                # 심층 분석 결과 저장
                supabase.table("resumes").upsert({
                    "applicant_id": applicant_id,
                    "summary_text": str(deep_summary),
                    "raw_content": raw_text,
                    "file_url": "" 
                }).execute()

                # 키워드 저장
                keywords_data = analysis_result.get("keywords", [])
                if isinstance(keywords_data, list):
                    for item in keywords_data:
                        kw = item.get("keyword") if isinstance(item, dict) else item
                        cat = item.get("category", "기술") if isinstance(item, dict) else "기술"
                        if kw:
                            supabase.table("applicant_keywords").upsert({
                                "applicant_id": applicant_id, "keyword": kw.strip(), "category": cat 
                            }).execute()
                
                processed_count += 1
                print(f"--- [분석 완료] {analysis_result.get('name')} ---")
            except Exception as e:
                print(f"개별 처리 에러: {e}")
                continue

        return {"message": "동기화 완료"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/applicants")
async def get_applicants():
    try:
        apps_res = supabase.table("applicants").select("*, resumes(*)").execute()
        applicants = apps_res.data
        kw_res = supabase.table("applicant_keywords").select("*").execute()
        all_keywords = kw_res.data
        
        for app in applicants:
            app['applicant_keywords'] = [k for k in all_keywords if k['applicant_id'] == app['id']]
        return applicants
    except Exception as e:
        return []