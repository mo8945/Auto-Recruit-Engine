import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../api/client';
import { Pencil, Trash2, X, Check } from 'lucide-react'; // 아이콘 추가
import { showSuccessAlert } from '../../utils/customAlert';

export default function CommentSection({ applicantId, userProfile, onSaved }) {
  const [commentText, setCommentText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 수정 모드 상태 (null이면 작성 모드, commentId가 있으면 수정 모드)
  const [editingId, setEditingId] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('applicant_id', applicantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("메모 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [applicantId]);

  useEffect(() => {
    if (applicantId) fetchComments();
  }, [applicantId, fetchComments]);

  // 저장 및 수정 통합 함수
  const handleSave = async () => {
    if (!commentText.trim()) return;
    setIsSaving(true);

    try {
      if (editingId) {
        // [U] Update: 기존 메모 수정
        const { error } = await supabase
          .from('comments')
          .update({ content: commentText })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        // [C] Create: 새 메모 작성
        const { error } = await supabase
          .from('comments')
          .insert([{
            applicant_id: applicantId,
            content: commentText.trim(),
            department: userProfile?.department,
            author_id: userProfile?.id // 스키마에 맞춰 author_id 저장
          }]);
        if (error) throw error;
      }

      setCommentText("");
      setEditingId(null);
      fetchComments();
      if (onSaved) onSaved();
    } catch (error) {
      alert("작업 실패: " + error.message);
      showSuccessAlert(`작업실패\n사유: ${error.message}`)
    } finally {
      setIsSaving(false);
    }
  };

  // [D] Delete: 메모 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("이 메모를 삭제하시겠습니까?")) return;
    
    try {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
      fetchComments();
      if (onSaved) onSaved();
    } catch (error) {
      showSuccessAlert(`삭제실패\n사유: ${error.message}`)
    }
  };

  // 수정 버튼 클릭 시
  const startEdit = (comment) => {
    setEditingId(comment.id);
    setCommentText(comment.content);
    // 입력창으로 스크롤 이동 (선택사항)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-8">
      {/* 입력 영역 */}
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 shadow-inner">
        <label className="block text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">
          {editingId ? "메모 수정하기" : "새로운 의견 작성"}
        </label>
        <textarea 
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 text-sm min-h-30 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="지원자에 대한 평가를 남겨주세요..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          {editingId && (
            <button 
              onClick={() => { setEditingId(null); setCommentText(""); }}
              className="px-6 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <X size={16} /> 취소
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving || !commentText.trim()}
            className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            {editingId ? <><Check size={16} /> 수정 완료</> : "메모 저장"}
          </button>
        </div>
      </div>

      {/* 리스트 영역 */}
      <div className="mt-10 pt-8 border-t border-slate-800/50">
        <h4 className="text-slate-400 text-[11px] font-black uppercase mb-6 tracking-widest">
          부서별 평가 기록 ({comments.length})
        </h4>
        
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div key={comment.id} className="group p-5 bg-slate-950/50 border border-slate-800/50 rounded-2xl hover:border-slate-700 transition-all relative">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-slate-800 text-blue-400 text-[10px] font-black rounded-lg">
                    {comment.department}
                  </span>
                  <span className="text-slate-600 text-[10px]">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* 🐧 본인이 쓴 글일 때만 수정/삭제 버튼 노출 */}
                {comment.author_id === userProfile.id && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(comment)}
                      className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                      title="수정"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      title="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}