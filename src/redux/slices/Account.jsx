import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API endpoint
const API_URL = "http://localhost:9999/api/Account";
const API_Role_URL = "http://localhost:9999/api/Role/RoleByAdmin";

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

// 📌 Lấy danh sách vai trò
export const fetchRoles = createAsyncThunk(
  "accounts/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_Role_URL);
      console.log(response.data);
      return response.data; // Trả về danh sách vai trò
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(
        error.response?.data || "Không thể tải danh sách vai trò"
      );
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

// 📌 Lấy danh sách tài khoản theo roleName
export const fetchAccountsByRoleName = createAsyncThunk(
  "accounts/fetchByRoleName",
  async (roleName, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/role/${roleName}`);
      console.log("API response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Không thể tải danh sách tài khoản theo vai trò"
      );
    }
  }
);

// 📌 Xóa mềm tài khoản (chỉ cập nhật trạng thái isDeleted)
export const softDeleteAccount = createAsyncThunk(
  "accounts/softDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/soft-delete`);
      console.log(response.data);
      return response.data; // Trả về dữ liệu xóa mềm nếu cần
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response?.data || "Không thể xóa tài khoản");
    }
  }
);
// 📌 Lấy danh sách tài khoản đã xóa
export const fetchDeletedAccounts = createAsyncThunk(
  "accounts/fetchDeleted",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/deleted`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể tải danh sách tài khoản đã xóa");
    }
  }
);
// 📌 Khôi phục tài khoản đã xóa
export const restoreAccount = createAsyncThunk(
  "accounts/restore",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/restore`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể khôi phục tài khoản");
    }
  }
);

// 📌 Xóa vĩnh viễn tài khoản
export const deletePermanently = createAsyncThunk("accounts/deletePermanently", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/deletePermanently/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Không thể xóa vĩnh viễn tài khoản");
  }
});

// export const fetchDeletedAccounts = createAsyncThunk();
// export const restoreAccount = createAsyncThunk();

const accountSlice = createSlice({
  name: "accounts",
  initialState: {
    accounts: [],
    selectedAccount: null,
    loading: false,
    error: null,
    roleFilter: "All",
    roles: [], // Danh sách vai trò
    deletedAccounts: [], // 🔹 Thêm state cho danh sách tài khoản đã xóa
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
        state.accounts = action.payload.accounts || action.payload; // Chuẩn hóa dữ liệu
        state.loading = false;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       // Fetch danh sách vai trò
       .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload; // Cập nhật danh sách vai trò
        state.loading = false;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
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

      // 🔹 Lấy danh sách tài khoản theo vai trò
      .addCase(fetchAccountsByRoleName.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccountsByRoleName.fulfilled, (state, action) => {
        state.accounts = action.payload.accounts || action.payload; // Chuẩn hóa dữ liệu
        state.loading = false;
      })
      .addCase(fetchAccountsByRoleName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Xóa mềm tài khoản
      .addCase(softDeleteAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(softDeleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.map((account) =>
          account.id === action.payload.id
            ? { ...account, isDeleted: true }
            : account
        );
      })
      .addCase(softDeleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
          // 🔹 Lấy danh sách tài khoản đã xóa
          .addCase(fetchDeletedAccounts.pending, (state) => {
            state.loading = true;
          })
          .addCase(fetchDeletedAccounts.fulfilled, (state, action) => {
            state.loading = false;
            state.deletedAccounts = action.payload; // Cập nhật danh sách tài khoản đã xóa
          })
          .addCase(fetchDeletedAccounts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
    
          // 🔹 Khôi phục tài khoản đã xóa
          .addCase(restoreAccount.pending, (state) => {
            state.loading = true;
          })
          .addCase(restoreAccount.fulfilled, (state, action) => {
            state.loading = false;
            state.deletedAccounts = state.deletedAccounts.filter(
              (account) => account.id !== action.payload.id
            );
            state.accounts.push(action.payload); // Đưa tài khoản đã khôi phục về danh sách chính
          })
          .addCase(restoreAccount.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
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