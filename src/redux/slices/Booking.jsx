// Trong redux/bookingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isModalOpen: false,
  selectedArea: null,
  selectedTime: "",
  peopleCount: 1,
  selectedSlot: 1, 
  monthRange: { start: '', end: '' }, 

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
      state.selectedTime = "";
      state.peopleCount = 1;
      state.selectedSlot = 1;
    },
    setSelectedTime: (state, action) => {
      state.selectedTime = action.payload;
    },
    setPeopleCount: (state, action) => {
      state.peopleCount = action.payload;
    },
    setSelectedSlot: (state, action) => {
      state.selectedSlot = action.payload; 
    },
    setMonthRange: (state, action) => {
      state.monthRange = action.payload; 
    },
    confirmBooking: (state, action) => {
      const { startMonth, endMonth } = action.payload;
      state.monthRange = { start: startMonth, end: endMonth };
      state.isModalOpen = false;
    },
  },
});

export const { 
  openModal, 
  closeModal, 
  setSelectedTime, 
  setPeopleCount, 
  setSelectedSlot, 
  setMonthRange,
  confirmBooking
} = bookingSlice.actions;

export default bookingSlice.reducer;
