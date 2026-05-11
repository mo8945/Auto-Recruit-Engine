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

  // 🐧 [Security] 인사팀 권한 체크 로직
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

  useEffect(() => { loadData(); }, []);

  // 1. 메일 동기화 실행
  const handleSyncExecute = async (passcode) => {
    try {
      setIsSyncing(true);
      setShowAuthModal(false);
      await requestSyncApi(passcode);
      alert("동기화가 완료되었습니다! 🐧");
      await loadData();
    } catch (error) {
      alert("동기화 실패: 패스코드를 확인해주세요.");
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. 시즌 데이터 전체 초기화 (Season Clean)
  const handleSeasonClean = async (passcode) => {
    if (!window.confirm("❗ [영구 삭제 경고]\n정말로 모든 지원자 데이터를 삭제하시겠습니까?\n이 작업은 절대 되돌릴 수 없으며, 모든 분석 결과가 파기됩니다.")) {
      return;
    }

    try {
      setIsSyncing(true);
      setShowAdminModal(false);
      await clearAllDataApi(passcode);
      alert("공채 시즌 데이터가 성공적으로 초기화되었습니다. 🧹");
      await loadData(); 
    } catch (error) {
      // 🐧 서버 에러(UUID 타입 등) 발생 시에도 사용자에게 안내
      alert("초기화 실패: 권한이 없거나 서버 오류가 발생했습니다.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const search = searchTerm.toLowerCase();
    const statusMatch = filterStatus === "전체" || app.status === filterStatus;
    const nameMatch = app.name?.toLowerCase().includes(search);
    const emailMatch = app.email?.toLowerCase().includes(search);
    const keywordMatch = app.applicant_keywords?.some(k => 
      k.keyword?.toLowerCase().includes(search)
    );

    return statusMatch && (nameMatch || emailMatch || keywordMatch);
  });

  return (
    <div className="relative min-h-screen bg-slate-950 text-white p-8">
      
      {/* 로딩 오버레이 */}
      {isSyncing && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-black text-white mb-2 animate-pulse">
            데이터를 처리 중입니다
          </h2>
          <p className="text-slate-400 font-medium">잠시만 기다려 주세요! 🐧</p>
          <div className="w-64 h-1.5 bg-slate-800 rounded-full mt-8 overflow-hidden">
            <div className="h-full bg-blue-500 animate-loading-bar"></div>
          </div>
        </div>
      )}

      <Header 
        onRefresh={() => setShowAuthModal(true)}
        isSyncing={isSyncing}
        currentView={view}
        setView={setView}
        profile={profile}
        onLogout={onLogout}
      />
      
      <div className="max-w-7xl mx-auto mt-12">
        <SearchHeader 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          totalCount={applicants.length}
          filteredCount={filteredApplicants.length}
        />

        {/* 상태 필터 버튼 */}
        <div className="mb-8 px-4 py-6 bg-slate-900/20 rounded-3xl border border-slate-800/50">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Status Filter</p>
          <div className="flex flex-wrap gap-3">
            {["전체", "서류 접수", "면접 예정", "최종 합격", "불합격"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border ${
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
        
        {view === "list" ? (
          <div className="bg-slate-900/20 rounded-4xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm">
            <ApplicantTable 
              applicants={filteredApplicants} 
              onApplicantClick={setSelectedApplicant} 
            />
          </div>
        ) : (
          <VisualizationView applicants={filteredApplicants} />
        )}

        {/* 🐧 [Security Check] 인사팀 권한이 있을 때만 하단 관리 섹션 노출 */}
        {isHRCheck && (
          <div className="mt-24 mb-12 pb-12 border-t border-slate-900 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
            <div className="text-left">
              <h3 className="text-slate-400 font-bold mb-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Admin Security Zone
              </h3>
              <p className="text-slate-600 text-xs max-w-md">
                인사팀 전용 데이터 관리 구역입니다. 공채 시즌이 종료된 경우 개인정보 보호를 위해 DB를 초기화하십시오. 이 작업은 로그를 남기지 않습니다.
              </p>
            </div>
            <button 
              onClick={() => setShowAdminModal(true)}
              className="px-8 py-4 rounded-2xl bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-600 hover:text-white transition-all font-black text-sm tracking-tight whitespace-nowrap"
            >
              시즌 데이터 전체 초기화 (Season Clean)
            </button>
          </div>
        )}
      </div>

      {/* 모달 섹션 */}
      {showAuthModal && (
        <PasscodeModal onConfirm={handleSyncExecute} onClose={() => setShowAuthModal(false)} />
      )}

      {showAdminModal && (
        <PasscodeModal onConfirm={handleSeasonClean} onClose={() => setShowAdminModal(false)} />
      )}

      {selectedApplicant && (
        <DetailModal 
          applicant={selectedApplicant} 
          userProfile={profile}
          onClose={() => setSelectedApplicant(null)} 
          onRefresh={loadData}
        />
      )}
    </div>
  );
};

export default MainDashboard;