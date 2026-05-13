# backend/services/admin_service.py
from database import supabase

async def delete_all_season_data():
    try:
        # 1. 자식 데이터 (메모)부터 삭제 🐧
        supabase.table("comments").delete().neq("id", "0").execute()
        
        # 2. 기타 연결된 데이터 삭제
        supabase.table("applicant_keywords").delete().neq("id", "0").execute()
        supabase.table("resumes").delete().neq("id", "0").execute()
        
        # 3. 마지막으로 부모(지원자) 삭제
        supabase.table("applicants").delete().neq("id", "0").execute()
        
        return True
    except Exception as e:
        print(f"❌ 데이터 삭제 실패: {e}")
        raise e