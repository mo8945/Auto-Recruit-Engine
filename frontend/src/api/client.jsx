import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// 🐧 백엔드 API 주소 (FastAPI)
const API_BASE_URL = 'https://auto-recruit-backend.onrender.com';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * 1. 지원자 목록 가져오기
 */
export const fetchApplicantsApi = async () => {
  try {
    const { data, error } = await supabase
      .from('applicants')
      .select(`
        *,
        applicant_keywords (*),
        resumes (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ [client.jsx] Supabase 로드 에러:", error);
    throw error;
  }
};

/**
 * 2. 지원자 상태 업데이트 (422 에러 해결 지점! 🐧)
 * 백엔드 터미널 로그에 맞춰 'status_update'라는 키로 감싸서 보냅니다.
 */
export const updateApplicantStatusApi = async (applicantId, newStatus) => {
  try {
    // 🕵️‍♂️ 터미널 에러 loc: ['body', 'status_update'] 를 해결하는 유일한 구조
    const response = await axios.patch(
      `${API_BASE_URL}/applicants/${applicantId}/status`, 
      {
        status: String(newStatus) // 백엔드 StatusUpdateRequest 모델이 status 필드만 가진 경우
      }
    );
    return response.data;
  } catch (error) {
    console.error("상태 변경 상세 에러:", error.response?.data);
    throw error;
  }
};

/**
 * 3. Gmail 동기화 요청
 */
export const requestSyncApi = async (passcode) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sync`, { 
      passcode: String(passcode) 
    });
    return response.data;
  } catch (error) {
    console.error("❌ [동기화 에러]:", error.response?.data || error.message);
    throw error;
  }
};

export const clearAllDataApi = async (passcode) => {
  try {
    // 🐧 [확인용] 버튼 누르는 순간 브라우저 콘솔(F12)에 찍힙니다.
    console.log("🚀 [백엔드로 전송 시도] Passcode:", passcode);
    console.log("📍 [전송 주소]:", `${API_BASE_URL}/api/admin/clear-all`);

    const response = await axios.post(`${API_BASE_URL}/api/admin/clear-all`, { 
      passcode: String(passcode) // 명시적으로 문자열 변환
    });
    
    return response.data;
  } catch (error) {
    // 에러 발생 시 백엔드가 뭐라고 대답했는지 콘솔에 상세히 찍어줍니다.
    console.error("❌ 초기화 에러 상세:", error.response?.data);
    throw error;
  }
};