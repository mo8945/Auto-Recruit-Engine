// src/components/Header.jsx

import React from 'react';

const Header = ({ onRefresh, isSyncing }) => {
  return (
    <header className="flex justify-between items-center py-6 border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
          <span className="text-xl">🐧</span>
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">Hanwha Eagles AI Recruiter</h2>
      </div>

      <button
        onClick={onRefresh} // App.jsx에서 넘겨준 setShowAuthModal(true)가 실행됨[cite: 6]
        disabled={isSyncing}
        className={`px-6 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${
          isSyncing 
          ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
          : "bg-white text-slate-950 hover:bg-blue-500 hover:text-white active:scale-95 shadow-xl shadow-white/5"
        }`}
      >
        {isSyncing ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
            동기화 중...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Gmail 동기화
          </>
        )}
      </button>
    </header>
  );
};

export default Header;