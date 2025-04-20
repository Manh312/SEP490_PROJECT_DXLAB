import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Lấy danh sách slots
export const listSlots = createAsyncThunk(
  'slots/list',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/slot');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể tải danh sách slots");
    }
  }
);

// Tạo slot mới
export const createSlot = createAsyncThunk(
  "slots/createSlot",
  async (slot, { rejectWithValue }) => {
    try {
      const response = await axios.post('/slot/create', slot);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Cập nhật slot
export const updateSlot = createAsyncThunk(
  "slots/updateSlot",
  async ({ id, slotData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/slot/${id}`, slotData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể cập nhật slot");
    }
  }
);

const slotSlice = createSlice({
  name: 'slots',
  initialState: {
    slots: [],
    statusFilter: "all", // Default filter: show all slots
    loading: false,
    error: null,
  },
  reducers: {
    deleteSlot: (state, action) => {
      state.slots = state.slots.filter(slot => slot.id !== action.payload);
    },
    setSlotStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý lấy danh sách slots
      .addCase(listSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listSlots.fulfilled, (state, action) => {
        state.slots = action.payload;
        state.loading = false;
      })
      .addCase(listSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý tạo slot mới
      .addCase(createSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSlot.fulfilled, (state, action) => {
        state.slots.push(action.payload);
        state.loading = false;
      })
      .addCase(createSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý cập nhật slot
      .addCase(updateSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSlot.fulfilled, (state, action) => {
        state.loading = false;
        const updatedSlot = action.payload;
        const index = state.slots.findIndex(slot => slot.id === updatedSlot.id);
        if (index !== -1) {
          state.slots[index] = updatedSlot;
        }
      })
      .addCase(updateSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { deleteSlot, setSlotStatusFilter } = slotSlice.actions;
export default slotSlice.reducer;