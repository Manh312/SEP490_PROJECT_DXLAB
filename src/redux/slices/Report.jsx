import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Async thunk để tạo một báo cáo mới (POST /api/report)
export const createReport = createAsyncThunk(
  'report/createReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/report', reportData);
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tạo báo cáo');
    }
  }
);

// Async thunk để lấy báo cáo của nhân viên (GET /api/report/staffreport)
export const fetchStaffReport = createAsyncThunk(
  'report/fetchStaffReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/report/staffreport');
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải báo cáo của nhân viên');
    }
  }
);

// Async thunk để lấy tất cả các báo cáo (GET /api/report/getallreport)
export const fetchAllReports = createAsyncThunk(
  'report/fetchAllReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/report/getallreport');
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải tất cả báo cáo');
    }
  }
);

// Async thunk để lấy báo cáo theo ID (GET /api/report/{reportId})
export const fetchReportById = createAsyncThunk(
  'report/fetchReportById',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/report/${reportId}`);
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải báo cáo theo ID');
    }
  }
);

// Async thunk để gửi yêu cầu xóa thiết bị khu vực (POST /api/area/faciremovereport)
export const removeAreaFacility = createAsyncThunk(+
  'report/removeAreaFacility',
  async ({ areaId, facilityId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/area/faciremovereport', {
        areaId,
        facilityId,
        quantity,
      });
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    reports: [], // Lưu trữ danh sách tất cả báo cáo
    staffReport: [], // Lưu trữ báo cáo của nhân viên
    currentReport: null, // Lưu trữ báo cáo theo ID
    listfacicheck: [], // Lưu trữ danh sách thiết bị cần xóa
    loading: false,
    error: null,
  },
  reducers: {
    resetReports: (state) => {
      state.reports = [];
      state.staffReport = null;
      state.currentReport = null;
      state.listfacicheck = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý khi gọi API tạo báo cáo (POST /api/report)
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.reports.push(action.payload.data || action.payload); // Thêm báo cáo mới vào danh sách
        state.loading = false;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Xử lý khi gọi API lấy báo cáo của nhân viên (GET /api/report/staffreport)
      .addCase(fetchStaffReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffReport.fulfilled, (state, action) => {
        state.staffReport = action.payload.data || action.payload; // Lưu báo cáo của nhân viên
        state.loading = false;
      })
      .addCase(fetchStaffReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Xử lý khi gọi API lấy tất cả báo cáo (GET /api/report/getallreport)
      .addCase(fetchAllReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReports.fulfilled, (state, action) => {
        state.reports = action.payload.data || action.payload; // Lưu tất cả báo cáo
        state.loading = false;
      })
      .addCase(fetchAllReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Xử lý khi gọi API lấy báo cáo theo ID (GET /api/report/{reportId})
      .addCase(fetchReportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.currentReport = action.payload.data || action.payload; // Lưu báo cáo theo ID
        state.loading = false;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Xử lý khi gọi API xóa thiết bị khu vực (POST /api/area/faciremovereport)
      .addCase(removeAreaFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAreaFacility.fulfilled, (state, action) => {
        state.loading = false;
        state.listfacicheck = action.payload.data || []; // Lưu danh sách thiết bị cần xóa
      })
      .addCase(removeAreaFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetReports } = reportsSlice.actions;
export default reportsSlice.reducer;