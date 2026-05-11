import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/client';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId) => {
    console.log("🚀 [DB 통신 시작] 프로필 정보 요청:", userId);
    try {
      // 🚨 [강제 돌파 로직] Supabase가 무한 대기할 경우 3초 만에 끊어버립니다.
      const fetchPromise = supabase.from('profiles').select('*').eq('id', userId);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB 응답 시간 초과 (3초)")), 3000)
      );

      // Promise.race: 둘 중 하나라도 먼저 끝나면 바로 다음으로 넘어갑니다.
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      console.log("📥 [DB 통신 완료] 응답 결과:", data);

      if (error || !data || data.length === 0) {
        return { id: userId, name: "사용자", department: "미지정" };
      }
      return data[0];
    } catch (error) {
      // 3초가 지나 타임아웃 에러가 발생하면 임시 프로필을 던져서 화면을 무조건 열어줍니다.
      console.warn("🚨 [강제 예외 처리] 프로필 로드 실패, 기본값 반환:", error.message);
      return { id: userId, name: "사용자", department: "미지정" };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. 앱 진입 시 세션 즉시 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session) {
        setUser(session.user);
        fetchUserProfile(session.user.id).then(p => {
          if (isMounted) {
            setProfile(p);
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    // 2. 인증 상태 변화 리스너 (async/await 꼬임 방지를 위해 .then() 사용)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔔 [Auth Event 감지]: ${event}`);
      if (!isMounted) return;

      if (session) {
        setUser(session.user);
        fetchUserProfile(session.user.id).then(p => {
          if (isMounted) setProfile(p);
        });
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const logout = async () => {
    setUser(null);
    setProfile(null);
    await supabase.auth.signOut();
  };

  return { user, profile, loading, logout };
};