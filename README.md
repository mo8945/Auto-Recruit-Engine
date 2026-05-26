# 🐧 Auto-Recruit Engine (v1.0.0)
> **AI 기반 채용 이력서 자동화 시스템 및 하이브리드 모바일 솔루션**
> 
> 본 프로젝트는 수동으로 관리되던 채용 프로세스를 자동화 파이프라인으로 혁신하고, 인사팀이 시공간의 제약 없이 모바일 환경에서도 안전하게 지원자 현황을 관리할 수 있도록 구축된 Full-Stack 하이브리드 어플리케이션입니다.

---

## 👨‍💻 프로젝트 정보
- **제작자:** 1기 홍진모 (Hong Jin-mo)
- **개발 환경:** Windows (ThinkPad) / Git Bash Environment
- **주요 목적:** HR 부서의 단순 반복 업무 95% 단축 및 모바일 최적화 비즈니스 가치 창출

---

## 🛠️ Tech Stack & Architecture

### 1. Frontend & Mobile Shell
- **Framework:** React (Single Page Application)
- **Styling:** Tailwind CSS (Dark Modern Theme / Slate 950 Base)
- **Hybrid Bridge:** Capacitor.js (Android WebView 최적화)
- **State & UI Tools:** React Hooks, React Hot Toast, Recharts

### 2. Backend & Database
- **Engine:** FastAPI (Python 비동기 고성능 웹 프레임워크)
- **Database:** Supabase (PostgreSQL / Real-time DB Sync)
- **Cloud Interface:** Gmail API Client, Google Veo/Lyria Core Worker Pipeline

---

## 🚀 Key Features (핵심 기능)

1. **Gmail 이력서 자동 수집 파이프라인**
   - Gmail API를 연동하여 `[지원]`, `[채용]`, `이력서` 등의 키워드가 포함된 메일 및 첨부파일(PDF) 자동 파싱.
   - AI Engine을 통한 대용량 경력 데이터의 3문장 핵심 요약 자동 추출 및 데이터베이스 적재.

2. **모바일 하이브리드 최적화 (Mobile-First UX)**
   - PC 웹 대시보드와 스마트폰 단독 실행 앱(`.apk`) 간의 무결점 데이터 동기화.
   - 모바일 특화 알림 위젯 및 가로 스크롤 최적화 반응형 UI.

3. **Admin Security Zone (보안 거버넌스)**
   - 공채 시즌 종료 후 개인정보 보호법 준수를 위한 데이터 영구 파괴 기능 (`Season Clean`).
   - 데이터 동기화 및 초기화 민감 액션 수행 시 패스코드 기반의 2차 인증 강제.

---

## 🔐 Security Policies (SecOps 보안 정책)

본 시스템은 인사 및 채용 데이터의 민감성을 고려하여 상용 앱 수준의 3대 핵심 보안 정책을 수립 및 적용했습니다.

* **XSS (Cross-Site Scripting) 방어:**
  React의 기본 내부 렌더링 엔진 이스케이핑(Escaping) 기능과 `DOMPurify` 라이브러리를 결합하여, 이력서 요약 텍스트 및 외부 입력값에 포함될 수 있는 악의적인 스크립트 주입 공격을 원천 차단합니다.
* **JWT (JSON Web Token) 인증 체계:**
  서버의 세션 부하를 방지하기 위해 Stateless 기반의 JWT 인증 방식을 채택했습니다. 안전한 암호화 알고리즘을 통한 토큰 검증 메커니즘으로 모바일 네트워크 환경에서도 안전한 상시 세션을 유지합니다.
* **SQL Injection 예방 & RLS 규격:**
  FastAPI 비동기 쿼리 아키텍처 및 Supabase의 `Parameterized Queries`를 의무 적용하여 악의적인 조작 쿼리 실행을 전면 무력화합니다. 추가적으로 Supabase `RLS (Row Level Security)` 정책을 선언하여 인가되지 않은 외부 사용자의 DB 접근을 격리합니다.

---

## 📱 Mobile Troubleshooting & Optimization Case (기술적 성취)

하이브리드 모바일 앱 빌드 및 실제 스마트폰 구동 과정에서 발생한 핵심 병목을 주도적으로 디버깅하여 해결한 사례입니다.

### 1. Mobile WebView Z-Index & 마운트 엇박자 제압
- **문제 현상:** PC 웹에서는 정상 구동되던 토스트 알림창이 모바일 단독 앱 구동 시 로그인 및 모달 트리 전환 타이밍에 완전히 유실/침묵하는 레이어 샌드위치 현상 발생.
- **해결 방안:** 리액트 조건부 렌더링에 따른 조기 반환(Early Return) 모든 분기점 상단에 수신기(`<Toaster />`) 그릇을 강제 이식하여 앱 메모리에 영구 상주시키고, `zIndex: 999999` 및 `top: 60px` 노치 방어벽 설정을 부여하여 모바일 웹뷰 화면 최상단 렌더링 안착 성공.

### 2. 패스코드 비동기 인자 배달 사고 진압
- **문제 현상:** 동기화 실행 시 데이터 파이프라인 내부 괄호 내 인자값 배달 누락으로 인해 백엔드가 `undefined`를 수신, 401 Unauthorized 에러를 무한 뱉어내던 버그 트래킹.
- **해결 방안:** `MainDashboard.jsx`에서 모달이 뿜어내는 `passcode` 변수를 비동기 처리기(`handleSyncExecute`) 장치에 명시적으로 바인딩(Binding)하여 프론트-백엔드 간 데이터 배달 라인 정상화 완료.

---

## 🏃‍♂️ How to Run & Build

### Frontend Development
```bash
npm install
npm run dev

최종 확인 및 수정 2026.05.26