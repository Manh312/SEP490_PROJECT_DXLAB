import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API endpoint
const STORAGE_API_URL = "http://localhost:9999/api/BinStorage"; // API cho storage
// const FACILITIES_STORAGE_API_URL = "http://localhost:9999/api/Facilities/Storage"; // API cho facilities

// 📌 Lấy danh sách tài khoản đã bị xóa từ storage
export const fetchDeletedAccounts = createAsyncThunk(
  "storage/fetchDeletedAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${STORAGE_API_URL}`);
      console.log("response", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể tải danh sách tài khoản đã xóa");
    }
  }
);

// 📌 Khôi phục tài khoản từ storage
export const restoreAccount = createAsyncThunk(
  "storage/restoreAccount",
  async (accountId, { rejectWithValue }) => {
    try {
      await axios.post(`${STORAGE_API_URL}/restore/${accountId}`);
      return accountId;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể khôi phục tài khoản");
    }
  }
);

// 📌 Xóa vĩnh viễn tài khoản từ storage
export const deletePermanentlyAccount = createAsyncThunk(
  "storage/deletePermanentlyAccount",
  async (accountId, { rejectWithValue }) => {
    try {
      await axios.delete(`${STORAGE_API_URL}/delete/${accountId}`);
      return accountId;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể xóa vĩnh viễn tài khoản");
    }
  }
);

// 📌 Lấy danh sách cơ sở vật chất đã bị xóa từ storage
// export const fetchDeletedFacilities = createAsyncThunk(
//   "storage/fetchDeletedFacilities",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${FACILITIES_STORAGE_API_URL}`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Không thể tải danh sách cơ sở vật chất đã xóa");
//     }
//   }
// );

// // 📌 Khôi phục cơ sở vật chất từ storage
// export const restoreFacility = createAsyncThunk(
//   "storage/restoreFacility",
//   async (facilityId, { rejectWithValue }) => {
//     try {
//       await axios.post(`${FACILITIES_STORAGE_API_URL}/restore/${facilityId}`);
//       return facilityId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Không thể khôi phục cơ sở vật chất");
//     }
//   }
// );

// // 📌 Xóa vĩnh viễn cơ sở vật chất từ storage
// export const deletePermanentlyFacility = createAsyncThunk(
//   "storage/deletePermanentlyFacility",
//   async (facilityId, { rejectWithValue }) => {
//     try {
//       await axios.delete(`${FACILITIES_STORAGE_API_URL}/delete/${facilityId}`);
//       return facilityId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Không thể xóa vĩnh viễn cơ sở vật chất");
//     }
//   }
// );

const storageSlice = createSlice({
  name: "storage",
  initialState: {
    deletedAccounts: [], // Danh sách tài khoản đã bị xóa
    deletedFacilities: [], // Danh sách cơ sở vật chất đã bị xóa
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
      // 📌 Xử lý danh sách tài khoản
      .addCase(fetchDeletedAccounts.pending, 
        (state) => { state.loading = true; })
      .addCase(fetchDeletedAccounts.fulfilled, 
        (state, action) => {
        state.deletedAccounts = action.payload;
        state.loading = false;
      })
      .addCase(fetchDeletedAccounts.rejected, (
        state, action) => { state.error = action.payload; 
        state.loading = false; })
      .addCase(restoreAccount.fulfilled, 
        (state, action) => {
        state.deletedAccounts = state.deletedAccounts.filter((acc) => acc.id !== action.payload);
      })
      .addCase(deletePermanentlyAccount.fulfilled, 
        (state, action) => {
        state.deletedAccounts = state.deletedAccounts.filter((acc) => acc.id !== action.payload);
      })

      // 📌 Xử lý danh sách cơ sở vật chất
      // .addCase(fetchDeletedFacilities.pending, 
      //   (state) => { state.loading = true; })
      // .addCase(fetchDeletedFacilities.fulfilled, 
      //   (state, action) => {
      //   state.deletedFacilities = action.payload;
      //   state.loading = false;
      // })
      // .addCase(fetchDeletedFacilities.rejected, 
      //   (state, action) => 
      //   { state.error = action.payload; 
      //   state.loading = false; })
      // .addCase(restoreFacility.fulfilled, 
      //   (state, action) => {
      //   state.deletedFacilities = state.deletedFacilities.filter((fac) => fac.id !== action.payload);
      // })
      // .addCase(deletePermanentlyFacility.fulfilled, 
      //   (state, action) => {
      //   state.deletedFacilities = state.deletedFacilities.filter((fac) => fac.id !== action.payload);
      // });
  },
});

export const { resetError } = storageSlice.actions;
export default storageSlice.reducer;
