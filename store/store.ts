import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './slices/bookingSlice';
import adminReducer from './slices/adminSlice';
import servicesReducer from './slices/servicesSlice';
import stylistsReducer from './slices/stylistsSlice';
import customerReducer from './slices/customerSlice'; // Adjust path as necessary
import galleryReducer from './slices/gallerySlice'; // Adjust path as necessary
import serviceBannerSlice  from './slices/serviceBannerSlice'; // Import service banner slice

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    admin: adminReducer,
    stylists: stylistsReducer,
    services: servicesReducer,
    customers: customerReducer, // Add customer slice
    gallery: galleryReducer,
    serviceBanner : serviceBannerSlice, // Import service banner slice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;