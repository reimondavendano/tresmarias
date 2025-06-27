import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchAllServices, fetchAllStylists, Service, Stylist } from '@/pages/api/SalonServicesAPI'; // Import the new API functions


// Initial interfaces (kept consistent with original)
export type { Service, Stylist }; // Export for other components to use

interface ServicesState {
  services: Service[];
  stylists: Stylist[];
  isLoadingServices: boolean;
  errorServices: string | null;
  isLoadingStylists: boolean;
  errorStylists: string | null;
}

const initialState: ServicesState = {
  services: [],
  stylists: [],
  isLoadingServices: false,
  errorServices: null,
  isLoadingStylists: false,
  errorStylists: null,
};

// Async Thunk for fetching services
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    const [data, error] = await fetchAllServices();
    if (error) {
      return rejectWithValue(error.message || 'Failed to fetch services');
    }
    return data;
  }
);

// Async Thunk for fetching stylists
export const fetchStylists = createAsyncThunk(
  'services/fetchStylists',
  async (_, { rejectWithValue }) => {
    const [data, error] = await fetchAllStylists();
    if (error) {
      // You might not have a tbl_stylists yet, so handle this gracefully
      // For demonstration, let's return an empty array if stylist table doesn't exist or has an error
      console.warn('Could not fetch stylists, returning empty array:', error.message);
      return []; // Return empty array if stylists cannot be fetched
    }
    return data;
  }
);


const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // You can add synchronous reducers here if needed, e.g., to manually add a service
    // addServiceLocal: (state, action: PayloadAction<Service>) => {
    //   state.services.push(action.payload);
    // },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchServices
      .addCase(fetchServices.pending, (state) => {
        state.isLoadingServices = true;
        state.errorServices = null;
      })
      .addCase(fetchServices.fulfilled, (state, action: PayloadAction<Service[]>) => {
        state.isLoadingServices = false;
        state.services = action.payload; // Update services with fetched data
        state.errorServices = null; // Clear any previous error
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoadingServices = false;
        state.errorServices = action.payload as string;
        state.services = []; // Clear services on error
      })
      // Handle fetchStylists
      .addCase(fetchStylists.pending, (state) => {
        state.isLoadingStylists = true;
        state.errorStylists = null;
      })
      .addCase(fetchStylists.fulfilled, (state, action: PayloadAction<Stylist[]>) => {
        state.isLoadingStylists = false;
        state.stylists = action.payload; // Update stylists with fetched data
        state.errorStylists = null; // Clear any previous error
      })
      .addCase(fetchStylists.rejected, (state, action) => {
        state.isLoadingStylists = false;
        state.errorStylists = action.payload as string;
        state.stylists = []; // Clear stylists on error
      });
  },
});

// Export actions and reducer
export default servicesSlice.reducer;
