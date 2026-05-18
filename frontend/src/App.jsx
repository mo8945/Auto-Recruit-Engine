import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginView from './views/LoginView';
import MainDashboard from './views/MainDashboard';
import AppIntro from './components/common/AppIntro'; // 🐧 새로 만든 인트로 컴포넌트

function App() {
  // 🐧 1. 인트로 스위치 상태 추가 (기본값 true로 켜둠)
  const [isIntroActive, setIsIntroActive] = useState(true);
  
  const { user, profile, loading, logout } = useAuth();

  // 🐧 2. 앱 실행 시 가장 먼저 2.5초 동안 인트로를 렌더링
  // (이 화면이 뜨는 동안 뒤에서 useAuth가 유저 정보를 쓱싹 불러옵니다)
  if (isIntroActive) {
    return <AppIntro onTimeout={() => setIsIntroActive(false)} />;
  }

  // --- ⬇️ 여기서부터는 제자님이 짜신 원래 로직 그대로입니다! (안전함) ---

  // 1. 초기 시스템 로딩 (만약 인트로 2.5초가 끝났는데도 서버 통신이 안 끝났을 때만 뜸)
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-black">
        <div className="text-4xl mb-4 animate-bounce">🐧</div>
        <div className="tracking-tighter uppercase opacity-50">Auto-Recruit Initializing...</div>
      </div>
    );
  }

  // 2. 로그인이 안 되어 있으면 로그인 화면
  if (!user) {
    return <LoginView onLoginSuccess={() => {}} />;
  }

  // 3. 로그인은 됐는데 프로필을 불러오는 중 (0.5초 내외)
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-black">
        <div className="text-4xl mb-4 animate-spin text-blue-500">⚙️</div>
        <div className="tracking-tighter uppercase opacity-50">Syncing Profile...</div>
      </div>
    );
  }

  // 4. 모든 관문 통과! 대시보드 진입
  return <MainDashboard user={user} profile={profile} onLogout={logout} />;
}

export default App;