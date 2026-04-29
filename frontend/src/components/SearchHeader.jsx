// components/SearchHeader.jsx
import React from 'react';
import { Search, Users } from 'lucide-react';

const SearchHeader = ({ searchTerm, setSearchTerm, totalCount, filteredCount }) => {
  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-8 rounded-4xl border border-slate-800/50 backdrop-blur-sm">
      <div className="text-left">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <Users className="text-blue-500" size={32} />
          인재 풀 관리 시스템
        </h1>
        <p className="text-slate-400 font-medium">
          전체 {totalCount}명 중 <span className="text-blue-400">{filteredCount}명</span>이 검색되었습니다.
        </p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text"
          placeholder="이름, 이메일, 키워드(Python 등) 검색..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchHeader;