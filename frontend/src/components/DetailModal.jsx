import React, { useState } from 'react';
import axios from 'axios';
import { X, Cpu, Award, MessageSquare, Star, Mail, Calendar, CheckCircle, ArrowRight, UserCheck, UserX, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const DetailModal = ({ applicant, onClose, onRefresh }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!applicant) return null;

  const resume = applicant.resumes && applicant.resumes.length > 0 
                 ? applicant.resumes[0] 
                 : null;

  // 상태 업데이트 함수
  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`지원자의 상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) return;

    setIsUpdating(true);
    try {
      await axios.patch(`${API_BASE_URL}/applicants/${applicant.id}/status`, {
        status: newStatus
      });
      
      // 성공 시 알림 및 데이터 새로고침
      onRefresh(); 
      onClose();
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("상태 변경 중 오류가 발생했습니다. 백엔드 서버를 확인해주세요.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* 상단 헤더 섹션 */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" size={20} />
            AI 지원자 상세 분석 리포트
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 본문 내용 섹션 */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          
          {/* 1. 프로필 요약 */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-900/20">
              {applicant.name ? applicant.name[0] : "?"}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-3xl font-bold text-white">{applicant.name}</h3>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold uppercase">
                  {applicant.status || "서류 접수"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-400 flex items-center gap-2 text-sm">
                  <Mail size={14} /> {applicant.email}
                </p>
                <p className="text-slate-500 flex items-center gap-2 text-sm">
                  <Calendar size={14} /> {new Date(applicant.created_at).toLocaleDateString()} 지원함
                </p>
              </div>
            </div>
          </div>

          {/* 2. AI 분석 총평 */}
          <div className="space-y-4">
            <h4 className="text-slate-400 font-bold flex items-center gap-2 uppercase tracking-wider text-xs">
              <MessageSquare size={16} className="text-blue-500" /> AI 핵심 요약
            </h4>
            <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800/50 shadow-inner">
              {resume?.summary_text ? (
                <p className="text-slate-200 leading-relaxed text-lg italic font-medium">
                  "{resume.summary_text}"
                </p>
              ) : (
                <div className="flex flex-col items-center py-4 gap-2">
                  <p className="text-slate-500 italic text-center">
                    아직 AI 분석 데이터가 없습니다.<br />
                    상단 'Gmail 동기화' 버튼을 눌러 분석을 시작하세요!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. 추출된 핵심 역량 (예시 데이터) */}
          <div className="space-y-4">
            <h4 className="text-slate-400 font-bold flex items-center gap-2 uppercase tracking-wider text-xs">
              <Award size={16} className="text-blue-500" /> 추출된 핵심 역량
            </h4>
            <div className="flex flex-wrap gap-2">
              {["문제 해결 능력", "빠른 학습력", "협업 중심"].map((tag) => (
                <div key={tag} className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-sm font-medium">
                  <CheckCircle size={14} className="text-green-500" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 푸터 (상태 변경 버튼 영역) */}
        <div className="p-6 bg-slate-900/80 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2">
            {/* 상태별 액션 버튼들 */}
            <button 
              disabled={isUpdating}
              onClick={() => handleStatusUpdate("면접 예정")}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600 text-amber-500 hover:text-white border border-amber-600/30 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
              면접 예정
            </button>
            <button 
              disabled={isUpdating}
              onClick={() => handleStatusUpdate("최종 합격")}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white border border-green-600/30 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              <UserCheck size={18} />
              합격
            </button>
            <button 
              disabled={isUpdating}
              onClick={() => handleStatusUpdate("불합격")}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              <UserX size={18} />
              불합격
            </button>
          </div>

          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};

export default DetailModal;