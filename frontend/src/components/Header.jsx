import React, { useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, RefreshCw, Loader2 } from 'lucide-react';

const Header = ({ onRefresh }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/sync');
      alert("새로운 지원자 데이터를 성공적으로 가져왔습니다!");
      onRefresh(); // 부모의 데이터 새로고침 함수 호출
    } catch (error) {
      console.error("동기화 실패:", error);
      alert("동기화 중 오류가 발생했습니다.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="mb-12 flex justify-between items-end">
      <div>
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-blue-500" size={36} />
          Recruit Pipeline <span className="text-blue-500">.</span>
        </h1>
        <p className="text-slate-400 font-medium mt-2">Gmail에서 지원자를 자동으로 추출하고 관리합니다.</p>
      </div>

      <button 
        onClick={handleSync}
        disabled={isSyncing}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
      >
        {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
        {isSyncing ? "동기화 중..." : "새 지원자 불러오기"}
      </button>
    </header>
  );
};

export default Header;