import os
import logging
from dotenv import load_dotenv

# 로그 설정 (서버 터미널에 더 잘 찍히게 함)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if os.path.exists(".env"):
    load_dotenv()

def verify_passcode(user_input: str) -> bool:
    correct_passcode = os.environ.get("ADMIN_PASSCODE")
    
    # 🐧 [강력 추천] flush=True를 쓰면 버퍼링 없이 즉시 로그에 찍힙니다.
    print(f"👉 [프론트엔드 입력값]: '{user_input}'", flush=True)
    print(f"👉 [서버 저장 정답]: '{correct_passcode}'", flush=True)
    
    # 로깅 모듈도 같이 사용 (렌더에서 더 잘 보일 수 있음)
    logger.info(f"Passcode Verification - Input: {user_input}, Target: {correct_passcode}")

    if not correct_passcode:
        return False
        
    return str(user_input).strip() == str(correct_passcode).strip()