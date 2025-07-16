// lib/redux/slices/serviceBannerSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ServiceBanner } from '../../types'; // Import the ServiceBanner type

interface ServiceBannerState {
  activeBanner: ServiceBanner | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ServiceBannerState = {
  activeBanner: null,
  isLoading: false,
  error: null,
};

// Async Thunk for fetching the active service banner
export const fetchActiveBanner = createAsyncThunk(
  'serviceBanner/fetchActiveBanner',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/service-banner');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch active banner from API');
      }
      const data = await response.json();
      // If data is null (no active banner or missing image_url), return null
      return data as ServiceBanner | null;
    } catch (error: any) {
      console.error('Redux Thunk Error (fetchActiveBanner):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while fetching the service banner.');
    }
  }
);

const serviceBannerSlice = createSlice({
  name: 'serviceBanner',
  initialState,
  reducers: {
    // You can add local reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveBanner.fulfilled, (state, action: PayloadAction<ServiceBanner | null>) => {
        state.isLoading = false;
        state.activeBanner = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.activeBanner = null; // Clear banner on error
        state.error = action.payload as string;
      });
  },
});

export default serviceBannerSlice.reducer;
