import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const VisualizationView = ({ applicants }) => {
  // 1. 기술 키워드 통계 계산
  const techCounts = {};
  applicants.forEach(app => {
    app.applicant_keywords?.forEach(kw => {
      if (kw.category === "기술") {
        const name = kw.keyword?.trim();
        techCounts[name] = (techCounts[name] || 0) + 1;
      }
    });
  });

  const techLabels = Object.keys(techCounts).sort((a, b) => techCounts[b] - techCounts[a]).slice(0, 15);
  const techData = techLabels.map(label => techCounts[label]);

  // 2. 지원자 상태 현황 계산
  const statusCounts = {
    "서류 접수": 0,
    "면접 예정": 0,
    "최종 합격": 0,
    "불합격": 0
  };
  
  applicants.forEach(app => {
    const status = app.status || "서류 접수";
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    }
  });

  // 공통 차트 옵션 (가로를 꽉 채우기 위해 maintainAspectRatio 조절)
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false, // 이 설정이 있어야 높이를 자유롭게 조절 가능합니다.
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#64748b', stepSize: 1 },
        grid: { color: 'rgba(51, 65, 85, 0.3)' }
      },
      x: {
        ticks: { color: '#f1f5f9', font: { size: 11 } },
        grid: { display: false }
      }
    }
  };

  const techChartData = {
    labels: techLabels,
    datasets: [{
      label: '인원 (명)',
      data: techData,
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const statusChartData = {
    labels: Object.keys(statusCounts),
    datasets: [{
      label: '인원 (명)',
      data: Object.values(statusCounts),
      backgroundColor: [
        'rgba(59, 130, 246, 0.6)', // 서류 접수 (파랑)
        'rgba(245, 158, 11, 0.6)', // 면접 예정 (주황)
        'rgba(34, 197, 94, 0.6)',  // 최종 합격 (초록)
        'rgba(239, 68, 68, 0.6)'   // 불합격 (빨강)
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(245, 158, 11)',
        'rgb(34, 197, 94)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  return (
    <div className="mt-8 flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-4xl backdrop-blur-sm">
        <h1 className="text-2xl font-black text-white mb-2">인재 풀 분석 리포트</h1>
        <p className="text-slate-500 text-sm mb-10">AI 에이전트 기반 실시간 채용 현황 통계입니다.</p>
        
        {/* 첫 번째 차트: 기술 스택 분포 */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            핵심 기술 역량 보유 현황 (Top 15)[cite: 5]
          </h3>
          <div className="h-[400px] w-full"> {/* 높이를 고정하여 세로 비율 조정 */}
            <Bar data={techChartData} options={commonOptions} />
          </div>
        </div>

        <hr className="border-slate-800 mb-12" />

        {/* 두 번째 차트: 지원자 상태 현황 */}
        <div>
          <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            채용 프로세스 단계별 현황[cite: 5]
          </h3>
          <div className="h-[400px] w-full">
            <Bar data={statusChartData} options={commonOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationView;