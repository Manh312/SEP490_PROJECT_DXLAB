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
      return rejectWithValue(error.response?.data || "Không thể thêm cơ sở vật chất");
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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 📌 Cập nhật cơ sở vật chất theo ID
export const updateFacility = createAsyncThunk(
  "facilities/update",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${''}/${id}`, updatedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể cập nhật cơ sở vật chất");
    }
  }
);

// 📌 Chuyển cơ sở vật chất sang storage (xóa mềm)
export const moveToStorage = createAsyncThunk(
  "facilities/moveToStorage",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${''}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể xóa cơ sở vật chất");
    }
  }
);

// 📌 Xóa vĩnh viễn cơ sở vật chất
export const deletePermanently = createAsyncThunk(
  "facilities/deletePermanently",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${''}/permanent/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể xóa vĩnh viễn cơ sở vật chất");
    }
  }
);

// 📌 Khôi phục cơ sở vật chất từ thùng rác
export const restoreFacility = createAsyncThunk(
  "facilities/restore",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${''}/restore/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể khôi phục cơ sở vật chất");
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

      // 🔹 Cập nhật cơ sở vật chất
      .addCase(updateFacility.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFacility.fulfilled, (state, action) => {
        state.loading = false;
        state.facilities = state.facilities.map((fac) =>
          fac.id === action.payload.id ? action.payload : fac
        );
      })
      .addCase(updateFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Xóa cơ sở vật chất (chuyển vào storage)
      .addCase(moveToStorage.fulfilled, (state, action) => {
        state.facilities = state.facilities.filter((fac) => fac.id !== action.payload);
      })

      // 🔹 Xóa vĩnh viễn cơ sở vật chất
      .addCase(deletePermanently.fulfilled, (state, action) => {
        state.facilities = state.facilities.filter((fac) => fac.id !== action.payload);
      })

      // 🔹 Khôi phục cơ sở vật chất từ thùng rác
      .addCase(restoreFacility.fulfilled, (state, action) => {
        state.facilities.push(action.payload);
      });
  },
});

export const { resetError } = facilitiesSlice.actions;
export default facilitiesSlice.reducer;
