import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

export const fetchRoleByID = createAsyncThunk(
  'auth/fetchRoleByID',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/role/${id}`);
      const data = response.data;
      return data.roleName; 
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch role");
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null, // user sẽ chứa roleId
    loading: false,
    error: null,
  },
  reducers: {
    setAuthData: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user; // roleId nằm trong user
    },
    clearAuthData: (state) => {
      state.token = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoleByID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleByID.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchRoleByID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAuthData, clearAuthData } = authSlice.actions;
export default authSlice.reducer;