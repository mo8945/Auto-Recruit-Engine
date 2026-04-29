# api/sync.py
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
                
                # AI 분석 실행
                analysis_result = engine.analyze_resume(raw_text)
                deep_summary = engine.get_text_completion(raw_text, RESUME_SUMMARY_PROMPT)
                
                print(f"--- [AI 분석 완료] {analysis_result.get('name')} ---")
                email = f"applicant_{msg['id']}@example.com"
                
                # 1. 지원자 저장 및 ID 확보
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

                # 2. [수정 포인트] resumes 테이블 upsert
                # on_conflict를 지정하여 중복 에러(23505)를 방지하고 내용을 업데이트합니다.
                supabase.table("resumes").upsert({
                    "applicant_id": applicant_id,
                    "summary_text": str(deep_summary),
                    "raw_content": raw_text,
                    "file_url": "" 
                }, on_conflict="applicant_id").execute() # applicant_id가 겹치면 업데이트하라!
                print(f"이력서 요약 저장 성공!")

                # 3. applicant_keywords 테이블 저장
                keywords_data = analysis_result.get("keywords", [])
                if isinstance(keywords_data, list):
                    for item in keywords_data:
                        kw = item.get("keyword") if isinstance(item, dict) else item
                        cat = item.get("category", "기술") if isinstance(item, dict) else "기술"
                        
                        if kw:
                            # 키워드도 중복 방지를 위해 upsert (필요시 on_conflict 추가)
                            supabase.table("applicant_keywords").upsert({
                                "applicant_id": applicant_id,
                                "keyword": kw.strip(),
                                "category": cat 
                            }).execute()
                    print(f"핵심 역량 저장 완료!")

                processed_count += 1
            
            except Exception as e:
                # 여기서 에러가 나면 다음 지원자로 넘어가버립니다.
                print(f"개별 지원자 처리 중 오류 발생: {e}")
                continue

        return {"message": f"성공적으로 {processed_count}건의 데이터를 동기화했습니다."}
    
    except Exception as e:
        print(f"Error during sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/applicants")
async def get_applicants():
    try:
        # 1. 지원자 기본 정보 가져오기
        apps_res = supabase.table("applicants").select("*").execute()
        applicants = apps_res.data
        
        # 2. 이력서 요약(resumes) 정보 통째로 가져오기
        res_data_res = supabase.table("resumes").select("*").execute()
        all_resumes = res_data_res.data
        
        # 3. 키워드 정보 통째로 가져오기
        kw_res = supabase.table("applicant_keywords").select("*").execute()
        all_keywords = kw_res.data
        
        # 4. 파이썬에서 직접 매칭시켜주기 (핵심!)
        for app in applicants:
            # 해당 지원자의 이력서 요약 찾아서 넣어주기
            app['resumes'] = [r for r in all_resumes if r['applicant_id'] == app['id']]
            
            # 해당 지원자의 키워드 찾아서 넣어주기
            app['applicant_keywords'] = [k for k in all_keywords if k['applicant_id'] == app['id']]
                
        return applicants
    except Exception as e:
        print(f"조회 에러: {e}")
        return []