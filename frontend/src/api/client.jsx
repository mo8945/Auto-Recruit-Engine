// src/api/client.jsx
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// 지원자 목록 가져오기
export const fetchApplicantsApi = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/applicants`);
    return response.data;
  } catch (error) {
    console.error("API 호출 에러 (fetchApplicants):", error);
    throw error;
  }
};

// Gmail 동기화 요청 함수
export const requestSyncApi = async (passcode) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sync`, { 
      passcode: String(passcode) 
    });
    return response.data;
  } catch (error) {
    console.error("API 호출 에러 (requestSync):", error);
    throw error;
  }
};