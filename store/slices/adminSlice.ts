import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  isAuthenticated: boolean;
  username: string;
}

const initialState: AdminState = {
  isAuthenticated: false,
  username: '',
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.username = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.username = '';
    },
  },
});

export const { login, logout } = adminSlice.actions;
export default adminSlice.reducer;