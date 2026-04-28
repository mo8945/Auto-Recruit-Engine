import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './components/Header';
import ApplicantTable from './components/ApplicantTable'; // 새로 만든 컴포넌트
import DetailModal from './components/DetailModal';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const STATUS_OPTIONS = ["전체", "서류 접수", "면접 예정", "최종 합격", "불합격"];

function App() {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [filterStatus, setFilterStatus] = useState("전체");

  // 데이터 가져오기
  const fetchApplicants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applicants`);
      setApplicants(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // 필터링 로직: 선택된 상태에 맞는 지원자만 걸러냅니다.
  const filteredApplicants = filterStatus === "전체" 
    ? applicants 
    : applicants.filter(app => 
        app.status === filterStatus || (filterStatus === "서류 접수" && !app.status)
      );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-300 mx-auto">
        {/* 1. 상단 헤더 (동기화 버튼 포함) */}
        <Header onRefresh={fetchApplicants} />
        
        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-bold text-white mb-6">지원자 관리 게시판</h1>
          
          {/* 2. 게시판용 필터 탭 */}
          <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-slate-800 rounded-2xl w-fit">
            {STATUS_OPTIONS.map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
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

        {/* 3. 게시판 리스트 영역 */}
        <div className="bg-slate-900/20 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <ApplicantTable 
            applicants={filteredApplicants} 
            onApplicantClick={setSelectedApplicant} 
          />
        </div>
      </div>

      {/* 4. 상세 모달 (카드 클릭 시 기존처럼 작동) */}
      {selectedApplicant && (
        <DetailModal 
          applicant={selectedApplicant} 
          onClose={() => setSelectedApplicant(null)} 
          onStatusUpdate={fetchApplicants}
        />
      )}
    </div>
  );
}

export default App;