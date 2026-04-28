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
    <div className="flex flex-col">
      {/* 헤더 부분 (선택 사항) */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-800/30 border-b border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-6 flex-1">
          <div className="w-10"></div>
          <div className="flex gap-12 flex-1">
            <div className="w-32">성함</div>
            <div>이메일 주소</div>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="w-24">지원일</div>
          <div className="w-24 text-center">상태</div>
          <div className="w-4.5"></div>
        </div>
      </div>

      {/* 리스트 본문 */}
      <div className="divide-y divide-slate-800/50">
        {applicants.map((app) => (
          <ApplicantRow 
            key={app.id} 
            applicant={app} 
            onClick={onApplicantClick} 
          />
        ))}
      </div>
    </div>
  );
};

export default ApplicantTable;