from backend.core.email_worker import GmailWorker
from backend.utils.file_helper import extract_text_from_file

def main():
    worker = GmailWorker()
    print("메일함을 조회 중입니다...")
    
    # '지원'이라는 단어가 포함된 첨부파일 메일 찾기
    messages = worker.fetch_emails_with_attachments(query="지원 has:attachment")
    
    if not messages:
        print("조건에 맞는 메일이 없습니다.")
        return

    # 최신 메일 한 개만 처리 테스트
    msg_id = messages[0]['id']
    file_path, snippet = worker.get_attachment(msg_id)
    
    if file_path:
        print(f"파일 다운로드 완료: {file_path}")
        print(f"메일 내용 요약: {snippet}")
        
        # 텍스트 추출 확인
        text = extract_text_from_file(file_path)
        print("\n--- 추출된 텍스트 일부 ---")
        print(text[:300])
    else:
        print("첨부파일을 찾지 못했습니다.")

if __name__ == "__main__":
    main()