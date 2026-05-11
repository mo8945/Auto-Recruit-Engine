import React from 'react';
import { Sparkles, Tag } from 'lucide-react';

export default function AIEvaluationSection({ applicant }) {
  if (!applicant) return <div className="text-slate-500 py-10 text-center">데이터 로드 중...</div>;

  // 🐧 강사님 피드백 반영: 객체 접근 방식
  const summaryText = 
    applicant?.resumes?.summary_text || 
    applicant?.summary_text || 
    "AI 분석 데이터가 존재하지 않습니다. 🐧";

  // 🐧 [색상 수정 포인트] 기술/개발 카테고리를 형광색으로!
  const getKeywordStyle = (category) => {
    switch (category) {
      case '인성': 
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case '기술':
      case '개발': 
        return 'bg-rose-500/20 text-rose-300 border-rose-400/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]';
      case '경험': 
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: 
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      {/* AI 요약 카드 */}
      <div className="bg-slate-800/30 p-8 rounded-3xl border border-slate-800/50 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="text-blue-400" size={22} />
          <h3 className="text-xl font-black text-white">AI 역량 평가 요약</h3>
        </div>
        
        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium text-[15.5px]">
          {summaryText}
        </p>
      </div>

      {/* 분석 핵심 키워드 영역 */}
      <div className="px-2">
        <div className="flex items-center gap-2 mb-5">
          <Tag className="text-slate-500" size={18} />
          <h3 className="text-md font-bold text-slate-400 uppercase tracking-tight">Analysis Keywords</h3>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {applicant.applicant_keywords && applicant.applicant_keywords.length > 0 ? (
            applicant.applicant_keywords.map((item, i) => (
              <span 
                key={i} 
                className={`px-5 py-2.5 rounded-2xl text-xs font-black border transition-all hover:scale-110 shadow-lg ${getKeywordStyle(item.category)}`}
              >
                <span className="opacity-70 mr-1.5">[{item.category}]</span>
                {item.keyword}
              </span>
            ))
          ) : (
            <span className="text-slate-500 text-sm italic">추출된 분석 키워드가 없습니다.</span>
          )}
        </div>
      </div>
    </div>
  );
}