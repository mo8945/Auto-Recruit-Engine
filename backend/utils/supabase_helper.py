import os
from supabase import create_client, Client

class SupabaseHelper:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        self.supabase: Client = create_client(url, key)

    def save_applicant_data(self, analysis_result: dict, email: str):
        """AI 분석 결과와 지원자 정보를 DB에 저장"""
        
        # 1. 지원자 기본 정보 저장 (applicants 테이블)
        applicant_data = {
            "name": analysis_result.get("name"),
            "email": email,
            "status": "New"
        }
        # upsert를 사용하여 이미 존재하는 이메일이면 업데이트, 없으면 생성
        response = self.supabase.table("applicants").upsert(applicant_data, on_conflict="email").execute()
        applicant_id = response.data[0]['id']

        # 2. 키워드/기술스택 저장 (applicant_keywords 테이블)
        # 기존 키워드 삭제 후 재삽입 (동기화 기준)
        self.supabase.table("applicant_keywords").delete().eq("applicant_id", applicant_id).execute()
        
        keywords_to_insert = []
        # 기술 스택 추가
        for tech in analysis_result.get("tech_stack", []):
            keywords_to_insert.append({
                "applicant_id": applicant_id,
                "category": "TechStack",
                "keyword": tech
            })
        # 주요 역량 추가
        for kw in analysis_result.get("keywords", []):
            keywords_to_insert.append({
                "applicant_id": applicant_id,
                "category": "SoftSkill",
                "keyword": kw
            })
        
        if keywords_to_insert:
            self.supabase.table("applicant_keywords").insert(keywords_to_insert).execute()

        # 3. 요약 정보 저장 (resumes 테이블)
        resume_data = {
            "applicant_id": applicant_id,
            "summary_text": analysis_result.get("summary"),
            "file_url": f"temp_path/{analysis_result.get('name')}_resume.pdf" # 우선 임시 경로
        }
        self.supabase.table("resumes").upsert(resume_data, on_conflict="applicant_id").execute()

        return applicant_id
    
    def get_applicants(self):
        """DB에서 지원자 목록과 최신 이력서 요약을 가져옵니다."""
        # applicants 테이블과 resumes 테이블을 조인하여 가져옵니다.
        response = self.supabase.table("applicants") \
            .select("*, resumes(summary_text, file_url)") \
            .order("created_at", desc=True) \
            .execute()
        return response.data