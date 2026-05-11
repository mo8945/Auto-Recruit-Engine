import os
from supabase import create_client
from dotenv import load_dotenv

# main.py에서 로드하지만, 혹시 모르니 한 번 더 로드 (경로 명시)
load_dotenv()

# 환경변수 읽기 (반드시 VITE_ 접두사 포함)
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

if not url or not key:
    raise ValueError("Supabase URL 또는 Key가 설정되지 않았습니다. .env 파일을 확인해주세요!")

# Supabase 클라이언트 생성
supabase = create_client(url, key)