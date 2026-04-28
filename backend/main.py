import os
from pathlib import Path
import dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. 환경 변수 로드 (가장 먼저 실행되어야 합니다)
env_path = Path(__file__).parent.parent / ".env"
dotenv.load_dotenv(dotenv_path=env_path)

# 디버깅용 출력
print(f"--- 환경 변수 로드 체크 ---")
print(f"SUPABASE_URL: {'✅' if os.getenv('SUPABASE_URL') else '❌'}")
print(f"--------------------------")

# 2. 라우터 임포트 (환경 변수 로드 후에 가져와야 database.py가 정상 작동합니다)
from routes import applicants
from api import sync

app = FastAPI(title="Auto-Recruit Engine API")

# 3. CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. 라우터 등록
# 메일 동기화 관련 API
app.include_router(sync.router, prefix="/api", tags=["Sync"])
# 지원자 관리(상태 변경 등) 관련 API
app.include_router(applicants.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Auto-Recruit Engine API"}