import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Async thunk to create a booking
export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/booking', bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tạo đặt chỗ');
    }
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  'booking/fetchAvailableSlots',
  async ({ roomId, areaTypeId, bookingDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/booking/availiblepos?RoomId=${roomId}&AreaTypeId=${areaTypeId}&BookingDate=${bookingDate}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể lấy danh sách slot');
    }
  }
);

export const fetchCategoryInRoom = createAsyncThunk(
  'booking/fetchCategoryInRoom',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/booking/categoryinroom?id=${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể lấy danh sách khu vực trong phòng');
    }
  }
);

const initialState = {
  isModalOpen: false,
  selectedArea: null,
  selectedTime: [],
  bookingDate: null, // New state to store the selected booking date
  bookingLoading: false,
  bookingError: null,
  bookingSuccess: false,
  availableSlots: [],
  slotsLoading: false,
  slotsError: null,
  categoryInRoom: null,
  categoryLoading: false,
  categoryError: null,
  bookings: [],
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.isModalOpen = true;
      state.selectedArea = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.selectedArea = null;
      state.selectedTime = [];
      state.bookingDate = null; // Reset booking date
      state.bookingError = null;
      state.bookingSuccess = false;
      state.slotsError = null;
      state.categoryLoading = false;
      state.categoryError = null;
    },
    setSelectedTime: (state, action) => {
      state.selectedTime = [...action.payload];
    },
    setBookingDate: (state, action) => {
      state.bookingDate = action.payload; // New reducer to set booking date
    },
    setMonthRange: (state, action) => {
      state.monthRange = action.payload;
    },
    setSelectedArea: (state, action) => {
      state.selectedArea = action.payload;
    },
    confirmBooking: (state, action) => {
      state.isModalOpen = false;
      state.selectedTime = [...action.payload];
    },
    resetBookingStatus: (state) => {
      state.bookingLoading = false;
      state.bookingError = null;
      state.bookingSuccess = false;
      state.slotsLoading = false;
      state.slotsError = null;
      state.categoryLoading = false;
      state.categoryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle createBooking
      .addCase(createBooking.pending, (state) => {
        state.bookingLoading = true;
        state.bookingError = null;
        state.bookingSuccess = false;
      })
      .addCase(createBooking.fulfilled, (state) => {
        state.bookingLoading = false;
        state.bookingSuccess = true;
        state.selectedTime = [];
        state.selectedArea = null;
        state.bookingDate = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
        state.bookingSuccess = false;
      })
      // Handle fetchAvailableSlots
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.slotsLoading = true;
        state.slotsError = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.availableSlots = action.payload.data;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.slotsLoading = false;
        state.slotsError = action.payload;
      })
      .addCase(fetchCategoryInRoom.pending, (state) => {
        state.categoryLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchCategoryInRoom.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.categoryInRoom = action.payload;
      })
      .addCase(fetchCategoryInRoom.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload;
      })
  },
});

export const {
  openModal,
  closeModal,
  setSelectedTime,
  setBookingDate, // Export the new reducer
  setMonthRange,
  setSelectedArea,
  confirmBooking,
  resetBookingStatus,
} = bookingSlice.actions;

export default bookingSlice.reducer;