import os
from pathlib import Path
import dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. 환경 변수 로드 (backend 폴더 내의 .env를 읽도록 수정)
# .parent가 하나만 있어야 backend/.env를 가리킵니다.
env_path = Path(__file__).parent / ".env"
dotenv.load_dotenv(dotenv_path=env_path)

# 디버깅용 출력 (VITE_ 버전으로 확인)
print(f"--- 환경 변수 로드 체크 ---")
print(f"SUPABASE_URL: {'✅' if os.getenv('VITE_SUPABASE_URL') else '❌'}")
print(f"--------------------------")

# 2. 라우터 임포트
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

app.include_router(sync.router, prefix="/api", tags=["Sync"])
app.include_router(applicants.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Auto-Recruit Engine API"}
#최종수정완료.