import os
import base64
import re
import json
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
]

class GmailWorker:
    def __init__(self):
        self.creds = self._authenticate()
        self.service = build('gmail', 'v1', credentials=self.creds)

    def _authenticate(self):
        creds = None
        # 1. 렌더 환경 변수 확인 (이름을 두 가지 다 확인해봅니다)
        token_json = os.environ.get('GOOGLE_TOKEN_JSON')
        
        # 🔍 디버깅 로그 추가
        print(f"👉 [디버그] GOOGLE_TOKEN_JSON 읽기 시도: {'성공' if token_json else '실패(None)'}", flush=True)
        
        if token_json:
            try:
                token_data = json.loads(token_json)
                creds = Credentials.from_authorized_user_info(token_data, SCOPES)
                print("✅ 환경 변수로부터 토큰 로드 완료", flush=True)
            except Exception as e:
                print(f"❌ 환경 변수 토큰 파싱 에러: {e}", flush=True)
        
        # 2. 로컬 파일 확인
        elif os.path.exists('token.json'):
            print("👉 [디버그] 로컬 token.json 파일 발견!", flush=True)
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)

        # 3. 인증 만료 처리
        if not creds or not creds.valid:
            print("👉 [디버그] 인증이 없거나 만료됨. 갱신 시도 중...", flush=True)
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                    print("✅ 토큰 갱신 성공!", flush=True)
                except Exception as e:
                    print(f"❌ 토큰 갱신 실패: {e}", flush=True)
            else:
                print("🚨 갱신 불가: 새로운 로그인이 필요합니다.", flush=True)
                # 배포 환경에서는 여기서 멈추게 됨
                if not os.getenv('RENDER'): # 로컬일 때만 브라우저 실행
                    flow = InstalledAppFlow.from_client_secrets_file('backend/credentials.json', SCOPES)
                    creds = flow.run_local_server(port=0)
        
        return creds

    def fetch_emails_with_attachments(self, query):
        results = self.service.users().messages().list(userId='me', q=query).execute()
        messages = results.get('messages', [])
        return messages

    def get_message_details(self, msg_id, save_dir='attachments'):
        message = self.service.users().messages().get(userId='me', id=msg_id).execute()
        payload = message.get('payload', {})
        headers = payload.get('headers', [])
        
        from_email = ""
        for header in headers:
            if header.get('name') == 'From':
                from_email = header.get('value')
                break

        parts = payload.get('parts', [])
        file_paths = []

        if not os.path.exists(save_dir):
            os.makedirs(save_dir)

        def walk_parts(parts):
            for part in parts:
                if part.get('filename') and part.get('body', {}).get('attachmentId'):
                    att_id = part['body']['attachmentId']
                    attachment = self.service.users().messages().attachments().get(
                        userId='me', messageId=msg_id, id=att_id).execute()
                    
                    data = base64.urlsafe_b64decode(attachment['data'].encode('UTF-8'))
                    file_path = os.path.join(save_dir, part['filename'])
                    
                    with open(file_path, 'wb') as f:
                        f.write(data)
                    file_paths.append(file_path)
                
                if 'parts' in part:
                    walk_parts(part['parts'])

        walk_parts(parts)
        return file_paths, message.get('snippet', ''), from_email

    def send_status_email(self, receiver, subject, body):
        try:
            message = MIMEText(body)
            message['to'] = receiver
            message['subject'] = subject
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            self.service.users().messages().send(userId='me', body={'raw': raw_message}).execute()
            print(f"✅ 메일 발송 완료: {receiver}")
        except Exception as e:
            print(f"❌ 메일 발송 에러: {e}")

if __name__ == "__main__":
    print("🚀 Gmail 인증 프로세스를 시작합니다...")
    try:
        # 이 객체가 생성될 때 자동으로 _authenticate()가 호출됩니다.
        worker = GmailWorker()
        print("\n✅ 인증 성공! 이제 폴더에 생성된 'token.json'을 확인하세요.")
        print("💡 이 파일의 내용을 복사해서 Render의 GOOGLE_TOKEN_JSON 환경 변수에 넣어주세요!")
    except Exception as e:
        print(f"\n❌ 인증 중 에러 발생: {e}")
        print("💡 credentials.json 파일이 현재 폴더에 있는지 확인해 주세요.")