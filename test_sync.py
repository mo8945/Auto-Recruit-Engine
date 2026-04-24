from backend.core.email_worker import GmailWorker
from backend.utils.file_helper import extract_text_from_file
import os

# 1. Gmail에서 파일 다운로드 (이 부분은 OAuth 인증 완료 후 실제 service 객체 필요)
# worker = GmailWorker()
# downloaded_files = worker.download_attachment(service, "MESSAGE_ID")

# 2. 다운로드된 파일로 텍스트 추출 테스트 (수동 테스트용)
test_file = "backend/data/resume_test.pdf" # 본인의 테스트용 PDF를 이 경로에 넣어주세요

if os.path.exists(test_file):
    print(f"--- {test_file} 분석 시작 ---")
    extracted_text = extract_text_from_file(test_file)
    print(extracted_text[:500]) # 앞부분 500자만 출력
    print("\n--- 텍스트 추출 성공 ---")
else:
    print("테스트할 파일이 backend/data 폴더에 없습니다.")