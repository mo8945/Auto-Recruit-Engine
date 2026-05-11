import React from 'react';
import { useAuth } from './hooks/useAuth';
import LoginView from './views/LoginView';
import MainDashboard from './views/MainDashboard';

function App() {
  const { user, profile, loading, logout } = useAuth();

  // 1. 초기 시스템 로딩 (펭귄 부팅)
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