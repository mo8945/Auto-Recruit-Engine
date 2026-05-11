// src/components/PasscodeModal.jsx
import React, { useState } from 'react';

const PasscodeModal = ({ onConfirm, onClose }) => {
  const [input, setInput] = useState("");

  // 엔터 키를 눌렀을 때도 확인 버튼이 눌리게 하면 더 편해요!
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onConfirm(input);
  };

  return (
    // z-50을 추가하여 모든 요소보다 위에 뜨게 강제합니다.[cite: 10]
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-xs transform transition-all scale-105">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-3">
            <span className="text-2xl">🔐</span>
          </div>
          <h3 className="text-xl font-black text-white">인증 번호 입력</h3>
          <p className="text-slate-500 text-xs mt-1">인사팀 전용 비밀번호가 필요합니다.</p>
        </div>

        <input 
          type="password" 
          className="bg-slate-800 border border-slate-700 text-white p-4 w-full mb-6 rounded-2xl text-center text-2xl tracking-[1em] focus:outline-none focus:border-blue-500 transition-colors"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder="****"
          autoFocus
        />

        <div className="flex gap-3">
          <button 
            className="flex-1 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-colors" 
            onClick={onClose}
          >
            취소
          </button>
          <button 
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/40 transition-all active:scale-95" 
            onClick={() => onConfirm(input)}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasscodeModal;