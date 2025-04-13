import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Async thunk để lấy dữ liệu thống kê student group (giữ nguyên)
export const fetchStudentGroupStats = createAsyncThunk(
  'statistic/fetchStudentGroupStats',
  async ({ period, year, month }, { rejectWithValue }) => {
    try {
      // Tạo query string dựa trên các tham số
      const queryParams = new URLSearchParams();
      if (period) queryParams.append('Period', period);
      if (year) queryParams.append('Year', year);
      if (month) queryParams.append('Month', month);

      const response = await axios.get(`/statistic/student-group?${queryParams.toString()}`);
      return {
        data: response.data.data, // { totalRevenue, studentPercentage }
        month: month || null,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải dữ liệu thống kê');
    }
  }
);

// Async thunk để lấy dữ liệu job theo year và month
export const fetchJobsByYearAndDate = createAsyncThunk(
  'statistic/fetchJobsByYearAndDate',
  async ({ year, date }, { rejectWithValue }) => {
    try {
      // Extract month from the date (format: YYYY-MM-DD)
      const month = date ? parseInt(date.split('-')[1], 10) : null;

      if (!year || !month) {
        throw new Error('Cần cung cấp năm và tháng để lấy dữ liệu job');
      }

      // Tạo query string cho year và month
      const queryParams = new URLSearchParams();
      queryParams.append('year', year);
      queryParams.append('month', month);

      const response = await axios.get(`/job/month?${queryParams.toString()}`);
      
      // Kiểm tra nếu response.data không có thuộc tính data hoặc không phải mảng
      if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Dữ liệu job không hợp lệ');
      }

      return response.data; // Trả về toàn bộ dữ liệu từ API
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải dữ liệu job');
    }
  }
);

const statisticSlice = createSlice({
  name: 'statistic',
  initialState: {
    stats: [], // Lưu trữ danh sách các điểm dữ liệu cho student group
    jobs: [], // Lưu trữ danh sách job
    loading: false,
    error: null,
  },
  reducers: {
    resetStats: (state) => {
      state.stats = [];
      state.jobs = []; // Reset cả jobs
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý khi gọi API lấy thống kê student group
      .addCase(fetchStudentGroupStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentGroupStats.fulfilled, (state, action) => {
        const { data, month } = action.payload;
        // Tạo label cho điểm dữ liệu (chỉ dựa trên month)
        const label = month ? `Tháng ${month}` : 'Kỳ';
        state.stats.push({
          name: label,
          totalRevenue: data.totalRevenue,
          studentPercentage: data.studentPercentage,
        });
        state.loading = false;
      })
      .addCase(fetchStudentGroupStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý khi gọi API lấy dữ liệu job
      .addCase(fetchJobsByYearAndDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobsByYearAndDate.fulfilled, (state, action) => {
        state.jobs = action.payload.data || []; // Lưu dữ liệu job, mặc định là mảng rỗng nếu không có data
        state.loading = false;
      })
      .addCase(fetchJobsByYearAndDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStats } = statisticSlice.actions;
export default statisticSlice.reducer;