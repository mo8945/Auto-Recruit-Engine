import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, X, AlertTriangle } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const ADMIN_PASSWORD = "1234";

const DetailModal = ({ applicant, onClose, onRefresh }) => {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [password, setPassword] = useState("");

  if (!applicant) return null;

  const handleStatusClick = (newStatus) => {
    if (applicant.status === newStatus) return;
    const isFinalStatus = applicant.status === "최종 합격" || applicant.status === "불합격";
    if (isFinalStatus) {
      setPendingStatus(newStatus);
      setShowPasswordInput(true);
    } else {
      if (window.confirm(`'${newStatus}' 상태로 변경하시겠습니까?\n확인을 누르면 안내 메일이 발송됩니다.`)) {
        executeStatusChange(newStatus);
      }
    }
  };

  const executeStatusChange = async (targetStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/applicants/${applicant.id}/status`, { status: targetStatus });
      alert(`성공적으로 변경되었습니다.`);
      onRefresh();
      onClose();
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("변경 중 오류가 발생했습니다.");
    }
  };

  const handleAdminVerify = () => {
    if (password === ADMIN_PASSWORD) {
      executeStatusChange(pendingStatus);
      setShowPasswordInput(false);
      setPassword("");
    } else {
      alert("비밀번호가 일치하지 않습니다! 🐧💦");
      setPassword("");
    }
  };

  // [수정 포인트] k.category 값을 읽어서 스타일을 결정합니다
  const getTagStyle = (category) => {
    const cleanCategory = category?.trim();
    if (cleanCategory === "기술") return "bg-blue-950/30 text-blue-400 border-blue-800/30";
    if (cleanCategory === "경험") return "bg-amber-950/30 text-amber-500 border-amber-800/30";
    return "bg-rose-950/30 text-rose-400 border-rose-800/30"; // 인성 및 기타
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative">
        
        {showPasswordInput && (
          <div className="absolute inset-0 z-10 bg-slate-900/98 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm text-center">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-500/20 animate-pulse">
                <AlertTriangle className="text-amber-500" size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">최종 결과 처리 완료 지원자</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">이미 <span className="text-amber-400 font-bold">[{applicant.status}]</span> 처리가 끝난 지원자입니다.<br/>상태를 강제로 변경하려면 관리자 패스코드를 입력하세요.</p>
              <div className="relative mb-6">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdminVerify()} placeholder="관리자 패스코드 입력" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-slate-600" autoFocus />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowPasswordInput(false); setPassword(""); }} className="flex-1 py-4 bg-slate-800 text-slate-300 font-black rounded-2xl hover:bg-slate-750 transition-all">변경 취소</button>
                <button onClick={handleAdminVerify} className="flex-1 py-4 bg-amber-600 text-white font-black rounded-2xl hover:bg-amber-500 shadow-lg shadow-amber-900/40 transition-all">인증 및 수정</button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-900/20">{applicant.name?.[0]}</div>
            <div>
              <h2 className="text-2xl font-black text-white leading-tight">{applicant.name}</h2>
              <div className="flex items-center gap-2 text-slate-500 text-sm"><Mail size={14} /><span>{applicant.email}</span></div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"><X size={24} /></button>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <div className="mb-10">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">채용 상태 변경</h3>
            <div className="flex flex-wrap gap-2">
              {["서류 접수", "면접 예정", "최종 합격", "불합격"].map((status) => (
                <button key={status} onClick={() => handleStatusClick(status)} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border ${applicant.status === status ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750 hover:text-slate-200"}`}>
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">AI 역량 분석</h3>
            <div className="flex flex-wrap gap-2">
              {applicant.applicant_keywords?.length > 0 ? (
                applicant.applicant_keywords.map((k, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${getTagStyle(k.category)}`}>
                    #{k.keyword}
                  </span>
                ))
              ) : (
                <span className="text-slate-600 text-xs italic">분석된 키워드가 없습니다.</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-slate-800 text-white text-sm font-black rounded-2xl hover:bg-slate-700 transition-all border border-slate-700">닫기</button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;