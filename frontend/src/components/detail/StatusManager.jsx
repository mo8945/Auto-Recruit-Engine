import React from 'react';

export default function StatusManager({ currentStatus, onStatusChange, isHR }) {
  const statusList = ["서류 접수", "면접 예정", "최종 합격", "불합격"];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {statusList.map((status) => (
        <button
          key={status}
          // 🐧 권한이 있을 때만 클릭이 작동하도록 함
          onClick={() => isHR && onStatusChange(status)}
          // 🐧 권한이 없으면 클릭 불가 스타일 적용
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border ${
            currentStatus === status
              ? "bg-blue-600 text-white border-blue-500 shadow-lg"
              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
          } ${!isHR ? "opacity-30 cursor-not-allowed grayscale pointer-events-none" : "cursor-pointer"}`}
          title={!isHR ? "인사팀 권한이 필요합니다" : ""}
        >
          {status}
        </button>
      ))}
    </div>
  );
}