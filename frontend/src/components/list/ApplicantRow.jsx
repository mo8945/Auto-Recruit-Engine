import React from 'react';
import { Mail, ChevronRight } from 'lucide-react';

const ApplicantRow = ({ applicant, onClick }) => {
  return (
    <div 
      onClick={() => onClick(applicant)}
      /* 🐧 헤더와 똑같은 비율의 grid를 적용하여 위아래 열 정렬선을 한 치의 오차 없이 맞춥니다. */
      className="grid grid-cols-[48px_1.5fr_1.5fr_3.5fr_1.5fr_32px] items-center py-3 md:py-4 px-4 md:px-6 hover:bg-slate-800/40 transition-all cursor-pointer group w-full"
    >
      {/* 1. 아바타 영역 */}
      <div className="flex items-center">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20 text-sm">
          {applicant.name ? applicant.name[0] : "?"}
        </div>
      </div>
      
      {/* 2. 이름 영역 */}
      <div className="text-left pl-1 min-w-0 pr-2">
        <h4 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-sm md:text-base truncate">
          {applicant.name}
        </h4>
      </div>

      {/* 3. 상태 뱃지 영역 */}
      <div className="flex justify-center px-2">
        <span className={`w-full max-w-27.5 text-center py-1 rounded-full text-[11px] md:text-xs font-black ${
          applicant.status === "최종 합격" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
          applicant.status === "불합격" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
          applicant.status === "면접 예정" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
          "bg-blue-500/10 text-blue-500 border border-blue-500/20"
        }`}>
          {applicant.status || "서류 접수"}
        </span>
      </div>

      {/* 4. 이메일 영역 (여백을 알맞게 소유하여 이메일 뒤 광활한 공백을 회수합니다) */}
      <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm pl-6 min-w-0 pr-4">
        <Mail size={14} className="text-slate-600 shrink-0" />
        <span className="truncate">{applicant.email}</span>
      </div>

      {/* 5. 날짜 영역 (이메일 구역과 조화롭게 균등 배분되어 안착) */}
      <div className="text-right text-slate-500 text-xs md:text-sm pr-4 truncate">
        <span>{new Date(applicant.created_at).toLocaleDateString()}</span>
      </div>

      {/* 6. 화살표 영역 */}
      <div className="flex justify-end">
        <ChevronRight size={18} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
      </div>
    </div>
  );
};

export default ApplicantRow;