// lib/redux/slices/gallerySlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GalleryImage } from '../../types'; // Import the GalleryImage type

interface GalleryState {
  images: GalleryImage[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GalleryState = {
  images: [],
  isLoading: false,
  error: null,
};

// Async Thunk for fetching all gallery images
export const fetchGalleryImages = createAsyncThunk(
  'gallery/fetchGalleryImages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch gallery images from API');
      }
      return (await response.json()) as GalleryImage[];
    } catch (error: any) {
      console.error('Redux Thunk Error (fetchGalleryImages):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while fetching gallery images.');
    }
  }
);

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    // You can add local reducers here if needed for direct state manipulation
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGalleryImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGalleryImages.fulfilled, (state, action: PayloadAction<GalleryImage[]>) => {
        state.isLoading = false;
        state.images = action.payload;
        state.error = null;
      })
      .addCase(fetchGalleryImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.images = [];
      });
  },
});

export default gallerySlice.reducer;
