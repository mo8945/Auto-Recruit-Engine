import os
import base64
import re
import json
import logging
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# 1. 로그 설정 (Render 실시간 로그 최적화)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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
        # 2. 렌더 환경 변수 확인
        token_json = os.environ.get('GOOGLE_TOKEN_JSON')
        
        logger.info("🔍 [수사망] GOOGLE_TOKEN_JSON 환경 변수 읽기 시도 중...")
        
        if token_json:
            try:
                # 환경 변수에 저장된 JSON 문자열을 로드
                token_data = json.loads(token_json)
                creds = Credentials.from_authorized_user_info(token_data, SCOPES)
                logger.info("✅ [성공] Render 환경 변수로부터 토큰을 로드했습니다.")
            except Exception as e:
                logger.error(f"❌ [실패] 환경 변수 토큰 파싱 중 에러 발생: {e}")
        else:
            logger.warning("🚨 [경고] GOOGLE_TOKEN_JSON이 None입니다. Render 설정을 확인하세요!")
        
        # 3. 로컬 테스트용 (환경 변수가 없을 때만 작동)
        if not creds and os.path.exists('token.json'):
            logger.info("👉 [정보] 로컬 token.json 파일을 발견하여 로드합니다.")
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)

        # 4. 인증이 만료되었거나 없을 때 처리
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    logger.info("🔄 [갱신] 토큰이 만료되어 Refresh Token으로 갱신을 시도합니다...")
                    creds.refresh(Request())
                    logger.info("✅ [완료] 토큰 갱신 성공!")
                except Exception as e:
                    logger.error(f"❌ [에러] 토큰 갱신 실패: {e}")
            else:
                logger.error("🚨 [치명적] 유효한 토큰이 없고 갱신도 불가능합니다. 수동 로그인이 필요합니다.")
                # Render 서버 환경이 아닐 때만 브라우저 로그인 실행
                if not os.environ.get('RENDER'):
                    logger.info("🌐 로컬 브라우저 인증을 시작합니다...")
                    flow = InstalledAppFlow.from_client_secrets_file('backend/credentials.json', SCOPES)
                    creds = flow.run_local_server(port=0)
                    with open('token.json', 'w') as token:
                        token.write(creds.to_json())
        
        return creds

    def fetch_emails_with_attachments(self, query):
        try:
            results = self.service.users().messages().list(userId='me', q=query).execute()
            messages = results.get('messages', [])
            return messages
        except Exception as e:
            logger.error(f"❌ 이메일 목록 가져오기 실패: {e}")
            return []

    def get_message_details(self, msg_id, save_dir='attachments'):
        message = self.service.users().messages().get(userId='me', id=msg_id).execute()
        payload = message.get('payload', {})
        headers = payload.get('headers', [])
        
        from_email = ""
        for header in headers:
            if header.get('name') == 'From':
                # 🐧 [수정 포인트] 원본값(이름 <이메일>)을 가져옵니다.
                raw_from = header.get('value', '')
                
                # 정규표현식으로 꺽쇠 < > 안의 이메일만 추출합니다.
                import re
                email_match = re.search(r'<(.*?)>', raw_from)
                if email_match:
                    from_email = email_match.group(1).strip()
                else:
                    # 꺽쇠가 없는 경우(예: 그냥 이메일만 있는 경우)는 양 끝 공백만 제거
                    from_email = raw_from.strip()
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
        # 이제 from_email은 "test@example.com" 처럼 깨끗한 상태로 반환됩니다.
        return file_paths, message.get('snippet', ''), from_email
    
    def send_status_email(self, receiver, subject, body):
        try:
            message = MIMEText(body)
            message['to'] = receiver
            message['subject'] = subject
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            self.service.users().messages().send(userId='me', body={'raw': raw_message}).execute()
            logger.info(f"✅ 메일 발송 완료: {receiver}")
        except Exception as e:
            logger.error(f"❌ 메일 발송 에러: {e}")

if __name__ == "__main__":
    worker = GmailWorker()