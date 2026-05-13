# backend/services/admin_service.py
from database import supabase

async def delete_all_season_data():
    # 🐧 삭제 순서: 자식(comments, keywords, resumes) -> 부모(applicants)
    target_tables = ["comments", "applicant_keywords", "resumes", "applicants"]
    
    for table in target_tables:
        try:
            # 🐧 UUID 형식 오류를 피하기 위해 'not_.is_("id", "null")' 사용
            supabase.table(table).delete().not_.is_("id", "null").execute()
            print(f"✅ {table} 테이블 초기화 완료")
        except Exception as e:
            print(f"⚠️ {table} 처리 중 건너뜀: {e}")
            continue
            
    return True