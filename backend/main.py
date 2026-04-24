import os
import dotenv
from pathlib import Path
from fastapi import FastAPI

# 1. 환경 변수 로드 (경로를 명확하게 지정)
# 현재 파일(main.py)의 부모(backend)의 부모(루트) 폴더에 있는 .env를 찾습니다.
env_path = Path(__file__).parent.parent / ".env"
dotenv.load_dotenv(dotenv_path=env_path)

# 디버깅용 (서버 터미널에 출력됨)
print(f"--- 환경 변수 로드 체크 ---")
print(f"SUPABASE_URL: {'✅' if os.getenv('SUPABASE_URL') else '❌'}")
print(f"--------------------------")

from backend.api import sync

app = FastAPI(title="Auto-Recruit Engine API")

app.include_router(sync.router, prefix="/api", tags=["Sync"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Auto-Recruit Engine API"}