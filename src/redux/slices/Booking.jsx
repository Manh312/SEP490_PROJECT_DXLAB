import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Booking', bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tạo đặt chỗ');
    }
  }
);

const initialState = {
  isModalOpen: false,
  selectedArea: null, // Changed to null for consistency with closeModal
  selectedTime: [],
  peopleCount: 1,
  bookingLoading: false, // Track loading state for booking API
  bookingError: null, // Track error state for booking API
  bookingSuccess: false, // Track success state for booking API
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
      state.peopleCount = 1;
      state.bookingError = null;
      state.bookingSuccess = false;
    },
    setSelectedTime: (state, action) => {
      state.selectedTime = [...action.payload];
    },
    setPeopleCount: (state, action) => {
      state.peopleCount = action.payload;
    },
    setMonthRange: (state, action) => {
      state.monthRange = action.payload;
    },
    setSelectedArea: (state, action) => {
      state.selectedArea = action.payload;
    },
    confirmBooking: (state) => {
      // Reset state after a successful booking
      state.isModalOpen = false;
      state.selectedTime = [];
      state.peopleCount = 1;
      state.bookingSuccess = true;
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
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.bookingSuccess = true;
        state.selectedTime = []; // Clear selected time after successful booking
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
        state.bookingSuccess = false;
      });
  },
});

export const {
  openModal,
  closeModal,
  setSelectedTime,
  setPeopleCount,
  setSelectedArea,
  setMonthRange,
  confirmBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;