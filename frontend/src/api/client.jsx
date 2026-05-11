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
    const response = await axios.post(`${API_BASE_URL}/admin/clear-all`, {
      passcode: String(passcode)
    });
    return response.data;
  } catch (error) {
    console.error("삭제 에러")
    throw error;
  }
};