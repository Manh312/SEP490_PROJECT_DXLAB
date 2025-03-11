import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API endpoint
const API_URL = "http://localhost:9999/api/Account";

// 📌 Lấy danh sách tài khoản
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

// 📌 Lấy tài khoản theo ID
export const fetchAccountById = createAsyncThunk(
  "accounts/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể tải thông tin tài khoản");
    }
  }
);

// 📌 Thêm tài khoản mới (từ import Excel)
export const addAccount = createAsyncThunk(
  "accounts/add",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_URL}/AddFromExcel`, formData);

      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response?.data || "Không thể thêm tài khoản");
    }
  }
);

// 📌 Cập nhật tài khoản theo ID
export const updateAccount = createAsyncThunk(
  "accounts/update",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, updatedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể cập nhật tài khoản");
    }
  }
);

// 📌 Chuyển tài khoản sang storage (xóa mềm)
export const moveToStorage = createAsyncThunk("accounts/moveToStorage", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Không thể xóa tài khoản");
  }
});

// 📌 Xóa vĩnh viễn tài khoản
export const deletePermanently = createAsyncThunk("accounts/deletePermanently", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/deletePermanently/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Không thể xóa vĩnh viễn tài khoản");
  }
});

const accountSlice = createSlice({
  name: "accounts",
  initialState: {
    accounts: [],
    selectedAccount: null,
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
      // 🔹 Lấy danh sách tài khoản
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

      // 🔹 Lấy tài khoản theo ID
      .addCase(fetchAccountById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAccount = action.payload;
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Thêm tài khoản mới
      .addCase(addAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAccount.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Cập nhật tài khoản
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.map((acc) =>
          acc.id === action.payload.id ? action.payload : acc
        );
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Xóa tài khoản (chuyển vào storage)
      .addCase(moveToStorage.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter((account) => account.id !== action.payload);
      })

      // 🔹 Xóa vĩnh viễn tài khoản
      .addCase(deletePermanently.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter((account) => account.id !== action.payload);
      });
  },
});

export const { setRoleFilter, deleteAccount, resetError } = accountSlice.actions;
export default accountSlice.reducer;
// export { fetchAccounts, fetchAccountById, addAccount, updateAccount, deletePermanently };
