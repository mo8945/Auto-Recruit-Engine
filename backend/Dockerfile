# 1. 파이썬 베이스 이미지 설정
FROM python:3.10-slim

# 2. 필요한 시스템 패키지 설치 (WeasyPrint 필수 라이브러리)
RUN apt-get update && apt-get install -y \
    python3-pip python3-cffi python3-brotli libpango-1.0-0 \
    libharfbuzz0b libpangoft2-1.0-0 libpangocairo-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 3. 작업 디렉토리 설정
WORKDIR /app

# 4. 종속성 파일 복사 및 설치
# 이제 Dockerfile과 같은 위치에 있으므로 바로 COPY 합니다.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. 현재 폴더(backend/)의 모든 내용을 컨테이너 내부로 복사
COPY . .

# 6. 포트 노출
EXPOSE 8000

# 7. 실행 명령
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]