import React, { useState } from 'react';
import axios from 'axios';
import { X, Award, MessageSquare, Mail, CheckCircle, ArrowRight, UserCheck, UserX, Cpu } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const DetailModal = ({ applicant, onClose, onRefresh }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!applicant) return null;

  // [중요] 테이블 이름이 resumes이므로, 데이터도 resumes 배열로 들어옵니다.
  // 안전하게 첫 번째 데이터를 가져와서 'resumeData'라는 변수에 담습니다.
  const resumeData = (applicant.resumes && applicant.resumes.length > 0) 
                     ? applicant.resumes[0] 
                     : null;
                 
  const keywords = applicant.applicant_keywords || [];

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`상태를 '${newStatus}'로 변경하시겠습니까?`)) return;
    setIsUpdating(true);
    try {
      await axios.patch(`${API_BASE_URL}/applicants/${applicant.id}/status`, { status: newStatus });
      onRefresh(); 
      onClose();
    } catch (error) {
      alert("변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-8 border-b border-slate-800">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Cpu className="text-blue-500" size={28} /> AI 심층 역량 분석 리포트
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"><X size={28} /></button>
        </div>

        <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto text-left">
          {/* 지원자 정보 */}
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-xl">
              {applicant.name?.[0] || "?"}
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-4xl font-black text-white">{applicant.name}</h3>
                <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-black">
                  {applicant.status || "서류 접수"}
                </span>
              </div>
              <p className="text-slate-400 flex items-center gap-2 text-lg"><Mail size={18}/> {applicant.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* AI 심층 인사이트 섹션 */}
            <div className="space-y-4">
              <h4 className="text-slate-500 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-500" /> AI 심층 인사이트
              </h4>
              <div className="bg-slate-950/80 p-8 rounded-[2rem] border border-slate-800 shadow-inner min-h-[180px] flex items-center">
                <p className="text-slate-200 leading-relaxed text-lg font-medium italic">
                  {/* [체크] resumeData 안의 summary_text를 정확히 부릅니다. */}
                  {resumeData && resumeData.summary_text 
                    ? `"${resumeData.summary_text}"` 
                    : "저장된 심층 분석 데이터가 없습니다. 다시 동기화 해주세요. 🐧"}
                </p>
              </div>
            </div>

            {/* 역량 키워드 섹션 */}
            <div className="space-y-4">
              <h4 className="text-slate-500 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Award size={16} className="text-amber-500" /> 역량 키워드 맵
              </h4>
              <div className="flex flex-wrap gap-2 pt-2">
                {keywords.map((kw, idx) => (
                  <div key={idx} className={`px-4 py-2 rounded-2xl border text-sm font-bold flex items-center gap-2 ${
                    kw.category === '인성' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    kw.category === '경험' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    <CheckCircle size={14} /> {kw.keyword}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 버튼 */}
        <div className="p-8 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
          <div className="flex gap-4">
            <button disabled={isUpdating} onClick={() => handleStatusUpdate("면접 예정")} className="px-6 py-3 bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-white border border-amber-600/20 rounded-2xl font-black transition-all flex items-center gap-2"><ArrowRight size={20}/> 면접 예정</button>
            <button disabled={isUpdating} onClick={() => handleStatusUpdate("최종 합격")} className="px-6 py-3 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white border border-green-600/20 rounded-2xl font-black transition-all flex items-center gap-2"><UserCheck size={20}/> 합격 처리</button>
            <button disabled={isUpdating} onClick={() => handleStatusUpdate("불합격")} className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-2xl font-black transition-all flex items-center gap-2"><UserX size={20}/> 불합격 처리</button>
          </div>
          <button onClick={onClose} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black transition-all">닫기</button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;