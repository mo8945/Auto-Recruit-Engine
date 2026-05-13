import React, { useState } from 'react';
import StatusManager from './StatusManager';
import CommentSection from './CommentSection';
import AIEvaluationSection from './AIEvaluationSection';
import { Sparkles, MessageSquare, X } from 'lucide-react';
import { updateApplicantStatusApi } from '../../api/client';

export default function DetailModal({ applicant, userProfile, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('AI');

  const isHRCheck = 
    userProfile?.role === 'hr' || 
    userProfile?.department?.includes('인사') || 
    userProfile?.department?.includes('HR');

  const handleStatusUpdate = async (newStatus) => {
    try {
      // 🐧 상태 업데이트 시도
      await updateApplicantStatusApi(applicant.id, newStatus);
      
      // 성공 시 알림
      alert(`'${newStatus}' 상태로 변경되었으며, 지원자에게 메일이 발송되었습니다. 🐧`);
      
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      // 🐧 에러 메시지를 더 구체적으로 찍어줍니다.
      const errorMsg = error.response?.status === 405 
        ? "서버에서 PATCH 요청을 거절했습니다 (405). API 주소를 확인해주세요."
        : "메일 발송 및 상태 변경에 실패했습니다.";
      
      console.error("상태 변경 실패 원인:", error.response);
      alert(errorMsg);
    }
  };

  if (!applicant || !userProfile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-[#111420] border border-slate-800 w-full max-w-3xl rounded-4xl flex flex-col h-[85vh] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-800/80 bg-slate-900/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black text-white">{applicant.name} 지원자</h2>
            <button onClick={onClose} className="bg-slate-800 text-slate-400 hover:text-white p-3 rounded-2xl transition-all"><X size={20} /></button>
          </div>
          <StatusManager currentStatus={applicant.status} onStatusChange={handleStatusUpdate} isHR={isHRCheck} />
          <div className="flex gap-2 mt-8 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button onClick={() => setActiveTab('AI')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'AI' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><Sparkles size={18} className="inline mr-2" /> AI 역량 평가서</button>
            <button onClick={() => setActiveTab('MEMO')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'MEMO' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><MessageSquare size={18} className="inline mr-2" /> 부서 검토 메모</button>
          </div>
        </div>
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          {activeTab === 'AI' ? <AIEvaluationSection applicant={applicant} /> : <CommentSection applicantId={applicant.id} userProfile={userProfile} onSaved={() => {if (onRefresh) onRefresh();}}/>}
        </div>
      </div>
    </div>
  );
}