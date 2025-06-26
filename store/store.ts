import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './slices/bookingSlice';
import adminReducer from './slices/adminSlice';
import servicesReducer from './slices/servicesSlice';

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    admin: adminReducer,
    services: servicesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;