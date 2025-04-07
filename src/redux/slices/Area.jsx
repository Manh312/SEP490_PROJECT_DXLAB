import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

const API_URL = "/area";

export const fetchAreas = createAsyncThunk(
  'areas/fetchAreas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_URL);
      return response.data.data; // Chỉ lấy mảng data
    } catch (error) {
      return rejectWithValue(error.message || "Không thể lấy danh sách khu vực");
    }
  }
);

// Thêm mới
export const fetchFacilitiesByAreaId = createAsyncThunk(
  'areas/fetchFacilitiesByAreaId',
  async (areaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/faciinare?areaid=${areaId}`);
      return response.data.data; // Mảng facility
    } catch (error) {
      return rejectWithValue(error.message || "Không thể lấy danh sách thiết bị");
    }
  }
);

// Lấy toàn bộ danh sách thiết bị
export const fetchAllFacilities = createAsyncThunk(
  'areas/fetchAllFacilities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/area/allfacistatus`);
      return response.data.data; // Mảng thiết bị
    } catch (error) {
      return rejectWithValue(error.message || "Không thể lấy danh sách thiết bị tổng");
    }
  }
);

// Lấy danh sách thiết bị đang sử dụng
export const fetchFacilitiesList = createAsyncThunk(
  'areas/fetchFacilitiesList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/area/allusingfaci`);
      return response.data.data; // Mảng thiết bị
    } catch (error) {
      return rejectWithValue(error.message || "Không thể lấy danh sách thiết bị tổng");
    }
  }
);

// ✅ POST: Thêm thiết bị vào khu vực
export const addFacilityToArea = createAsyncThunk(
  'areas/addFacilityToArea',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/faci?areaid=${id}&status=0`,
        data
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error || 'Lỗi khi thêm thiết bị');
    }
  }
);

// ✅ POST: Xoá thiết bị khỏi khu vực
export const removeFacilityFromArea = createAsyncThunk(
  'areas/removeFacilityFromArea',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/area/faciremoving', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error || 'Lỗi khi xoá thiết bị');
    }
  }
);

const areaSlice = createSlice({
  name: 'areas',
  initialState: {
    areas: [],
    loading: false,
    error: null,

    facilities: [], // danh sách thiết bị theo khu vực
    facilitiesLoading: false,
    facilitiesError: null,

    allFacilities: [], // danh sách tất cả thiết bị
    allFacilitiesLoading: false,
    allFacilitiesError: null,

    facilitiesList: [], // danh sách thiết bị đang sử dụng
    facilitiesListLoading: false,
    facilitiesListError: null,

    addFacilityLoading: false,
    addFacilityError: null,

    removeFacilityLoading: false, // Thêm trạng thái cho removeFacility
    removeFacilityError: null,
  },
  extraReducers: (builder) => {
    builder
      // fetchAreas
      .addCase(fetchAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // fetchFacilitiesByAreaId
      .addCase(fetchFacilitiesByAreaId.pending, (state) => {
        state.facilitiesLoading = true;
        state.facilitiesError = null;
      })
      .addCase(fetchFacilitiesByAreaId.fulfilled, (state, action) => {
        state.facilitiesLoading = false;
        state.facilities = action.payload;
      })
      .addCase(fetchFacilitiesByAreaId.rejected, (state, action) => {
        state.facilitiesLoading = false;
        state.facilitiesError = action.payload;
      })

      // fetchAllFacilities
      .addCase(fetchAllFacilities.pending, (state) => {
        state.allFacilitiesLoading = true;
        state.allFacilitiesError = null;
      })
      .addCase(fetchAllFacilities.fulfilled, (state, action) => {
        state.allFacilitiesLoading = false;
        state.allFacilities = action.payload;
      })
      .addCase(fetchAllFacilities.rejected, (state, action) => {
        state.allFacilitiesLoading = false;
        state.allFacilitiesError = action.payload;
      })

      // fetchFacilitiesList
      .addCase(fetchFacilitiesList.pending, (state) => {
        state.facilitiesListLoading = true;
        state.facilitiesListError = null;
      })
      .addCase(fetchFacilitiesList.fulfilled, (state, action) => {
        state.facilitiesListLoading = false;
        state.facilitiesList = action.payload;
      })
      .addCase(fetchFacilitiesList.rejected, (state, action) => {
        state.facilitiesListLoading = false;
        state.facilitiesListError = action.payload;
      })

      // addFacilityToArea
      .addCase(addFacilityToArea.pending, (state) => {
        state.addFacilityLoading = true;
        state.addFacilityError = null;
      })
      .addCase(addFacilityToArea.fulfilled, (state) => {
        state.addFacilityLoading = false;
      })
      .addCase(addFacilityToArea.rejected, (state, action) => {
        state.addFacilityLoading = false;
        state.addFacilityError = action.payload;
      })

      // removeFacilityFromArea
      .addCase(removeFacilityFromArea.pending, (state) => {
        state.removeFacilityLoading = true;
        state.removeFacilityError = null;
      })
      .addCase(removeFacilityFromArea.fulfilled, (state) => {
        state.removeFacilityLoading = false;
      })
      .addCase(removeFacilityFromArea.rejected, (state, action) => {
        state.removeFacilityLoading = false;
        state.removeFacilityError = action.payload;
      });
  },
});

export default areaSlice.reducer;