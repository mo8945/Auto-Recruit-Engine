import React, { useState, useEffect } from 'react';
import { supabase } from './api/client';
import LoginView from './components/LoginView';
import MainDashboard from './views/MainDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 현재 세션 확인
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    getSession();

    // 2. 로그인 상태 변경 감지[cite: 5]
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // profiles 테이블에서 부서 정보 가져오기
  const fetchUserProfile = async (authUser) => {
    setUser(authUser);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black">시스템 부팅 중... 🐧</div>;

  return (
    <>
      {!user ? (
        <LoginView onLoginSuccess={fetchUserProfile} />
      ) : (
        <MainDashboard user={user} profile={profile} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;