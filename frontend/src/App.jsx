import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginView from './views/LoginView';
import MainDashboard from './views/MainDashboard';
import AppIntro from './components/common/AppIntro'; // 🐧 새로 만든 인트로 컴포넌트
import { Toaster } from 'react-hot-toast'; // 🐧 핫토스트 엔진 임포트 완료

function App() {
  // 🐧 1. 인트로 스위치 상태 추가 (기본값 true로 켜둠)
  const [isIntroActive, setIsIntroActive] = useState(true);
  
  const { user, profile, loading, logout } = useAuth();

  // =========================================================================
  // 🔥 [모바일 철통 보안 대책] 
  // 어떤 얼리 리턴 화면이 발동하더라도 토스트 그릇이 폰 메모리에 항상 상주하게 만듭니다.
  // =========================================================================

  // 🐧 2. 앱 실행 시 가장 먼저 2.5초 동안 인트로를 렌더링
  if (isIntroActive) {
    return (
      <>
        {/* 인트로가 도는 중에도 백그라운드에서 토스트가 준비되도록 배치 */}
        <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
        <AppIntro onTimeout={() => setIsIntroActive(false)} />
      </>
    );
  }

  // 1. 초기 시스템 로딩 (만약 인트로 2.5초가 끝났는데도 서버 통신이 안 끝났을 때만 뜸)
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-black">
        {/* 로딩 껍데기 상태에서도 팝업 레이어 확보 */}
        <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
        <div className="text-4xl mb-4 animate-bounce">🐧</div>
        <div className="tracking-tighter uppercase opacity-50">Auto-Recruit Initializing...</div>
      </div>
    );
  }

  // 2. 로그인이 안 되어 있으면 로그인 화면
  if (!user) {
    return (
      <>
        {/* 로그인 화면 뒤에서 대시보드로 바뀔 때 토스트가 유실되는 현상 원천 차단 */}
        <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
        <LoginView onLoginSuccess={() => {}} />
      </>
    );
  }

  // 3. 로그인은 됐는데 프로필을 불러오는 중 (0.5초 내외)
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-black">
        <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
        <div className="text-4xl mb-4 animate-spin text-blue-500">⚙️</div>
        <div className="tracking-tighter uppercase opacity-50">Loading Profile...</div>
      </div>
    );
  }

  // 4. [최종 스테이지] 로그인 및 프로필 연동 완료 시 메인 대시보드 화면 렌더링 구역
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* 🐧 폰 상단바(노치)와 샌드위치 레이어 버그를 완벽하게 제압하는 최상단 명품 그릇 */}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        containerStyle={{
          top: 60,            // 모바일 상단 바에 문구가 가려지지 않도록 아래로 60px 여백 확보!
          zIndex: 999999,     // 💖 그 어떤 모달, 테이블 뷰 레이어보다 무조건 위에 그리도록 고정!
        }}
      />

      <MainDashboard 
        user={user} 
        profile={profile} 
        onLogout={logout} 
      />
    </div>
  );
}

export default App;