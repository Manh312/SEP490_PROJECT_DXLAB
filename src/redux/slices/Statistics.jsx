import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Async thunk để lấy dữ liệu thống kê
export const fetchStudentGroupStats = createAsyncThunk(
  'statistic/fetchStudentGroupStats',
  async ({ period, year, month, week }, { rejectWithValue }) => {
    try {
      // Tạo query string dựa trên các tham số
      const queryParams = new URLSearchParams();
      if (period) queryParams.append('Period', period);
      if (year) queryParams.append('Year', year);
      if (month) queryParams.append('Month', month);
      if (week) queryParams.append('Week', week);

      const response = await axios.get(`/statistic/student-group?${queryParams.toString()}`);
      return {
        data: response.data.data, // { totalRevenue, studentPercentage }
        month: month || null,
        week: week || null,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải dữ liệu thống kê');
    }
  }
);

const statisticSlice = createSlice({
  name: 'statistic',
  initialState: {
    stats: [], // Lưu trữ danh sách các điểm dữ liệu
    loading: false,
    error: null,
  },
  reducers: {
    resetStats: (state) => {
      state.stats = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý khi gọi API lấy thống kê
      .addCase(fetchStudentGroupStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentGroupStats.fulfilled, (state, action) => {
        const { data, month, week } = action.payload;
        // Tạo label cho điểm dữ liệu (dựa trên month hoặc week)
        const label = month ? `Tháng ${month}` : week ? `Tuần ${week}` : 'Kỳ';
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
      });
  },
});

export const { resetStats } = statisticSlice.actions;
export default statisticSlice.reducer;