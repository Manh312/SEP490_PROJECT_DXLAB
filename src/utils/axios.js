import axios from 'axios';

const BASE_URL = 'https://localhost:9999/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// Hàm để cấu hình interceptor với store (sẽ được gọi từ Store.jsx)
export const configureAxios = (store) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = store.getState().auth.token; // Lấy token từ store
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Xử lý lỗi 401 (tuỳ chọn) nếu token hết hạn
      if (error.response?.status === 401) {
        // Ví dụ: Đăng xuất người dùng hoặc làm mới token
        store.dispatch({ type: 'auth/clearAuthData' }); // Gọi action để xóa auth
      }
      return Promise.reject(
        (error.response && error.response.data) || 'Something went wrong'
      );
    }
  );
};

export default axiosInstance;