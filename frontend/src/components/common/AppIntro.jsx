import React, { useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

const AppIntro = ({ onTimeout }) => {
  useEffect(() => {
    // 🐧 2.5초(2500ms) 후에 부모가 넘겨준 완료 함수(onTimeout)를 실행합니다.
    const timer = setTimeout(() => {
      onTimeout();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onTimeout]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        {/* 로딩 스피너와 보안 방패 아이콘 겹치기 */}
        <div className="relative flex items-center justify-center mb-6">
          <Loader2 className="text-blue-500 animate-spin absolute" size={100} />
          <ShieldCheck className="text-blue-400 animate-pulse" size={44} />
        </div>
        
        {/* 타이틀 및 텍스트 시스템 */}
        <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
          AUTO-RECRUIT ENGINE v1.0
        </h1>
        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase animate-pulse">
          Initializing Secure Gateway & Verifying Integrity...
        </p>
      </div>
    </div>
  );
};

export default AppIntro;