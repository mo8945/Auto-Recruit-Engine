import React from 'react';
import { Mail, Calendar, ChevronRight } from 'lucide-react';

const ApplicantRow = ({ applicant, onClick }) => {
  return (
    <div 
      onClick={() => onClick(applicant)}
      className="flex items-center justify-between p-4 px-6 border-b border-slate-800/50 hover:bg-slate-800/40 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-6 flex-1">
        {/* 아바타 아이콘 */}
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-blue-900/20">
          {applicant.name ? applicant.name[0] : "?"}
        </div>
        
        {/* 이름 & 이메일 (게시판처럼 가로 배치) */}
        <div className="flex items-center gap-12 flex-1">
          <div className="w-32">
            <h4 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              {applicant.name}
            </h4>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Mail size={14} />
            <span>{applicant.email}</span>
          </div>
        </div>
      </div>

      {/* 날짜 및 상태 뱃지 */}
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2 text-slate-600 text-xs">
          <Calendar size={14} />
          <span>{new Date(applicant.created_at).toLocaleDateString()}</span>
        </div>
        
        <span className={`w-24 text-center px-3 py-1 rounded-full text-xs font-bold ${
          applicant.status === "최종 합격" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
          applicant.status === "불합격" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
          "bg-blue-500/10 text-blue-500 border border-blue-500/20"
        }`}>
          {applicant.status || "서류 접수"}
        </span>
        
        <ChevronRight size={18} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
      </div>
    </div>
  );
};

export default ApplicantRow;