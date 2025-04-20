import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Async thunk để lấy dữ liệu thống kê student group
export const fetchStudentGroupStats = createAsyncThunk(
  'statistic/fetchStudentGroupStats',
  async ({ period, year, month }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (period) queryParams.append('Period', period);
      if (year) queryParams.append('Year', year);
      if (month) queryParams.append('Month', month);

      const response = await axios.get(`/statistic/student-group?${queryParams.toString()}`);
      return {
        data: response.data.data,
        month: month || null,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải dữ liệu thống kê');
    }
  }
);

// Async thunk để lấy dữ liệu job theo year và month
export const fetchJobsByYearAndMonth = createAsyncThunk(
  'statistic/fetchJobsByYearAndMonth',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const yearInt = parseInt(year, 10);
      const monthInt = month ? parseInt(month, 10) : null;

      if (isNaN(yearInt) || (month && isNaN(monthInt))) {
        throw new Error('Year và Month phải là số nguyên hợp lệ');
      }

      const queryParams = new URLSearchParams();
      queryParams.append('year', yearInt);
      if (monthInt) queryParams.append('month', monthInt);

      const response = await axios.get(`/job/month?${queryParams.toString()}`);

      const jobData = Array.isArray(response.data) ? response.data : response.data?.data;

      if (!jobData || !Array.isArray(jobData)) {
        throw new Error('Dữ liệu job không hợp lệ');
      }

      const normalizedData = jobData.map(job => ({
        summaryExpenseId: typeof job.sumaryExpenseId === 'number' ? job.sumaryExpenseId : parseInt(job.sumaryExpenseId) || 0,
        summaryDate: job.sumaryDate || '',
        amount: typeof job.amout === 'string' ? parseFloat(job.amout) || 0 : job.amout || 0,
        faciCategory: typeof job.faciCategory === 'number' ? job.faciCategory : parseInt(job.faciCategory) || 0,
      }));

      return { data: normalizedData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải dữ liệu job');
    }
  }
);

// Async thunk để lấy dữ liệu job theo year
export const fetchJobsByYear = createAsyncThunk(
  'statistic/fetchJobsByYear',
  async ({ year }, { rejectWithValue }) => {
    try {
      const yearInt = parseInt(year, 10);

      if (isNaN(yearInt)) {
        throw new Error('Year phải là số nguyên hợp lệ');
      }

      const queryParams = new URLSearchParams();
      queryParams.append('year', yearInt);

      const response = await axios.get(`/job/year?${queryParams.toString()}`);

      const jobData = response.data?.data;

      if (!jobData || !Array.isArray(jobData)) {
        throw new Error('Dữ liệu job theo năm không hợp lệ');
      }

      const normalizedData = jobData.map(job => ({
        summaryExpenseId: typeof job.sumaryExpenseId === 'number' ? job.sumaryExpenseId : parseInt(job.sumaryExpenseId) || 0,
        summaryDate: job.sumaryDate || '',
        amount: typeof job.amout === 'string' ? parseFloat(job.amout) || 0 : job.amout || 0,
        faciCategory: typeof job.faciCategory === 'number' ? job.faciCategory : parseInt(job.faciCategory) || 0,
      }));

      return { data: normalizedData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải dữ liệu job theo năm');
    }
  }
);

// Async thunk để lấy dữ liệu khấu hao theo year và month
export const fetchDepreciationsByYearAndMonth = createAsyncThunk(
  'statistic/fetchDepreciationsByYearAndMonth',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const yearInt = parseInt(year, 10);
      const monthInt = month ? parseInt(month, 10) : null;

      if (isNaN(yearInt) || (month && isNaN(monthInt))) {
        throw new Error('Year và Month phải là số nguyên hợp lệ');
      }

      const queryParams = new URLSearchParams();
      queryParams.append('year', yearInt);
      if (monthInt) queryParams.append('month', monthInt);

      const response = await axios.get(`/depreciation/month?${queryParams.toString()}`);

      const depreciationData = Array.isArray(response.data) ? response.data : response.data?.data;

      if (!depreciationData || !Array.isArray(depreciationData)) {
        throw new Error('Dữ liệu khấu hao không hợp lệ');
      }

      const normalizedData = depreciationData.map(item => ({
        depreciationSumId: typeof item.depreciationSumId === 'number' ? item.depreciationSumId : parseInt(item.depreciationSumId) || 0,
        sumDate: item.sumDate || '',
        batchNumber: item.batchNumber || 0,
        depreciationAmount: typeof item.depreciationAmount === 'string' ? parseFloat(item.depreciationAmount) || 0 : item.depreciationAmount || 0,
        facilityCategory: typeof item.facilityCategory === 'number' ? item.facilityCategory : parseInt(item.facilityCategory) || 0,
        facilityTitle: item.facilityTitle || '',
      }));

      return { data: normalizedData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải dữ liệu khấu hao');
    }
  }
);

// Async thunk để lấy dữ liệu khấu hao theo year
export const fetchDepreciationsByYear = createAsyncThunk(
  'statistic/fetchDepreciationsByYear',
  async ({ year }, { rejectWithValue }) => {
    try {
      const yearInt = parseInt(year, 10);

      if (isNaN(yearInt)) {
        throw new Error('Year phải là số nguyên hợp lệ');
      }

      const queryParams = new URLSearchParams();
      queryParams.append('year', yearInt);

      const response = await axios.get(`/depreciation/year?${queryParams.toString()}`);

      const depreciationData = response.data?.data;

      if (!depreciationData || !Array.isArray(depreciationData)) {
        throw new Error('Dữ liệu khấu hao theo năm không hợp lệ');
      }

      const normalizedData = depreciationData.map(item => ({
        depreciationSumId: typeof item.depreciationSumId === 'number' ? item.depreciationSumId : parseInt(item.depreciationSumId) || 0,
        sumDate: item.sumDate || '',
        batchNumber: item.batchNumber || 0,
        depreciationAmount: typeof item.depreciationAmount === 'string' ? parseFloat(item.depreciationAmount) || 0 : item.depreciationAmount || 0,
        facilityCategory: typeof item.facilityCategory === 'number' ? item.facilityCategory : parseInt(item.facilityCategory) || 0,
        facilityTitle: item.facilityTitle || '',
      }));

      return { data: normalizedData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải dữ liệu khấu hao theo năm');
    }
  }
);

// Async thunk để lấy dữ liệu tỷ lệ sử dụng theo year và month
export const fetchUtilizationRateByYearAndMonth = createAsyncThunk(
  'statistic/fetchUtilizationRateByYearAndMonth',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const yearInt = parseInt(year, 10);
      const monthInt = month ? parseInt(month, 10) : null;

      if (isNaN(yearInt) || (month && isNaN(monthInt))) {
        throw new Error('Year và Month phải là số nguyên hợp lệ');
      }

      const queryParams = new URLSearchParams();
      queryParams.append('year', yearInt);
      if (monthInt) queryParams.append('month', monthInt);

      const response = await axios.get(`/ultilizationrate/month?${queryParams.toString()}`);
      const utilizationData = response.data?.data;

      if (!utilizationData || !Array.isArray(utilizationData)) {
        throw new Error('Dữ liệu tỷ lệ sử dụng không hợp lệ');
      }

      // Chuẩn hóa dữ liệu, chỉ giữ các phần tử có thDate hợp lệ
      const normalizedData = utilizationData
        .filter(item => item.thDate && !isNaN(new Date(item.thDate).getTime())) // Lọc các phần tử có thDate hợp lệ
        .map(item => ({
          theDate: item.thDate, // Giữ nguyên thDate nếu hợp lệ
          roomId: typeof item.roomId === 'number' ? item.roomId : parseInt(item.roomId) || 0,
          roomName: item.roomName || '',
          areaId: typeof item.areaId === 'number' ? item.areaId : parseInt(item.areaId) || 0,
          areaName: item.areaName || '',
          areaTypeId: typeof item.areaTypeId === 'number' ? item.areaTypeId : parseInt(item.areaTypeId) || 0,
          areaTypeName: item.areaTypeName || '',
          areaTypeCategoryId: typeof item.areaTypeCategoryId === 'number' ? item.areaTypeCategoryId : parseInt(item.areaTypeCategoryId) || 0,
          areaTypeCategoryTitle: item.areaTypeCategoryTitle || '',
          rate: typeof item.rate === 'number' ? item.rate : parseFloat(item.rate) || 0,
        }));

      return { data: normalizedData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải dữ liệu tỷ lệ sử dụng');
    }
  }
);

// Async thunk để lấy dữ liệu tỷ lệ sử dụng theo year
export const fetchUtilizationRateByYear = createAsyncThunk(
  'statistic/fetchUtilizationRateByYear',
  async ({ year }, { rejectWithValue }) => {
    try {
      const yearInt = parseInt(year, 10);

      if (isNaN(yearInt)) {
        throw new Error('Year phải là số nguyên hợp lệ');
      }

      const queryParams = new URLSearchParams();
      queryParams.append('year', yearInt);

      const response = await axios.get(`/ultilizationrate/year?${queryParams.toString()}`);
      const utilizationData = response.data?.data;

      if (!utilizationData || !Array.isArray(utilizationData)) {
        throw new Error('Dữ liệu tỷ lệ sử dụng theo năm không hợp lệ');
      }

      // Chuẩn hóa dữ liệu, chỉ giữ các phần tử có thDate hợp lệ
      const normalizedData = utilizationData
        .filter(item => item.thDate && !isNaN(new Date(item.thDate).getTime())) // Lọc các phần tử có thDate hợp lệ
        .map(item => ({
          theDate: item.thDate, // Giữ nguyên thDate nếu hợp lệ
          roomId: typeof item.roomId === 'number' ? item.roomId : parseInt(item.roomId) || 0,
          roomName: item.roomName || '',
          areaId: typeof item.areaId === 'number' ? item.areaId : parseInt(item.areaId) || 0,
          areaName: item.areaName || '',
          areaTypeId: typeof item.areaTypeId === 'number' ? item.areaTypeId : parseInt(item.areaTypeId) || 0,
          areaTypeName: item.areaTypeName || '',
          areaTypeCategoryId: typeof item.areaTypeCategoryId === 'number' ? item.areaTypeCategoryId : parseInt(item.areaTypeCategoryId) || 0,
          areaTypeCategoryTitle: item.areaTypeCategoryTitle || '',
          rate: typeof item.rate === 'number' ? item.rate : parseFloat(item.rate) || 0,
        }));

      return { data: normalizedData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải dữ liệu tỷ lệ sử dụng theo năm');
    }
  }
);

const statisticSlice = createSlice({
  name: 'statistic',
  initialState: {
    stats: [],
    jobs: [],
    jobsByYear: [],
    depreciations: [],
    depreciationsByYear: [],
    utilizationRates: [],
    utilizationRatesByYear: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetStats: (state) => {
      state.stats = [];
      state.jobs = [];
      state.jobsByYear = [];
      state.depreciations = [];
      state.depreciationsByYear = [];
      state.utilizationRates = [];
      state.utilizationRatesByYear = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentGroupStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentGroupStats.fulfilled, (state, action) => {
        const { data, month } = action.payload;
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
      .addCase(fetchJobsByYearAndMonth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobsByYearAndMonth.fulfilled, (state, action) => {
        state.jobs = action.payload.data || [];
        state.loading = false;
      })
      .addCase(fetchJobsByYearAndMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchJobsByYear.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobsByYear.fulfilled, (state, action) => {
        state.jobsByYear = action.payload.data || [];
        state.loading = false;
      })
      .addCase(fetchJobsByYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDepreciationsByYearAndMonth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepreciationsByYearAndMonth.fulfilled, (state, action) => {
        state.depreciations = action.payload.data || [];
        state.loading = false;
      })
      .addCase(fetchDepreciationsByYearAndMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDepreciationsByYear.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepreciationsByYear.fulfilled, (state, action) => {
        state.depreciationsByYear = action.payload.data || [];
        state.loading = false;
      })
      .addCase(fetchDepreciationsByYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUtilizationRateByYearAndMonth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUtilizationRateByYearAndMonth.fulfilled, (state, action) => {
        state.utilizationRates = action.payload.data || [];
        state.loading = false;
      })
      .addCase(fetchUtilizationRateByYearAndMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUtilizationRateByYear.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUtilizationRateByYear.fulfilled, (state, action) => {
        state.utilizationRatesByYear = action.payload.data || [];
        state.loading = false;
      })
      .addCase(fetchUtilizationRateByYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStats } = statisticSlice.actions;
export default statisticSlice.reducer;  