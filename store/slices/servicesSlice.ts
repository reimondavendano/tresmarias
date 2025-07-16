// lib/redux/slices/servicesSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Service } from '../../types'; // Assuming Service type is defined in '../../types'

interface ServicesState {
  services: Service[];
  isLoadingServices: boolean;
  errorServices: string | null;
  isAddingService: boolean;
  addServiceError: string | null;
  isUpdatingService: boolean;
  updateServiceError: string | null;
  isDeletingService: boolean;
  deleteServiceError: string | null;
  // New states for single service fetch
  isLoadingSingleService: boolean;
  singleServiceError: string | null;
}

const initialState: ServicesState = {
  services: [],
  isLoadingServices: false,
  errorServices: null,
  isAddingService: false,
  addServiceError: null,
  isUpdatingService: false,
  updateServiceError: null,
  isDeletingService: false,
  deleteServiceError: null,
  // Initialize new states
  isLoadingSingleService: false,
  singleServiceError: null,
};

// Async Thunk for fetching all services
export const fetchServices = createAsyncThunk(
  'services/fetchAllServices', // Renamed to clarify it fetches all
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch services from API');
      }
      return (await response.json()) as Service[];
    } catch (error: any) {
      console.error('Redux Thunk Error (fetchServices):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while fetching services.');
    }
  }
);

// NEW Async Thunk for fetching a single service by ID
export const fetchService = createAsyncThunk(
  'services/fetchServiceById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/services/${id}`); // Assuming API route for single service
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch service with ID ${id}`);
      }
      const data: Service = await response.json();
      return data;
    } catch (error: any) {
      console.error('Redux Thunk Error (fetchServiceById):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while fetching service by ID.');
    }
  }
);

// Async Thunk for adding a service
export const addService = createAsyncThunk(
  'services/addService',
  async (newServiceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => { // Note: 'total_price' omitted if DB computes it
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServiceData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add service via API');
      }
      return (await response.json()) as Service;
    } catch (error: any) {
      console.error('Redux Thunk Error (addService):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while adding service.');
    }
  }
);

// Async Thunk for updating a service
export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, updates }: { id: string; updates: Partial<Service> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update service via API');
      }
      return (await response.json()) as Service;
    } catch (error: any) {
      console.error('Redux Thunk Error (updateService):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while updating service.');
    }
  }
);

// Async Thunk for deleting a service
export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service via API');
      }
      return id;
    } catch (error: any) {
      console.error('Redux Thunk Error (deleteService):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while deleting service.');
    }
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // Local reducers for immediate state updates
    addServiceLocal: (state, action: PayloadAction<Service>) => {
      state.services.push(action.payload);
    },
    updateServiceLocal: (state, action: PayloadAction<Service>) => {
      const index = state.services.findIndex(service => service.id === action.payload.id);
      if (index !== -1) {
        state.services[index] = action.payload;
      }
    },
    removeServiceLocal: (state, action: PayloadAction<string>) => {
      state.services = state.services.filter(service => service.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchServices (all) ---
      .addCase(fetchServices.pending, (state) => {
        state.isLoadingServices = true;
        state.errorServices = null;
      })
      .addCase(fetchServices.fulfilled, (state, action: PayloadAction<Service[]>) => {
        state.isLoadingServices = false;
        state.services = action.payload;
        state.errorServices = null;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoadingServices = false;
        state.errorServices = action.payload as string;
        state.services = [];
      })
      // --- fetchService (single) ---
      .addCase(fetchService.pending, (state) => {
        state.isLoadingSingleService = true;
        state.singleServiceError = null;
      })
      .addCase(fetchService.fulfilled, (state, action: PayloadAction<Service>) => {
        state.isLoadingSingleService = false;
        // Optionally update the services array with the fetched single service if it's not already there
        const index = state.services.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        } else {
          // If you want to add it to the list of all services, be mindful of duplicates
          // state.services.push(action.payload);
        }
        state.singleServiceError = null;
      })
      .addCase(fetchService.rejected, (state, action) => {
        state.isLoadingSingleService = false;
        state.singleServiceError = action.payload as string;
      })
      // --- addService ---
      .addCase(addService.pending, (state) => {
        state.isAddingService = true;
        state.addServiceError = null;
      })
      .addCase(addService.fulfilled, (state, action: PayloadAction<Service>) => {
        state.isAddingService = false;
        state.services.push(action.payload);
        state.addServiceError = null;
      })
      .addCase(addService.rejected, (state, action) => {
        state.isAddingService = false;
        state.addServiceError = action.payload as string;
      })
      .addCase(updateService.pending, (state) => {
        state.isUpdatingService = true;
        state.updateServiceError = null;
      })
      .addCase(updateService.fulfilled, (state, action: PayloadAction<Service>) => {
        state.isUpdatingService = false;
        const index = state.services.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        state.updateServiceError = null;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.isUpdatingService = false;
        state.updateServiceError = action.payload as string;
      })
      .addCase(deleteService.pending, (state) => {
        state.isDeletingService = true;
        state.deleteServiceError = null;
      })
      .addCase(deleteService.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeletingService = false;
        state.services = state.services.filter((service) => service.id !== action.payload);
        state.deleteServiceError = null;
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.isDeletingService = false;
        state.deleteServiceError = action.payload as string;
      });
  },
});

// Export all actions, both local and thunks
export const { addServiceLocal, updateServiceLocal, removeServiceLocal } = servicesSlice.actions;

export default servicesSlice.reducer;