import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  accounts: [],
  roleFilter: "All",
  loading: false,
  error: null,
};

// 🛠️ Fetch danh sách tài khoản từ API
export const fetchAccounts = createAsyncThunk("accounts/fetchAccounts", async () => {
  const response = await axios.get("http://localhost:9999/api/Account/AddFromExcel"); // Thay API URL của bạn
  return response.data;
  
});

// 🛠️ Cập nhật vai trò của tài khoản
export const updateAccountRole = createAsyncThunk(
  "accounts/updateAccountRole",
  async ({ id, roleId }) => {
    const response = await axios.put(`https://api.example.com/accounts/${id}`, { roleId }); // API cập nhật
    return response.data;
  }
);

const accountSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    setRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
    },
    addAccount: (state, action) => {
      state.accounts.push(action.payload);
    },
    deleteAccount: (state, action) => {
      state.accounts = state.accounts.filter((acc) => acc.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch danh sách tài khoản
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Cập nhật vai trò tài khoản
      .addCase(updateAccountRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAccountRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.accounts.findIndex((acc) => acc.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index].roleId = action.payload.roleId;
        }
      })
      .addCase(updateAccountRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setRoleFilter, addAccount, deleteAccount } = accountSlice.actions;
export default accountSlice.reducer;
