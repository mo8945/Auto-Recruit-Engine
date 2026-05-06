import React from 'react';
import { RefreshCw, BarChart2, List } from 'lucide-react';

// Props로 setView와 currentView를 받아와야 버튼이 작동합니다![cite: 5]
const Header = ({ onRefresh, isSyncing, currentView, setView }) => {
  return (
    <header className="flex items-center justify-between mb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
          <span className="text-white font-black text-xl">A</span>
        </div>
        {/* 제목을 제안서 명칭으로 변경했습니다[cite: 5] */}
        <h2 className="text-xl font-black text-white tracking-tighter">Auto-Recruit Engine</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* [중요] 이 버튼 코드가 들어가야 화면에 보입니다! */}
        <button
          onClick={() => setView(currentView === 'list' ? 'chart' : 'list')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all"
        >
          {currentView === 'list' ? (
            <><BarChart2 size={18} /> <span>통계 시각화</span></>
          ) : (
            <><List size={18} /> <span>목록으로 돌아가기</span></>
          )}
        </button>

        <button 
          onClick={onRefresh}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50`}
        >
          <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "동기화 중..." : "Gmail 동기화"}
        </button>
      </div>
    </header>
  );
};

export default Header;