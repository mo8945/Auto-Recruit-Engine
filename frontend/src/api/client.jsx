import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// 백엔드 API 주소[cite: 2]
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Vite 전용 환경 변수 불러오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

console.log("Supabase URL 확인:", supabaseUrl);
// Supabase 클라이언트 생성[cite: 5]
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 1. 지원자 목록 가져오기[cite: 2]
export const fetchApplicantsApi = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/applicants`);
    return response.data;
  } catch (error) {
    console.error("API 호출 에러 (fetchApplicants):", error);
    throw error;
  }
};

// 2. Gmail 동기화 요청 함수[cite: 2]
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