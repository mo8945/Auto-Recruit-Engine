import os
from supabase import create_client
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경변수 읽기
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# Supabase 클라이언트 생성 (이제 이 객체를 다른 곳에서 불러다 씁니다)
supabase = create_client(url, key)