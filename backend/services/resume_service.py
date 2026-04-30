# services/resume_service.py
from database import supabase

def save_resume_data(app_id, msg_id, raw_text, deep_summary, keywords):
    """분석된 데이터를 DB에 최종 저장"""
    # 1. 이력서 요약 저장
    supabase.table("resumes").upsert({
        "applicant_id": app_id,
        "summary_text": str(deep_summary),
        "raw_content": raw_text,
        "gmail_msg_id": msg_id,
        "file_url": ""  # [수정] NOT NULL 제약 조건을 피하기 위해 빈 문자열 추가
    }, on_conflict="applicant_id").execute()

    # 2. 키워드 저장
    if isinstance(keywords, list):
        for item in keywords:
            kw = item.get("keyword") if isinstance(item, dict) else item
            cat = item.get("category", "기술") if isinstance(item, dict) else "기술"
            if kw:
                supabase.table("applicant_keywords").upsert({
                    "applicant_id": app_id, 
                    "keyword": kw.strip(), 
                    "category": cat 
                }).execute()