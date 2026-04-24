import os.path
import base64
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

class GmailWorker:
    def __init__(self):
        self.creds = self._authenticate()
        self.service = build('gmail', 'v1', credentials=self.creds)

    def _authenticate(self):
        """Google OAuth2 인증 및 token.json 관리"""
        creds = None
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                # credentials.json 경로를 확인하세요 (현재 backend 폴더 안)
                flow = InstalledAppFlow.from_client_secrets_file(
                    'backend/credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        return creds

    def fetch_emails_with_attachments(self, query="has:attachment"):
        """첨부파일이 있는 메일 리스트 조회 (에러 발생했던 함수)"""
        results = self.service.users().messages().list(userId='me', q=query).execute()
        return results.get('messages', [])

    def get_attachment(self, msg_id, save_dir="backend/data/"):
        """특정 메일에서 첫 번째 첨부파일 추출 및 저장"""
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)

        message = self.service.users().messages().get(userId='me', id=msg_id).execute()
        parts = message.get('payload', {}).get('parts', [])
        
        for part in parts:
            if part.get('filename') and part.get('body', {}).get('attachmentId'):
                att_id = part['body']['attachmentId']
                attachment = self.service.users().messages().attachments().get(
                    userId='me', messageId=msg_id, id=att_id).execute()
                
                data = base64.urlsafe_b64decode(attachment['data'].encode('UTF-8'))
                file_path = os.path.join(save_dir, part['filename'])
                
                with open(file_path, 'wb') as f:
                    f.write(data)
                return file_path, message.get('snippet', '')
        return None, None