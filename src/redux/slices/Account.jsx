import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API endpoint
const API_URL = "http://localhost:9999/api/Account";

// Lấy danh sách tài khoản
export const fetchAccounts = createAsyncThunk(
  "accounts/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể tải danh sách tài khoản");
    }
  }
);

// Thêm tài khoản mới (từ import Excel)
export const addAccount = createAsyncThunk(
  "accounts/add",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_URL}/AddFromExcel`, formData, {
        headers: {
          // "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);

      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response?.data || "Không thể thêm tài khoản");
    }
  }
);

const accountSlice = createSlice({
  name: "accounts",
  initialState: {
    accounts: [],
    loading: false,
    error: null,
    roleFilter: "All",
  },
  reducers: {
    setRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
    },
    deleteAccount: (state, action) => {
      state.accounts = state.accounts.filter((account) => account.id !== action.payload);
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.accounts = action.payload;
        state.loading = false;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAccount.pending, (state) => {
        state.loading = true;
        state.error = null; // ✅ Reset lỗi khi bắt đầu nhập file
      })
      .addCase(addAccount.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // ✅ Cập nhật lỗi ngay lập tức
      });
  },
});

export const { setRoleFilter, deleteAccount, resetError } = accountSlice.actions;
export default accountSlice.reducer;
