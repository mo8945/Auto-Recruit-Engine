import React from 'react';
import ApplicantRow from './ApplicantRow';

const ApplicantTable = ({ applicants, onApplicantClick }) => {
  if (applicants.length === 0) {
    return (
      <div className="p-20 text-center text-slate-500">
        해당하는 지원자가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* 🐧 네 단락이 여백을 공평하게 나눠 가지는 대시보드 핏 헤더 설정 */}
      <div className="grid grid-cols-[48px_1.5fr_1.5fr_3.5fr_1.5fr_32px] items-center px-4 md:px-6 py-4 bg-slate-800/30 border-b border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider select-none w-full">
        <div></div> {/* 아바타 여백 */}
        <div className="text-left pl-1">성함</div>
        <div className="text-center">상태</div>
        <div className="text-left pl-6">이메일 주소</div>
        <div className="text-right pr-4">지원일</div>
        <div></div> {/* 화살표 여백 */}
      </div>

      {/* 리스트 본문 */}
      <div className="divide-y divide-slate-800/50">
        {applicants.map((app) => (
          <ApplicantRow 
            key={app.id || app.email} 
            applicant={app} 
            onClick={onApplicantClick} 
          />
        ))}
      </div>
    </div>
  );
};

export default ApplicantTable;