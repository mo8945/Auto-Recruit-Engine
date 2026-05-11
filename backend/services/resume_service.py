# services/resume_service.py
from database import supabase

def save_resume_data(app_id, msg_id, raw_text, deep_summary, keywords):
    """분석된 데이터를 DB에 최종 저장"""
    try:
        # 1. 이력서 요약 저장 (gmail_msg_id 기준으로 중복 체크)
        # on_conflict를 gmail_msg_id로 설정해야 데이터가 덮어씌워지거나 에러 없이 저장됩니다.
        supabase.table("resumes").upsert({
            "applicant_id": app_id,
            "summary_text": str(deep_summary),
            "raw_content": raw_text,
            "gmail_msg_id": msg_id,
            "file_url": ""  # NOT NULL 제약 조건 방지
        }, on_conflict="gmail_msg_id").execute()

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
                    }, on_conflict="applicant_id,keyword").execute()
                    
        print(f"✅ DB 저장 완료: 지원자 ID {app_id}")
    except Exception as e:
        print(f"❌ DB 저장 실패: {e}")
        raise e