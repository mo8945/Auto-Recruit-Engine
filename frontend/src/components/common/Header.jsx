import React from 'react';
import { RefreshCw, BarChart2, List, LogOut } from 'lucide-react';

const Header = ({ onRefresh, isSyncing, currentView, setView, profile, onLogout }) => {
  
  // 🛡️ 인사팀 여부 확인 (버튼 권한 제어)
  const isHRTeam = profile?.department === "인사팀";

  return (
    <header className="flex items-center justify-between mb-12 bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
      {/* 1. 로고 영역 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
          <span className="text-white font-black text-xl">A</span>
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tighter">Auto-Recruit Engine</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">v1.0 Powered by Jin-mo</p>
        </div>
      </div>

      {/* 2. 컨트롤 영역 */}
      <div className="flex items-center gap-4">
        {/* 📊 통계/목록 전환 버튼 (차트 보기 기능) */}
        <button 
          onClick={() => setView(currentView === "list" ? "chart" : "list")}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all border border-slate-700"
        >
          {currentView === "list" ? (
            <><BarChart2 size={18} /> <span>통계 리포트</span></>
          ) : (
            <><List size={18} /> <span>목록으로 돌아가기</span></>
          )}
        </button>

        {/* 🔄 메일 동기화 버튼 (인사팀 전용) */}
        {isHRTeam && (
          <button 
            onClick={onRefresh}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isSyncing 
              ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
              : "bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white"
            }`}
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? "동기화 중..." : "메일 동기화"}</span>
          </button>
        )}

        {/* 구분선 */}
        <div className="w-px h-8 bg-slate-800 mx-2" />

        {/* 사용자 정보 및 로그아웃 */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{profile?.name || '사용자'}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{profile?.department || '부서 미지정'}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
            title="로그아웃"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;