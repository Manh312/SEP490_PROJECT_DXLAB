import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from '../../utils/axios';

// Fetch all accounts
export const fetchAccounts = createAsyncThunk(
  "accounts/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/account');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error || "Không thể lấy dữ liệu tài khoản");
    }
  }
);

// Fetch account by ID
export const fetchAccountById = createAsyncThunk(
  "accounts/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/account/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể lấy dữ liệu tài khoản");
    }
  }
);

// Add new account from Excel
export const addAccount = createAsyncThunk(
  "accounts/add",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post('/account/importexcel', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể thêm tài khoản");
    }
  }
);

// Fetch roles By Admin
export const fetchRolesByAdmin = createAsyncThunk(
  "accounts/fetchRolesByAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/role/rolebyadmin');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể hiển thị vai trò");
    }
  }
);

// Update account
export const updateAccount = createAsyncThunk(
  "accounts/update",
  async ({ id, roleName }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/account/update/${id}`, { roleName });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể cập nhật tài khoản");
    }
  }
);

// Fetch accounts by role name
export const fetchAccountsByRoleName = createAsyncThunk(
  "accounts/fetchByRoleName",
  async (roleName, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/account/role/${roleName}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể lấy dữ liệu tài khoản");
    }
  }
);

// Soft delete account
export const softDeleteAccount = createAsyncThunk(
  "accounts/softDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/account/soft-delete/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể xóa mềm tài khoản");
    }
  }
);

// Fetch deleted accounts
export const fetchDeletedAccounts = createAsyncThunk(
  "accounts/fetchDeleted",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/accountstorage');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể lấy dữ liệu tài khoản đã xóa mềm");
    }
  }
);

// Restore deleted account
export const restoreAccount = createAsyncThunk(
  "accounts/restore",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/accountstorage/restore/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể khôi phục tài khoản");
    }
  }
);

// Permanently delete account
export const deletePermanently = createAsyncThunk(
  "accounts/deletePermanently",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/accountstorage/hard-delete/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể xóa vĩnh viễn tài khoản");
    }
  }
);

const accountSlice = createSlice({
  name: "accounts",
  initialState: {
    accounts: [],
    selectedAccount: null,
    loading: false,
    error: null,
    roleFilter: "All",
    deletedAccounts: [],
    roles: [],
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
    resetSelectedAccount: (state) => {
      state.selectedAccount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all accounts
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

      // Fetch account by ID
      .addCase(fetchAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAccount = action.payload;
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add new account
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

      // Update account
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.map((acc) =>
          acc.id === action.payload.id ? action.payload.account : acc
        );
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.account || action.payload;
      })

      // Fetch accounts by role name
      .addCase(fetchAccountsByRoleName.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccountsByRoleName.fulfilled, (state, action) => {
        state.accounts = action.payload;
        state.loading = false;
      })
      .addCase(fetchAccountsByRoleName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch roles by admin
      .addCase(fetchRolesByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolesByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = Array.isArray(action.payload) ? action.payload : action.payload.roles || [];
      })
      .addCase(fetchRolesByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Soft delete account
      .addCase(softDeleteAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(softDeleteAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter(acc => acc.userId !== action.meta.arg); // Lọc tài khoản đã xóa
      })
      .addCase(softDeleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch deleted accounts
      .addCase(fetchDeletedAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeletedAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedAccounts = action.payload.accounts || action.payload || [];
      })
      .addCase(fetchDeletedAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Restore account
      .addCase(restoreAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedAccounts = state.deletedAccounts.filter(
          (account) => account.id !== action.payload.id
        );
        state.accounts.push(action.payload);
      })
      .addCase(restoreAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Permanently delete account
      .addCase(deletePermanently.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter((account) => account.id !== action.payload);
        if (state.selectedAccount?.id === action.payload) {
          state.selectedAccount = null;
        }
      });
  },
});

export const { setRoleFilter, deleteAccount, resetError, resetSelectedAccount } = accountSlice.actions;
export default accountSlice.reducer;