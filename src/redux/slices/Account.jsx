import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accounts: [],
  roleFilter: "All",
};

const accountSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    setAccounts: (state, action) => {
      state.accounts = action.payload;
    },
    setRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
    },
    addAccount: (state, action) => {
      state.accounts.push(action.payload);
    },
    deleteAccount: (state, action) => {
        state.accounts = state.accounts.filter((acc) => acc.id !== action.payload);
      },
      
      updateAccountRole: (state, action) => {
        const { id, roleId } = action.payload;
        const account = state.accounts.find((acc) => acc.id === id);
        if (account) {
          account.roleId = roleId;  // Chỉ cập nhật roleId
        }
      },
    }
      
});

export const { setAccounts, setRoleFilter, addAccount, deleteAccount, updateAccountRole } = accountSlice.actions;
export default accountSlice.reducer;
