import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

const API_URL = "/area";

export const fetchAreas = createAsyncThunk(
  'areas/fetchAreas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_URL);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Không thể lấy danh sách khu vực");
    }
  }
);

export const fetchFacilitiesByAreaId = createAsyncThunk(
  'areas/fetchFacilitiesByAreaId',
  async (areaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/faciinare?areaid=${areaId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Không thể lấy danh sách thiết bị");
    }
  }
);

export const fetchAllFacilities = createAsyncThunk(
  'areas/fetchAllFacilities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/area/allfacistatus`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Không thể lấy danh sách thiết bị tổng");
    }
  }
);

export const fetchFacilitiesList = createAsyncThunk(
  'areas/fetchFacilitiesList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/area/allusingfaci`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Không thể lấy danh sách thiết bị tổng");
    }
  }
);

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

export const updateArea = createAsyncThunk(
  'areas/updateArea',
  async ({ areaId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${API_URL}/area?areaid=${areaId}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi cập nhật khu vực");
    }
  }
);

export const fetchAreaInRoomForManagement = createAsyncThunk(
  'areas/fetchAreaInRoomForManagement',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/areainroomformanagement?roomId=${roomId}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Không thể lấy thông tin khu vực và phòng");
    }
  }
);

export const removeAllFacilitiesFromArea = createAsyncThunk(
  'areas/removeAllFacilitiesFromArea',
  async (areaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `${API_URL}/faciremoveall?areaid=${areaId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error || "Lỗi khi xóa tất cả thiết bị trong khu vực");
    }
  }
);

// ✅ POST: Tạo khu vực mới
export const addAreaToRoom = createAsyncThunk(
  'areas/addAreasToRoom',
  async ({ roomId, areas }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/newarea?roomId=${roomId}`,
        areas, // Send the array of area objects directly
        {
          headers: {
            "Content-Type": "application/json-patch+json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const areaSlice = createSlice({
  name: 'areas',
  initialState: {
    areas: [],
    loading: false,
    error: null,

    facilities: [],
    facilitiesLoading: false,
    facilitiesError: null,

    allFacilities: [],
    allFacilitiesLoading: false,
    allFacilitiesError: null,

    facilitiesList: [],
    facilitiesListLoading: false,
    facilitiesListError: null,

    addFacilityLoading: false,
    addFacilityError: null,

    removeFacilityLoading: false,
    removeFacilityError: null,

    updateAreaLoading: false,
    updateAreaError: null,

    areaInRoom: [],
    areaInRoomLoading: false,
    areaInRoomError: null,

    removeAllFacilitiesLoading: false,
    removeAllFacilitiesError: null,

    // Trạng thái cho tạo khu vực mới
    createAreaLoading: false,
    createAreaError: null,
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
      })

      // updateArea
      .addCase(updateArea.pending, (state) => {
        state.updateAreaLoading = true;
        state.updateAreaError = null;
      })
      .addCase(updateArea.fulfilled, (state, action) => {
        state.updateAreaLoading = false;
        const updatedArea = action.payload.data;
        const index = state.areas.findIndex(area => area.areaId === updatedArea.areaId);
        if (index !== -1) {
          state.areas[index] = updatedArea;
        }
      })
      .addCase(updateArea.rejected, (state, action) => {
        state.updateAreaLoading = false;
        state.updateAreaError = action.payload;
      })

      // fetchAreaInRoomForManagement
      .addCase(fetchAreaInRoomForManagement.pending, (state) => {
        state.areaInRoomLoading = true;
        state.areaInRoomError = null;
      })
      .addCase(fetchAreaInRoomForManagement.fulfilled, (state, action) => {
        state.areaInRoomLoading = false;
        state.areaInRoom = action.payload;
      })
      .addCase(fetchAreaInRoomForManagement.rejected, (state, action) => {
        state.areaInRoomLoading = false;
        state.areaInRoomError = action.payload;
      })

      // removeAllFacilitiesFromArea
      .addCase(removeAllFacilitiesFromArea.pending, (state) => {
        state.removeAllFacilitiesLoading = true;
        state.removeAllFacilitiesError = null;
      })
      .addCase(removeAllFacilitiesFromArea.fulfilled, (state) => {
        state.removeAllFacilitiesLoading = false;
      })
      .addCase(removeAllFacilitiesFromArea.rejected, (state, action) => {
        state.removeAllFacilitiesLoading = false;
        state.removeAllFacilitiesError = action.payload;
      })

      // createArea
      .addCase(addAreaToRoom.pending, (state) => {
        state.createAreaLoading = true;
        state.createAreaError = null;
      })
      .addCase(addAreaToRoom.fulfilled, (state, action) => {
        state.createAreaLoading = false;
        if (action.payload.data) {
          state.areas.push(...action.payload.data); // API should return an array of created areas
        }
      })
      .addCase(addAreaToRoom.rejected, (state, action) => {
        state.createAreaLoading = false;
        state.createAreaError = action.payload;
      });
  },
});

export default areaSlice.reducer;