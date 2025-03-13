import axios from 'axios';

const BASE_URL = 'https://localhost:9999/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

axios.interceptors.response.use(
  (response) => response,
  (error) => 
    Promise.reject(
      (error.response && error.response.data) || 'Something went wrong'
    )
);

export default axiosInstance;