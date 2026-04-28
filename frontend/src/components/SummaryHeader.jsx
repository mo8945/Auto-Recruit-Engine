import React from 'react';
import { Users, UserPlus, Calendar, CheckCircle, XCircle } from 'lucide-react';

const SummaryHeader = ({ applicants, filterStatus, onFilterChange }) => {
  const getCount = (status) => {
    if (status === "전체") return applicants.length;
    return applicants.filter(a => a.status === status).length;
  };

  const badges = [
    { label: "전체", status: "전체", icon: <Users size={20}/>, color: "blue" },
    { label: "서류 접수", status: "서류 접수", icon: <UserPlus size={20}/>, color: "slate" },
    { label: "면접 예정", status: "면접 예정", icon: <Calendar size={20}/>, color: "amber" },
    { label: "최종 합격", status: "최종 합격", icon: <CheckCircle size={20}/>, color: "green" },
    { label: "불합격", status: "불합격", icon: <XCircle size={20}/>, color: "red" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
      {badges.map((badge) => (
        <div 
          key={badge.status}
          onClick={() => onFilterChange(badge.status)}
          className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
            filterStatus === badge.status 
            ? "bg-blue-600 text-white border-blue-400 shadow-lg scale-105" 
            : "text-slate-400 border-slate-800 bg-slate-900/50 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${filterStatus === badge.status ? "bg-white/20" : "bg-slate-800"}`}>
              {badge.icon}
            </div>
            <span className="font-bold">{badge.label}</span>
          </div>
          <span className="text-2xl font-black">{getCount(badge.status)}</span>
        </div>
      ))}
    </div>
  );
};

export default SummaryHeader;