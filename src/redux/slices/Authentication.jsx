import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

export const fetchRoleByID = createAsyncThunk(
  'auth/fetchRoleByID',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/role/${id}`);
      const data = response.data;
      return data.data.roleName;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch role");
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    roleName: null,
    isAuthenticating: false, // Add isAuthenticating to state
    isLoggingOut: false,
    loading: false,
    error: null,
  },
  reducers: {
    setAuthData: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    clearAuthData: (state) => {
      state.token = null;
      state.user = null;
      state.roleName = null;
      state.isLoggingOut = false;
      // state.isAuthenticating = false; // Reset isAuthenticating on logout
    },
    setIsAuthenticating: (state, action) => {
      console.log("setIsAuthenticating called with:", action.payload);
      state.isAuthenticating = action.payload; // Action to set isAuthenticating
    },
    setIsLoggingOut(state, action) {
      state.isLoggingOut = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoleByID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleByID.fulfilled, (state, action) => {
        state.loading = false;
        state.roleName = action.payload;
      })
      .addCase(fetchRoleByID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAuthData, clearAuthData, setIsLoggingOut, setIsAuthenticating } = authSlice.actions;
export default authSlice.reducer;