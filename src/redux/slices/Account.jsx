import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://localhost:9999/api/Account";
const STORAGE_API_URL = "https://localhost:9999/api/BinStorage";

// Fetch all accounts
export const fetchAccounts = createAsyncThunk(
  "accounts/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      console.log("response", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch accounts");
    }
  }
);

// Fetch account by ID
export const fetchAccountById = createAsyncThunk(
  "accounts/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      console.log("response", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch account");
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
      const response = await axios.post(`${API_URL}/AddFromExcel`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add account");
    }
  }
);

// Update account
export const updateAccount = createAsyncThunk(
  "accounts/update",
  async ({ id, roleName }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/role`, { roleName });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update account");
    }
  }
);

// Fetch accounts by role name (replacing fetchRoles)
export const fetchAccountsByRoleName = createAsyncThunk(
  "accounts/fetchByRoleName",
  async (roleName, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/role/${roleName}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch accounts by role");
    }
  }
);

// Soft delete account
export const softDeleteAccount = createAsyncThunk(
  "accounts/softDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/soft-delete`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to soft delete account");
    }
  }
);

// Fetch deleted accounts
export const fetchDeletedAccounts = createAsyncThunk(
  "accounts/fetchDeleted",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${STORAGE_API_URL}`);
      console.log("response", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch deleted accounts");
    }
  }
);

// Restore deleted account
export const restoreAccount = createAsyncThunk(
  "accounts/restore",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${STORAGE_API_URL}/${id}/restore`);
      console.log("response", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to restore account");
    }
  }
);

// Permanently delete account
export const deletePermanently = createAsyncThunk(
  "accounts/deletePermanently",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${STORAGE_API_URL}/${id}`);
      console.log("response", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to permanently delete account");
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
    // Thêm reducer để reset selectedAccount
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
        state.accounts = action.payload.accounts || action.payload;
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
        state.accounts = action.payload.accounts || action.payload;
        state.loading = false;
      })
      .addCase(fetchAccountsByRoleName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Soft delete account
      .addCase(softDeleteAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(softDeleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.map((account) =>
          account.id === action.payload.id ? { ...account, isDeleted: true } : account
        );
        // Reset selectedAccount nếu tài khoản vừa xóa là selectedAccount
        if (state.selectedAccount?.id === action.payload.id) {
          state.selectedAccount = null;
        }
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
        state.deletedAccounts = action.payload.accounts || action.payload;
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
        // Reset selectedAccount nếu tài khoản vừa xóa là selectedAccount
        if (state.selectedAccount?.id === action.payload) {
          state.selectedAccount = null;
        }
      });
  },
});

export const { setRoleFilter, deleteAccount, resetError, resetSelectedAccount } = accountSlice.actions;
export default accountSlice.reducer;