// userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isLoggedIn = true;
      state.user = {
        id: action.payload.id,
        email: action.payload.email,
        name: action.payload.name,
        profileImage: action.payload.profileImage,
        walletAddress: action.payload.walletAddress,
        provider: action.payload.provider, // Google, Metamask, etc.
      };
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
