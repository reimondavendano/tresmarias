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

// Helper function to upload image to Vercel Blob
// This encapsulates the logic previously seen in ServiceManagement.tsx
const uploadImageToVercelBlob = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || `Failed to upload image: HTTP ${response.status}`);
  }

  const result = await response.json();
  return result.imageUrl;
};

export const fetchAllServiceBanners = createAsyncThunk(
  'serviceBanner/fetchAllServiceBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/service-banner');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch banners');
      }
      const data: ServiceBanner[] = await response.json();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'An unknown error occurred');
    }
  }
);

export const createServiceBanner = createAsyncThunk(
  'serviceBanner/createServiceBanner',
  async (payload: CreateBannerPayload, { rejectWithValue, dispatch }) => {
    try {
      let imageUrl: string | null | undefined = undefined;

      // If an image file is provided, upload it first
      if (payload.imageFile) {
        imageUrl = await uploadImageToVercelBlob(payload.imageFile);
      }

      // Prepare data for the actual banner creation API call
      const bannerDataForApi = {
        title: payload.title,
        description: payload.description,
        is_active: payload.is_active,
        image_url: imageUrl, // Use the uploaded image URL
      };

      const response = await fetch('/api/service-banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerDataForApi),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create banner');
      }

      const data: ServiceBanner = await response.json();
      dispatch(fetchAllServiceBanners()); // Re-fetch all banners to update the list
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'An unknown error occurred during banner creation');
    }
  }
);

export const updateServiceBanner = createAsyncThunk(
  'serviceBanner/updateServiceBanner',
  async (payload: UpdateBannerPayload, { rejectWithValue, dispatch }) => {
    try {
      let imageUrl: string | null | undefined = undefined;

      // If a new image file is provided, upload it first
      if (payload.imageFile) {
        imageUrl = await uploadImageToVercelBlob(payload.imageFile);
      } else if (payload.image_url !== undefined) {
        // If image_url is explicitly set to null/string from component (e.g., clear image)
        imageUrl = payload.image_url;
      }
      // If no imageFile and image_url is not explicitly set, existing image_url remains (undefined)

      const updateDataForApi: Partial<Omit<ServiceBanner, 'id' | 'created_at'>> = {
        title: payload.title,
        description: payload.description === '' ? null : payload.description,
        is_active: payload.is_active,
      };

      // Only include image_url in updateDataForApi if it was processed or explicitly provided
      if (imageUrl !== undefined) {
        updateDataForApi.image_url = imageUrl;
      }

      const response = await fetch(`/api/service-banner/${payload.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateDataForApi),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update banner');
      }

      const data: ServiceBanner = await response.json();
      dispatch(fetchAllServiceBanners()); // Re-fetch all banners to update the list
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'An unknown error occurred during banner update');
    }
  }
);

export const deleteServiceBanner = createAsyncThunk(
  'serviceBanner/deleteServiceBanner',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`/api/service-banner/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete banner');
      }

      dispatch(fetchAllServiceBanners()); // Re-fetch all banners to update the list
      return id; // Return the ID of the deleted banner
    } catch (err: any) {
      return rejectWithValue(err.message || 'An unknown error occurred during banner deletion');
    }
  }
);

export const fetchActiveBanner = createAsyncThunk(
  'serviceBanner/fetchActiveBanner',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/service-banner/active'); // Assuming you have this endpoint
      if (!response.ok) {
        // If 404 or other error, might mean no active banner, handle gracefully
        if (response.status === 404) return null;
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch active banner');
      }
      const data: ServiceBanner = await response.json();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'An unknown error occurred while fetching active banner');
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
      // --- fetchAllServiceBanners ---
      .addCase(fetchAllServiceBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllServiceBanners.fulfilled, (state, action: PayloadAction<ServiceBanner[]>) => {
        state.isLoading = false;
        state.allBanners = action.payload;
        state.error = null;
      })
      .addCase(fetchAllServiceBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.allBanners = [];
      })
      // --- createServiceBanner ---
      .addCase(createServiceBanner.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createServiceBanner.fulfilled, (state) => {
        state.isCreating = false;
        state.createError = null;
        // The list is refreshed by `fetchAllServiceBanners()` dispatched within the thunk
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
        // The list is refreshed by `fetchAllServiceBanners()` dispatched within the thunk
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