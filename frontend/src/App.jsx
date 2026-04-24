import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, User, FileText, Mail, Calendar } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchApplicants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applicants`);
      setApplicants(response.data);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/sync-gmail`);
      alert("🎉 새로운 이력서를 모두 동기화했습니다!");
      fetchApplicants();
    } catch (error) {
      alert("동기화 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Auto-Recruit Engine <span className="text-blue-500">.</span>
            </h1>
            <p className="text-slate-400 font-medium">AI 기반 스마트 채용 관리 시스템</p>
          </div>
          <button 
            onClick={handleSync} 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            {loading ? '분석 중...' : '이력서 동기화'}
          </button>
        </header>

        <div className="grid gap-6">
          {applicants.length > 0 ? applicants.map((app) => (
            <div key={app.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-blue-400">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{app.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Mail size={14}/> {app.email}</span>
                      <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold uppercase">
                  {app.status}
                </span>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                <div className="flex items-start gap-3 text-slate-300 italic">
                  <FileText size={18} className="text-blue-500 mt-1 shrink-0" />
                  <p>{app.resumes?.[0]?.summary_text || "분석 내용 없음"}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800 text-slate-500">
              지원자가 없습니다. 동기화 버튼을 눌러보세요!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;