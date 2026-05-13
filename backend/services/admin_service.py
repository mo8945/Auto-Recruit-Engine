# backend/services/admin_service.py
from database import supabase

async def delete_all_season_data():
    # 지워야 할 테이블 목록 (자식부터 부모 순서로!)
    target_tables = ["comments", "applicant_keywords", "resumes", "applicants"]
    
    for table in target_tables:
        try:
            # 🐧 neq("id", "0") 방식으로 '있으면 다 지워라' 실행
            supabase.table(table).delete().neq("id", "0").execute()
            print(f"✅ {table} 테이블 초기화 완료")
        except Exception as e:
            # 🐧 핵심: 테이블이 비어있어서 에러가 나더라도 무시하고 다음 테이블로!
            print(f"⚠️ {table} 처리 중 건너뜀 (데이터가 없거나 이미 삭제됨): {e}")
            continue
            
    return True
