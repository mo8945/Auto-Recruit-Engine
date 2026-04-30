import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import ApplicantTable from './components/ApplicantTable'; 
import DetailModal from './components/DetailModal';
import SearchHeader from './components/SearchHeader';
import PasscodeModal from './components/PasscodeModal';
import { fetchApplicantsApi, requestSyncApi } from './api/client';

const STATUS_OPTIONS = ["전체", "서류 접수", "면접 예정", "최종 합격", "불합격"];

function App() {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [filterStatus, setFilterStatus] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchApplicantsApi();
      setApplicants(data);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSyncExecute = async (passcode) => {
    setIsSyncing(true);
    try {
      const result = await requestSyncApi(passcode);
      alert(result.message);
      setShowAuthModal(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || "동기화 실패");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesStatus = filterStatus === "전체" 
      ? true 
      : (app.status === filterStatus || (filterStatus === "서류 접수" && !app.status));

    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return matchesStatus;

    const matchesSearch = 
      app.name?.toLowerCase().includes(searchLower) || 
      app.email?.toLowerCase().includes(searchLower) ||
      app.applicant_keywords?.some(kw => kw.keyword?.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Header onRefresh={() => setShowAuthModal(true)} isSyncing={isSyncing} />
        <SearchHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} totalCount={applicants.length} filteredCount={filteredApplicants.length} />

        <div className="mt-8 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white mb-2">지원자 관리 현황</h1>
            <p className="text-slate-500 text-sm">인사팀 전용 대시보드입니다. 🐧</p>
          </div>
          <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-slate-800 rounded-2xl w-fit backdrop-blur-md">
            {STATUS_OPTIONS.map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${filterStatus === status ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/20 rounded-4xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm">
          {filteredApplicants.length > 0 ? (
            <ApplicantTable applicants={filteredApplicants} onApplicantClick={setSelectedApplicant} />
          ) : (
            <div className="py-32 text-center">
              <p className="text-slate-600 font-bold text-lg">조건에 맞는 지원자가 없습니다. 🐧</p>
            </div>
          )}
        </div>
      </div>

      {showAuthModal && <PasscodeModal onConfirm={handleSyncExecute} onClose={() => setShowAuthModal(false)} />}
      {selectedApplicant && <DetailModal applicant={selectedApplicant} onClose={() => setSelectedApplicant(null)} onRefresh={loadData} />}
    </div>
  );
}

export default App;