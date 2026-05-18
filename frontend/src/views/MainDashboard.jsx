import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import ApplicantTable from '../components/list/ApplicantTable';
import DetailModal from '../components/detail/DetailModal';
import SearchHeader from '../components/list/SearchHeader';
import PasscodeModal from '../components/common/PasscodeModal';
import VisualizationView from '../components/list/VisualizationView';
import { fetchApplicantsApi, requestSyncApi, clearAllDataApi } from '../api/client';

const MainDashboard = ({ user, profile, onLogout }) => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [view, setView] = useState("list"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("전체");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false); 
  const [isSyncing, setIsSyncing] = useState(false);

  const isHRCheck = 
    profile?.role === 'hr' || 
    profile?.department?.includes('인사') || 
    profile?.department?.includes('HR');

  const loadData = async () => {
    try {
      const data = await fetchApplicantsApi();
      setApplicants(data || []);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncExecute = async () => {
    setIsSyncing(true);
    try {
      await requestSyncApi();
      await loadData();
    } catch (error) {
      console.error("동기화 실패:", error);
    } finally {
      setIsSyncing(false);
      setShowAuthModal(false);
    }
  };

  const handleSeasonClean = async () => {
    try {
      await clearAllDataApi();
      setApplicants([]);
    } catch (error) {
      console.error("초기화 실패:", error);
    } finally {
      setShowAdminModal(false);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = 
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === "전체" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased flex flex-col justify-between">
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col space-y-6 md:space-y-10">
        <Header 
          onRefresh={() => setShowAuthModal(true)}
          isSyncing={isSyncing}
          currentView={view}
          setView={setView}
          profile={profile}
          onLogout={onLogout}
        />

        <main className="flex-1 flex flex-col space-y-5 md:space-y-8">
          <SearchHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalCount={applicants.length}
            filteredCount={filteredApplicants.length}
          />

          <div className="bg-slate-900/10 border border-white/2 p-4 md:p-6 rounded-4xl backdrop-blur-md flex flex-col gap-4 md:gap-6">
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1 text-left">Status Filter</p>
              <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2.5">
                {["전체", "서류 접수", "면접 예정", "최종 합격", "불합격"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`w-full md:w-auto px-2 md:px-6 py-2 rounded-2xl text-xs md:text-sm font-bold transition-all border text-center ${
                      filterStatus === status
                        ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* 📊 코어 데이터 프리젠테이션 레이어 */}
            {view === "list" ? (
              <div className="w-full max-w-5xl mx-auto">
                {/* 🐧 모바일에선 매끄럽게 가로 스크롤을 켜고, 둥근 테두리가 스크롤 영역과 딱 맞아떨어지게 설정 */}
                <div className="w-full overflow-x-auto bg-slate-900/20 rounded-4xl border border-slate-800 shadow-2xl backdrop-blur-sm">
                  {/* 🐧 모바일 환경에서 가로로 밀 때 글자가 깨지거나 우측에 유령 빈 여백이 생기지 않도록 최소 폭 850px 강제 부여 */}
                  <div className="min-w-212.5 w-full">
                    <ApplicantTable 
                      applicants={filteredApplicants} 
                      onApplicantClick={setSelectedApplicant} 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <VisualizationView applicants={filteredApplicants} />
            )}
          </div>
        </main>

        {isHRCheck && (
          <div className="mt-6 md:mt-12 w-full max-w-7xl mx-auto bg-red-950/5 border border-red-900/20 p-4 md:p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left w-full md:w-auto">
              <h3 className="text-red-500/80 font-bold mb-1 flex items-center gap-2 text-sm md:text-base">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Admin Security Zone
              </h3>
              <p className="text-slate-500 text-[11px] md:text-xs max-w-md leading-relaxed">
                인사팀 전용 데이터 관리 구역입니다. 공채 시즌이 종료된 경우 개인정보 보호를 위해 DB를 초기화하십시오. 이 작업은 로그를 남기지 않습니다.
              </p>
            </div>
            <button 
              onClick={() => setShowAdminModal(true)}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-600 hover:text-white transition-all font-black text-xs md:text-sm tracking-tight whitespace-nowrap text-center"
            >
              시즌 데이터 전체 초기화 (Season Clean)
            </button>
          </div>
        )}
      </div>

      {showAuthModal && (
        <PasscodeModal onConfirm={handleSyncExecute} onClose={() => setShowAuthModal(false)} />
      )}
      {showAdminModal && (
        <PasscodeModal onConfirm={handleSeasonClean} onClose={() => setShowAdminModal(false)} />
      )}
      {selectedApplicant && (
        <DetailModal applicant={selectedApplicant} onClose={() => setSelectedApplicant(null)} onUpdate={loadData} />
      )}
    </div>
  );
};

export default MainDashboard;