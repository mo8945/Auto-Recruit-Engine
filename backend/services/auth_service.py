import os
from dotenv import load_dotenv

load_dotenv()

def verify_passcode(user_input: str) -> bool:
    """사용자가 입력한 번호가 설정된 패스코드와 일치하는지 확인"""
    # .env에 저장된 정답 번호를 가져옴
    correct_passcode = os.getenv("ADMIN_PASSCODE")
    return user_input == correct_passcode