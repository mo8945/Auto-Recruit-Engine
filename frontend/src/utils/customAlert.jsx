import { toast } from 'react-hot-toast';
import React from 'react';

/**
 * 🐧 1. 단순 안내/경고용 알림창 (확인 버튼 클릭 시 종료)
 * @param {string} message - 사용자에게 보여줄 안내 문구
 */
export const showSuccessAlert = (message) => {
  toast((t) => (
    <div className="flex flex-col gap-3 p-1 text-slate-100 text-left">
      <p className="font-bold text-sm leading-relaxed text-blue-400 whitespace-pre-line">
        ℹ️ {message}
      </p>
      <div className="flex justify-end mt-1">
        <button 
          onClick={() => toast.dismiss(t.id)}
          className="px-4 py-1.5 text-xs bg-blue-600 rounded-xl text-white font-black active:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all"
        >
          확인
        </button>
      </div>
    </div>
  ), {
    duration: Infinity, // 사용자가 확인을 누를 때까지 굳건히 대기 (모바일 멈춤 원천 차단!)
    position: 'top-center',
    style: {
      background: '#0f172a', 
      border: '1px solid #1e293b',
      borderRadius: '1rem',
      padding: '12px',
      minWidth: '280px'
    }
  });
};

/**
 * 🐧 2. 데이터 보호/삭제용 최종 확인창 (확인/취소 버튼 분기)
 * @param {string} message - 위기 경고 문구
 * @param {function} onConfirm - [확인]을 눌렀을 때 실행할 진짜 비즈니스 로직 함수
 */
export const showConfirmAlert = (message, onConfirm) => {
  toast((t) => (
    <div className="flex flex-col gap-3 p-1 text-slate-100 text-left">
      <p className="font-bold text-sm leading-relaxed text-red-400 whitespace-pre-line">
        ⚠️ {message}
      </p>
      <div className="flex justify-end gap-2 mt-1">
        <button 
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1.5 text-xs bg-slate-800 rounded-xl text-slate-400 font-bold active:bg-slate-700 transition-all"
        >
          취소
        </button>
        <button 
          onClick={() => {
            toast.dismiss(t.id);
            if (onConfirm) onConfirm(); // 제자님이 던져준 진짜 실행 함수 가동!
          }}
          className="px-3 py-1.5 text-xs bg-red-600 rounded-xl text-white font-black active:bg-red-700 shadow-lg shadow-red-900/20 transition-all"
        >
          확인
        </button>
      </div>
    </div>
  ), {
    duration: Infinity, // 반응할 때까지 화면 상단에서 대기
    position: 'top-center',
    style: {
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '1rem',
      padding: '12px',
      minWidth: '280px'
    }
  });
};