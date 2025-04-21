import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from '../../utils/axios';


// 📌 Lấy danh sách cơ sở vật chất
export const fetchFacilities = createAsyncThunk(
  "facilities/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/facility');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể tải danh sách cơ sở vật chất");
    }
  }
);

// 📌 Lấy cơ sở vật chất theo ID
export const fetchFacilityById = createAsyncThunk(
  "facilities/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${''}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể tải thông tin cơ sở vật chất");
    }
  }
);

// 📌 Thêm cơ sở vật chất mới
export const addFacility = createAsyncThunk(
  "facilities/add",
  async (facility, { rejectWithValue }) => {
    try {
      const response = await axios.post('/facility/createfacility', facility);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


// 📌 Thêm cơ sở vật chất mới từ excel
export const addFacilityFromExcel = createAsyncThunk(
  "facilities/addFacilityFromExcel",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/facility/importexcel", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure this header is set
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);


const facilitiesSlice = createSlice({
  name: "facilities",
  initialState: {
    facilities: [],
    selectedFacility: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Lấy danh sách cơ sở vật chất
      .addCase(fetchFacilities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.loading = false;
        state.facilities = action.payload;
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Lấy cơ sở vật chất theo ID
      .addCase(fetchFacilityById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFacilityById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFacility = action.payload;
      })
      .addCase(fetchFacilityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Thêm cơ sở vật chất
      .addCase(addFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFacility.fulfilled, (state, action) => {
        state.loading = false;
        state.facilities.push(action.payload);
      })
      .addCase(addFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Thêm cơ sở vật chất từ excel
      .addCase(addFacilityFromExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFacilityFromExcel.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addFacilityFromExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { resetError } = facilitiesSlice.actions;
export default facilitiesSlice.reducer;
