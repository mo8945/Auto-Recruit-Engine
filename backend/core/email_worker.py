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
        
        # 1. 환경 변수에서 토큰 정보를 가져옵니다 (Render 배포용)
        token_json = os.getenv('GOOGLE_TOKEN_JSON')
        
        if token_json:
            # 환경 변수에 저장된 JSON 문자열을 로드하여 자격 증명 생성
            token_data = json.loads(token_json)
            creds = Credentials.from_authorized_user_info(token_data, SCOPES)
        
        # 2. 로컬 테스트용 (환경 변수가 없을 때 기존 token.json 확인)
        elif os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)

        # 3. 인증이 만료되었거나 없을 경우 갱신/신규 인증
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                # 클라우드에서는 브라우저 인증이 불가하므로 로컬에서 만든 token.json을 활용해야 함
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            
            # 새로 생성된 토큰 저장 (로컬용)
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
                
        return creds

    def fetch_emails_with_attachments(self, query="has:attachment"):
        """받은 편지함에서 첨부파일이 있는 메일을 가져옵니다."""
        try:
            results = self.service.users().messages().list(userId='me', q=query).execute()
            messages = results.get('messages', [])
            return messages
        except Exception as error:
            print(f'An error occurred: {error}')
            return []

    def get_message_details(self, msg_id, save_dir='temp_attachments'):
        """메시지 ID로 상세 내용과 첨부파일을 가져옵니다."""
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)

        message = self.service.users().messages().get(userId='me', id=msg_id).execute()
        payload = message.get('payload', {})
        headers = payload.get('headers', [])
        
        from_email = ""
        for header in headers:
            if header['name'] == 'From':
                from_email = header['value']
                break

        parts = payload.get('parts', [])
        file_paths = []

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
            print(f"✅ 메일 발송 성공: {receiver}")
        except Exception as error:
            print(f"❌ 메일 발송 실패: {error}")