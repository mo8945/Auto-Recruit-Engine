import React from 'react';
import { RefreshCw, BarChart2, List, LogOut } from 'lucide-react';

const Header = ({ onRefresh, isSyncing, currentView, setView, profile, onLogout }) => {
  
  // 🛡️ 인사팀 여부 확인 (버튼 권한 제어)
  const isHRTeam = profile?.department === "인사팀";

  return (
    /* 🐧 [전체 바구니] 
       - 모바일에서는 flex-col로 세로 배치, PC(md:)에서는 flex-row로 양옆 배치
       - 모바일 패딩을 p-4로 줄여 좌우 여백을 넓혔습니다. */
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 md:mb-12 bg-slate-900/50 p-4 md:p-6 rounded-3xl border border-white/5 backdrop-blur-sm w-full overflow-hidden">
      
      {/* 1. 로고 영역 
         - 모바일에서는 너비를 꽉 채우고(w-full) 중앙 정렬 혹은 좌측 정렬되게 조절
         - w-10/h-10을 모바일에선 w-8/h-8로 컴팩트하게 줄였습니다! */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-start border-b border-slate-800/50 md:border-none pb-3 md:pb-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
            <span className="text-white font-black text-lg md:text-xl">A</span>
          </div>
          <div className="text-left">
            <h2 className="text-base md:text-xl font-black text-white tracking-tighter">Auto-Recruit Engine</h2>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">v1.0 Powered by Jin-mo</p>
          </div>
        </div>
        
        {/* 모바일 화면 우측 상단에 심플하게 부서 노출 */}
        <span className="block md:hidden text-[10px] bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-slate-400 font-bold">
          {profile?.department || '인사팀'}
        </span>
      </div>

      {/* 2. 컨트롤 영역 전체 바구니 
         - 모바일에서는 가로 폭을 100%(w-full) 쓰고 아이템들을 촘촘하게 가로 일렬(flex-row) 배치합니다. */}
      <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
        
        {/* 📊 통계/목록 전환 버튼 */}
        <button 
          onClick={() => setView(currentView === "list" ? "chart" : "list")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
            currentView === "list" 
            ? "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
            : "bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white"
          }`}
        >
          {currentView === "list" ? (
            <>
              <BarChart2 size={14} />
              <span>통계 리포트</span>
            </>
          ) : (
            <>
              <List size={14} />
              <span>목록 보기</span>
            </>
          )}
        </button>

        {/* 🔄 메일 동기화 버튼 (인사팀 전용) */}
        {isHRTeam && (
          <button 
            onClick={onRefresh}
            disabled={isSyncing}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
              isSyncing 
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white"
            }`}
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? "동기화 중..." : "메일 동기화"}</span>
          </button>
        )}

        {/* 🐧 모바일 가로확보를 위해 불필요한 세로 구분선(w-px)은 PC(md:) 환경에서만 보이도록 제한! */}
        <div className="hidden md:block w-px h-6 bg-slate-800 mx-1" />

        {/* 사용자 정보 영역 */}
        <div className="flex items-center gap-2 shrink-0">
          {/* PC에서만 텍스트를 크게 노출하고 모바일에선 숨김(또는 간소화) */}
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-white">{profile?.name || '사용자'}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{profile?.department || '부서 미지정'}</p>
          </div>
          
          {/* 모바일 전용 미니 프로필 이름 배지 */}
          <div className="md:hidden bg-slate-900 border border-slate-800/80 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-300">
            {profile?.name || '사용자'}
          </div>

          {/* 🚪 로그아웃 버튼 (절대 가출하지 못하게 flex 구조 내에 안착) */}
          <button 
            onClick={onLogout}
            className="flex items-center justify-center p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white transition-all shrink-0"
            title="로그아웃"
          >
            <LogOut size={14} />
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;