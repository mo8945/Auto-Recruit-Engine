# 🚀 Auto-Recruit Engine
**AI 에이전트 기반 온디맨드 메일 분석 및 채용 관리 시스템**

> "인사팀의 업무 효율을 극대화하는 AI 파이프라인: 단순 나열이 아닌, 핵심 역량을 큐레이션합니다."

## 🛠 확장된 기술 스택
- **Frontend**: React, Tailwind CSS, Chart.js
- **Backend**: FastAPI, LangChain, Gmail API, **Docker**
- **Database**: Supabase (PostgreSQL, Auth 포함)
- **AI**: OpenAI GPT-4o
- **DevOps**: Render (Backend), Vercel (Frontend)

## 📌 주요 특징 (Core Features)
- **Smart On-Demand Sync**: 실시간 감시 대신, 필요할 때 버튼 클릭으로 Gmail 대량 동기화 및 분석.
- **Multi-File Context Analysis**: 이력서와 자기소개서가 각각 첨부된 경우에도 AI가 하나의 컨텍스트로 통합 분석.
- **Advanced Keyword Indexing**: 기술 스택, 인성, 경험 카테고리별 정교한 태깅 및 검색 필터링.
- **Season Clean (Admin Only)**: 공채 시즌 종료 후 개인정보 보호를 위해 DB를 안전하게 완전 초기화.
- **Double-Lock Security**: 인사팀 전용 패스코드와 권한 기반 UI 제어.

## 📂 프로젝트 구조 (Project Structure)
```text
Auto-Recruit Engine/
├── backend/
│   ├── api/          # sync.py (동기화 및 Admin API)
│   ├── core/         # config.py, gmail_worker.py
│   ├── prompts/      # resume_prompts.py (AI 프롬프트)
│   ├── services/     # admin, auth, resume_service.py
│   ├── database.py   # Supabase 설정
│   └── main.py       # FastAPI 엔트리 포인트
├── frontend/
│   ├── src/
│   │   ├── api/      # client.jsx (API 통신)
│   │   ├── components/ # common, detail, list 컴포넌트
│   │   └── views/    # MainDashboard.jsx
├── Dockerfile        # Render 배포용 가상화 설정
└── README.md         # 프로젝트 설명서

업데이트: 2026-05-13 | 기능 구현 및 디버깅 완료