import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isModalOpen: false,
  selectedArea: "",
  selectedTime: [],
  peopleCount: 1,
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
      state.selectedSlots = [];
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
    confirmBooking: (state, action) => {
      state.selectedTime = [...action.payload];
      state.isModalOpen = false;
    },
    

  },
});

export const {
  openModal,
  closeModal,
  setSelectedTime,
  setPeopleCount,
  setSelectedSlots,
  setSelectedArea,
  setMonthRange,
  confirmBooking
} = bookingSlice.actions;

export default bookingSlice.reducer;
