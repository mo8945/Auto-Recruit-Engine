import os.path
import base64
import re
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# [중요] 발송 권한(send)을 추가했습니다. 기존 token.json 삭제 필수!
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
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        return creds

    def fetch_emails_with_attachments(self, query="has:attachment"):
        """받은 편지함에서 첨부파일이 있는 새 메일을 가져옵니다."""
        final_query = f"{query} label:inbox -in:trash -in:spam"
        results = self.service.users().messages().list(userId='me', q=final_query).execute()
        messages = results.get('messages', [])
        return messages

    def get_attachment(self, msg_id, save_dir="data/"):
        """메일에서 첨부파일을 추출하여 저장합니다."""
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)

        message = self.service.users().messages().get(userId='me', id=msg_id).execute()
        payload = message.get('payload', {})
        headers = payload.get('headers', [])
        
        from_email = ""
        for header in headers:
            if header.get('name') == 'From':
                from_value = header.get('value')
                email_match = re.search(r'([a-zA-Z0-9\._+]+@[a-zA-Z0-9\._-]+\.[a-zA-Z0-9\._-]+)', from_value)
                if email_match:
                    from_email = email_match.group(1)
                break

        parts = payload.get('parts', [])
        for part in parts:
            if part.get('filename') and part.get('body', {}).get('attachmentId'):
                att_id = part['body']['attachmentId']
                attachment = self.service.users().messages().attachments().get(
                    userId='me', messageId=msg_id, id=att_id).execute()
                
                data = base64.urlsafe_b64decode(attachment['data'].encode('UTF-8'))
                file_path = os.path.join(save_dir, part['filename'])
                
                with open(file_path, 'wb') as f:
                    f.write(data)
                return file_path, message.get('snippet', ''), from_email
        return None, None, from_email

    def send_status_email(self, receiver, subject, body):
        """안내 메일을 발송합니다."""
        try:
            message = MIMEText(body)
            message['to'] = receiver
            message['subject'] = subject
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            self.service.users().messages().send(userId='me', body={'raw': raw_message}).execute()
            print(f"✅ 메일 발송 성공: {receiver}")
            return True
        except Exception as e:
            print(f"❌ 메일 발송 실패: {e}")
            return False