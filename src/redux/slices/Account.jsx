import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API endpoint (cập nhật URL thực tế)
const API_URL = "http://localhost:9999/api/accounts";
// Lấy danh sách tài khoản
export const fetchAccounts = createAsyncThunk(
  'accounts/fetch',
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
  'accounts/add',
  async (account, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}`, account);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể thêm tài khoản");
    }
  }
);

const accountSlice = createSlice({
  name: 'accounts',
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
      state.accounts = state.accounts.filter(account => account.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý lấy danh sách tài khoản
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.accounts = action.payload;
        state.loading = false;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Xử lý thêm tài khoản từ file Excel
      .addCase(addAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
        state.loading = false;
      })
      .addCase(addAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setRoleFilter, deleteAccount } = accountSlice.actions;
export default accountSlice.reducer;
