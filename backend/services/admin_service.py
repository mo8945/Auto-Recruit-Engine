# backend/services/admin_service.py
from database import supabase

async def delete_all_season_data():
    """
    공채 시즌 데이터를 참조 무결성 순서에 맞춰 삭제합니다.
    UUID 타입 에러를 피하기 위해 is.not.null 방식을 사용합니다.
    """
    try:
        # 1. 지원자 키워드 삭제
        # .neq("id", "-1") 대신 .not_.is_("id", "null") 사용
        supabase.table("applicant_keywords").delete().not_.is_("id", "null").execute()
        
        # 2. 이력서 및 AI 분석 결과 삭제
        supabase.table("resumes").delete().not_.is_("id", "null").execute()
        
        # 3. 지원자 기본 정보 삭제
        supabase.table("applicants").delete().not_.is_("id", "null").execute()
        
        print("✅ [AdminService] 모든 시즌 데이터 삭제 완료")
        return True
    except Exception as e:
        print(f"❌ [AdminService] 데이터 초기화 중 오류 발생: {e}")
        raise e