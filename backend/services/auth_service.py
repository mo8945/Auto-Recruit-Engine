import os
from dotenv import load_dotenv

load_dotenv()

def verify_passcode(user_input: str) -> bool:
    correct_passcode = os.getenv("ADMIN_PASSCODE")
    
    # 🔍 1. 렌더 로그창에서 직접 눈으로 확인하기 위한 출력
    print(f"👉 [프론트엔드가 보낸 값] : '{user_input}'")
    print(f"👉 [렌더가 기억하는 값] : '{correct_passcode}'")
    
    # 🚨 2. 만약 렌더가 환경변수를 아예 못 읽어왔을 경우의 방어
    if not correct_passcode:
        print("🚨 에러: 렌더 환경변수(ADMIN_PASSCODE)가 비어있거나 None입니다!")
        return False
        
    # ✨ 3. 마법의 .strip() - 양쪽의 보이지 않는 띄어쓰기/공백을 모두 파괴하고 비교
    return str(user_input).strip() == str(correct_passcode).strip()