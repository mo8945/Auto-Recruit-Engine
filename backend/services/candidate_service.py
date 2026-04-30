# services/candidate_service.py
from database import supabase

def get_or_create_applicant(name, email):
    # 1. 먼저 이메일로 검색
    existing = supabase.table("applicants").select("id").eq("email", email).execute()
    
    if existing.data and len(existing.data) > 0:
        return existing.data[0]['id']
    
    # 2. 없으면 생성 (Upsert를 사용하면 레이스 컨디션 방지에 유리합니다)
    res = supabase.table("applicants").upsert({
        "name": name,
        "email": email,
        "status": "서류 접수"
    }, on_conflict="email").execute()
    
    return res.data[0]['id']