import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './components/Header';
import ApplicantTable from './components/ApplicantTable'; 
import DetailModal from './components/DetailModal';
import SearchHeader from './components/SearchHeader'; // 새로 만든 검색 컴포넌트

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const STATUS_OPTIONS = ["전체", "서류 접수", "면접 예정", "최종 합격", "불합격"];

function App() {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [filterStatus, setFilterStatus] = useState("전체");
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태 추가

  // 데이터 가져오기
  const fetchApplicants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applicants`);
      setApplicants(response.data);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // [핵심] 필터링 로직: 상태 필터 + 검색어 필터 통합
  const filteredApplicants = applicants.filter((app) => {
    // 1. 상태 필터링 (전체, 서류 접수 등)
    const matchesStatus = filterStatus === "전체" 
      ? true 
      : (app.status === filterStatus || (filterStatus === "서류 접수" && !app.status));

    // 2. 검색어 필터링 (이름, 이메일, AI 추출 키워드)
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower 
      ? true 
      : (
          app.name?.toLowerCase().includes(searchLower) || 
          app.email?.toLowerCase().includes(searchLower) ||
          app.applicant_keywords?.some(kw => kw.keyword?.toLowerCase().includes(searchLower))
        );

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. 상단 헤더 (동기화 버튼 포함) */}
        <Header onRefresh={fetchApplicants} />
        
        {/* 2. 검색 헤더 컴포넌트 (검색어 입력 및 통계) */}
        <SearchHeader 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          totalCount={applicants.length}
          filteredCount={filteredApplicants.length}
        />

        <div className="mt-8 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white mb-2">지원자 관리 현황</h1>
            <p className="text-slate-500 text-sm">상태별 필터를 적용하여 명단을 관리하세요.</p>
          </div>
          
          {/* 3. 게시판용 상태 필터 탭 */}
          <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-slate-800 rounded-2xl w-fit backdrop-blur-md">
            {STATUS_OPTIONS.map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
                  filterStatus === status 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* 4. 게시판 리스트 영역 */}
        <div className="bg-slate-900/20 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm">
          {filteredApplicants.length > 0 ? (
            <ApplicantTable 
              applicants={filteredApplicants} 
              onApplicantClick={setSelectedApplicant} 
            />
          ) : (
            <div className="py-32 text-center">
              <p className="text-slate-600 font-bold text-lg">조건에 맞는 지원자가 없습니다. 🐧</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. 상세 모달 */}
      {selectedApplicant && (
        <DetailModal 
          applicant={selectedApplicant} 
          onClose={() => setSelectedApplicant(null)} 
          onRefresh={fetchApplicants}
        />
      )}
    </div>
  );
}

export default App;