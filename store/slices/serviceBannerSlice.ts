// lib/redux/slices/serviceBannerSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ServiceBanner } from '../../types'; // Ensure correct path to types

export interface CreateBannerPayload {
  title: string;
  description?: string | null;
  is_active: boolean;
  imageFile?: File; // Optional image file for upload
}

export interface UpdateBannerPayload {
  id: string;
  title?: string;
  description?: string | null;
  is_active?: boolean;
  imageFile?: File; // Optional new image file for upload
  image_url?: string | null; // Explicitly pass null to clear existing image, or string for new URL
}

interface ServiceBannerState {
  allBanners: ServiceBanner[]; // To store all banners for management
  activeBanner: ServiceBanner | null; // To store the single active banner for display
  isLoading: boolean; // For initial fetching of all banners
  error: string | null; // General error for fetching all
  isCreating: boolean;
  createError: string | null;
  isUpdating: boolean;
  updateError: string | null;
  isDeleting: boolean; // New: loading state for deleting
  deleteError: string | null; // New: error state for deleting
}

const initialState: ServiceBannerState = {
  allBanners: [],
  activeBanner: null,
  isLoading: false,
  error: null,
  isCreating: false,
  createError: null,
  isUpdating: false,
  updateError: null,
  isDeleting: false,
  deleteError: null,
};

// Helper function to upload image to your Vercel API route
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch('/api/upload-image', { // Assuming this API route exists and handles the upload
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload image.');
  }
  const result = await response.json();
  return result.imageUrl;
};

// Async Thunk for fetching ALL service banners (for admin view)
export const fetchAllServiceBanners = createAsyncThunk(
  'serviceBanner/fetchAllServiceBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/service-banner'); // This GET route now fetches ALL banners
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch all banners from API');
      }
      const data: ServiceBanner[] = await response.json();
      return data;
    } catch (error: any) {
      console.error('Redux Thunk Error (fetchAllServiceBanners):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while fetching all service banners.');
    }
  }
);

// Async Thunk for creating a service banner
export const createServiceBanner = createAsyncThunk(
  'serviceBanner/createServiceBanner',
  async (payload: CreateBannerPayload, { rejectWithValue, dispatch }) => {
    try {
      let finalImageUrl: string | null = null;

      if (payload.imageFile) {
        finalImageUrl = await uploadImage(payload.imageFile); // Upload image first
      }

      const bannerDataToCreate = {
        title: payload.title,
        description: payload.description,
        is_active: payload.is_active,
        image_url: finalImageUrl, // Send the URL to the API
      };

      const response = await fetch('/api/service-banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerDataToCreate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create banner.');
      }

      const newBanner: ServiceBanner = await response.json();
      dispatch(fetchAllServiceBanners()); // Re-fetch all banners to update the list and active status
      return newBanner;
    } catch (error: any) {
      console.error('Redux Thunk Error (createServiceBanner):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while creating the service banner.');
    }
  }
);

// Async Thunk for updating a service banner
export const updateServiceBanner = createAsyncThunk(
  'serviceBanner/updateServiceBanner',
  async (payload: UpdateBannerPayload, { rejectWithValue, dispatch }) => {
    try {
      let finalImageUrl: string | null | undefined; // string for new, null for clear, undefined for no change

      if (payload.imageFile) {
        finalImageUrl = await uploadImage(payload.imageFile); // Upload new image
      } else if ('image_url' in payload) {
        // This handles cases where user explicitly sets image_url to null (to clear existing)
        // or where they pass the existing image_url to keep it.
        finalImageUrl = payload.image_url;
      }
      // If imageFile is not provided AND image_url is not in payload, finalImageUrl remains undefined,
      // meaning the image_url on the backend will not be changed.

      const bannerDataToUpdate: Partial<ServiceBanner> = {};
      if (payload.title !== undefined) bannerDataToUpdate.title = payload.title;
      if (payload.description !== undefined) bannerDataToUpdate.description = payload.description;
      if (payload.is_active !== undefined) bannerDataToUpdate.is_active = payload.is_active;
      // Only include image_url in the payload if it was explicitly updated (new file or null to clear)
      if (finalImageUrl !== undefined) bannerDataToUpdate.image_url = finalImageUrl;


      const response = await fetch(`/api/service-banner/${payload.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerDataToUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update banner.');
      }

      const updatedBanner: ServiceBanner = await response.json();
      dispatch(fetchAllServiceBanners()); // Re-fetch all banners to update the list and active status
      return updatedBanner;
    } catch (error: any) {
      console.error('Redux Thunk Error (updateServiceBanner):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while updating the service banner.');
    }
  }
);

// New Async Thunk for deleting a service banner
export const deleteServiceBanner = createAsyncThunk(
  'serviceBanner/deleteServiceBanner',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`/api/service-banner/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete banner.');
      }

      dispatch(fetchAllServiceBanners()); // Re-fetch all banners to update the list
      return id; // Return the ID of the deleted banner
    } catch (error: any) {
      console.error('Redux Thunk Error (deleteServiceBanner):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while deleting the service banner.');
    }
  }
);

// Async Thunk for fetching the active service banner (for public-facing frontend display)
export const fetchActiveBanner = createAsyncThunk(
  'serviceBanner/fetchActiveBanner',
  async (_, { rejectWithValue }) => {
    try {
      // Calls the new dedicated API route for active banner
      const response = await fetch('/api/service-banner/active');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch active banner from API');
      }
      const data = await response.json();
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
    resetServiceBannerErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchAllServiceBanners (for admin list) ---
      .addCase(fetchAllServiceBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllServiceBanners.fulfilled, (state, action: PayloadAction<ServiceBanner[]>) => {
        state.isLoading = false;
        state.allBanners = action.payload;
        // Also update activeBanner if it's one of the fetched banners, useful for direct state access
        state.activeBanner = action.payload.find(banner => banner.is_active) || null;
        state.error = null;
      })
      .addCase(fetchAllServiceBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.allBanners = [];
        state.activeBanner = null;
      })
      // --- createServiceBanner ---
      .addCase(createServiceBanner.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createServiceBanner.fulfilled, (state) => {
        state.isCreating = false;
        state.createError = null;
        // `fetchAllServiceBanners()` is dispatched within the thunk to refresh the list
      })
      .addCase(createServiceBanner.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      })
      // --- updateServiceBanner ---
      .addCase(updateServiceBanner.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateServiceBanner.fulfilled, (state) => {
        state.isUpdating = false;
        state.updateError = null;
        // `fetchAllServiceBanners()` is dispatched within the thunk to refresh the list and active status
      })
      .addCase(updateServiceBanner.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      })
      // --- deleteServiceBanner ---
      .addCase(deleteServiceBanner.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteServiceBanner.fulfilled, (state) => {
        state.isDeleting = false;
        state.deleteError = null;
        // `fetchAllServiceBanners()` is dispatched within the thunk to refresh the list
      })
      .addCase(deleteServiceBanner.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      })
      // --- fetchActiveBanner (for public display) ---
      .addCase(fetchActiveBanner.pending, (state) => {
        state.isLoading = true; // Can use general isLoading for this specific fetch too
        state.error = null;
      })
      .addCase(fetchActiveBanner.fulfilled, (state, action: PayloadAction<ServiceBanner | null>) => {
        state.isLoading = false;
        state.activeBanner = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.activeBanner = null;
      });
  },
});

export const { resetServiceBannerErrors } = serviceBannerSlice.actions;

export default serviceBannerSlice.reducer;