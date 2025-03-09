import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API endpoint (đổi thành API thật)
const API_URL = "https://localhost:7101/api/Slot/Generate"; 

// Async Thunk để tạo slo
export const createSlot = createAsyncThunk(
  "slots/createSlot",
  async (slot, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, slot);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Có lỗi xảy ra");
    }
  }
);

const slotSlice = createSlice({
  name: 'slots',
  initialState: {
    slots: [],
    loading: false,
    error: null,
  },
  reducers: {
    deleteSlot: (state, action) => {
      state.slots = state.slots.filter(slot => slot.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSlot.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createSlot.fulfilled, (state, action) => {
        state.slots.push(action.payload);
        state.loading = false;
      })
      .addCase(createSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { deleteSlot } = slotSlice.actions;
export default slotSlice.reducer;
