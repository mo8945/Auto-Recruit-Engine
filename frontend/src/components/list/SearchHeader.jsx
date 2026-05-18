import React from 'react';
import { Search, Users } from 'lucide-react';

// 🐧 여기서 { onSearchChange } 라고 정확히 받아와야 합니다!
const SearchHeader = ({ searchTerm, onSearchChange, totalCount, filteredCount }) => {
  return (
    /* 🐧 [전체 바구니] 
       - 모바일에서도 무조건 한 줄로 정렬하기 위해 `flex-row`와 `items-center`를 고정했습니다.
       - 모바일 내부 여백을 `p-3.5`로 대폭 줄여 세로 두께를 날씬하게 만들었습니다. */
    <div className="mb-6 md:mb-10 flex flex-row items-center justify-between gap-3 bg-slate-900/40 p-3.5 md:p-8 rounded-2xl md:rounded-4xl border border-slate-800/50 backdrop-blur-sm w-full overflow-hidden">
      
      {/* 1. 타이틀 구역 
         - shrink-0을 주어 인풋창이 늘어나도 글자가 절대 아래로 꺾이지 않게 방어합니다. */}
      <div className="text-left shrink-0">
        <h1 className="text-base md:text-3xl font-black text-white flex items-center gap-1.5">
          <Users className="text-blue-500" size={18} md:size={32} /> {/* 모바일에서 아이콘 크기 축소 */}
          검색
        </h1>
        {/* 모바일에선 화면이 좁으므로 인원수 요약 텍스트는 숨기고 PC(md:)에서만 풍부하게 보여줍니다. */}
        <p className="hidden md:block text-slate-400 font-medium mt-1">
          전체 {totalCount}명 중 <span className="text-blue-400">{filteredCount}명</span>이 검색되었습니다.
        </p>
      </div>

      {/* 2. 인풋 박스 구역 
         - flex-1을 주어 남는 가로 공간을 인풋창이 유연하게 꽉 채우도록 설정합니다. */}
      <div className="relative flex-1 max-w-60 md:max-w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} /> {/* 돋보기 아이콘도 컴팩트하게 */}
        <input 
          type="text"
          placeholder="검색어 입력..." 
          value={searchTerm}
          // 🐧 여기서 onSearchChange를 실행합니다.
          onChange={(e) => onSearchChange(e.target.value)}
          /* 🐧 인풋창 다이어트 포인트:
             - py-2로 두께를 얇게 깎고, 글자 크기를 text-xs로 줄였습니다.
             - pl-9로 아이콘 여백도 촘촘하게 조정했습니다. */
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 md:py-4 pl-9 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600 font-bold text-xs md:text-base"
        />
      </div>

    </div>
  );
};

export default SearchHeader;