// lib/redux/slices/bookingSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking, BookingData, BookingStatus } from '@/types';

// Define the state interface for the booking slice
interface BookingState {
  bookings: Booking[];
  currentBooking: Partial<BookingData>;
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  createError: string | null;
  isUpdatingStatus: boolean;     // New: Loading state for status updates
  updateStatusError: string | null; // New: Error for status updates
  isCheckingAvailability: boolean; // New: Loading state for availability check
  checkAvailabilityError: string | null; // New: Error for availability check
  isAvailable: boolean | null;   // New: Stores the availability result (true/false/null)

  // New: For pagination and search
  currentPage: number;
  pageSize: number;
  totalBookings: number;
  totalPages: number;
}

// Define the initial state with new properties
const initialState: BookingState = {
  bookings: [],
  currentBooking: {},
  isLoading: false,
  error: null,
  isCreating: false,
  createError: null,
  isUpdatingStatus: false,
  updateStatusError: null,
  isCheckingAvailability: false,
  checkAvailabilityError: null,
  isAvailable: null, // Initial state for availability

  currentPage: 1,
  pageSize: 10, // Default page size
  totalBookings: 0,
  totalPages: 0,
};

// Async thunk for fetching bookings with pagination, search, and filters
export const fetchBookings = createAsyncThunk(
  'booking/fetchBookings',
  async ({ page, pageSize, searchTerm, statusFilter }: { page?: number; pageSize?: number; searchTerm?: string; statusFilter?: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { booking: BookingState }; // Access current state for defaults
      const currentPage = page ?? state.booking.currentPage;
      const current_pageSize = pageSize ?? state.booking.pageSize;
      const current_searchTerm = searchTerm ?? '';
      const current_statusFilter = statusFilter ?? 'all';

      // Construct URLSearchParams for clean API calls
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: current_pageSize.toString(),
        searchTerm: current_searchTerm,
        statusFilter: current_statusFilter,
      });

      const response = await fetch(`/api/bookings?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }
      // API now returns { bookings, totalCount }
      const data: { bookings: Booking[], totalCount: number } = await response.json();
      return data; 
    } catch (error: any) {
      console.error('Redux Thunk Error (fetchBookings):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while fetching bookings.');
    }
  }
);

// Async thunk for creating a booking
export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData: BookingData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const data: Booking = await response.json();
      return data;
    } catch (error: any) {
      console.error('Redux Thunk Error (createBooking):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while creating booking.');
    }
  }
);

// Async thunk for updating booking status
export const updateBookingStatus = createAsyncThunk(
  'booking/updateBookingStatus',
  async ({ id, status }: { id: string; status: BookingStatus }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, { // Target specific booking by ID
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }), // Only send the status to update
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update booking status');
      }
      const data: Booking = await response.json(); // API should return the updated booking
      return data;
    } catch (error: any) {
      console.error('Redux Thunk Error (updateBookingStatus):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while updating booking status.');
    }
  }
);

// Async thunk for checking availability
export const checkAvailability = createAsyncThunk(
  'booking/checkAvailability',
  async ({ date, time, stylistId }: { date: string; time: string; stylistId?: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ date, time });
      if (stylistId) params.append('stylistId', stylistId);
      
      const response = await fetch(`/api/bookings/check-availability?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check availability');
      }
      
      const data = await response.json();
      return data.available; // API returns { available: boolean }
    } catch (error: any) {
      console.error('Redux Thunk Error (checkAvailability):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while checking availability.');
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCurrentBooking: (state, action: PayloadAction<Partial<BookingData>>) => {
      state.currentBooking = { ...state.currentBooking, ...action.payload };
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = {};
    },
    // addBooking might be redundant if fetchBookings is called after creation
    // addBooking: (state, action: PayloadAction<Booking>) => {
    //   state.bookings.unshift(action.payload); 
    // },
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateStatusError = null;     // Clear update status error
      state.checkAvailabilityError = null; // Clear check availability error
    },
    setPage: (state, action: PayloadAction<number>) => { // New reducer for pagination
        state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => { // New reducer for page size
        state.pageSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchBookings ---
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<{ bookings: Booking[], totalCount: number }>) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings;
        state.totalBookings = action.payload.totalCount;
        state.totalPages = Math.ceil(action.payload.totalCount / state.pageSize); // Calculate total pages
        state.error = null;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.bookings = [];
        state.totalBookings = 0;
        state.totalPages = 0;
      })
      // --- createBooking ---
      .addCase(createBooking.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.isCreating = false;
        // If you rely on re-fetching bookings after creation, you don't need to unshift here:
        // state.bookings.unshift(action.payload); 
        state.createError = null;
        state.currentBooking = {};
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      })
      // --- updateBookingStatus ---
      .addCase(updateBookingStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.updateStatusError = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.isUpdatingStatus = false;
        state.updateStatusError = null;
        // Find and update the specific booking in the array
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.updateStatusError = action.payload as string;
      })
      // --- checkAvailability ---
      .addCase(checkAvailability.pending, (state) => {
        state.isCheckingAvailability = true;
        state.checkAvailabilityError = null;
        state.isAvailable = null; // Reset availability status while loading
      })
      .addCase(checkAvailability.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.isCheckingAvailability = false;
        state.checkAvailabilityError = null;
        state.isAvailable = action.payload; // Store the boolean result
      })
      .addCase(checkAvailability.rejected, (state, action) => {
        state.isCheckingAvailability = false;
        state.checkAvailabilityError = action.payload as string;
        state.isAvailable = false; // Assume not available on error
      });
  },
});

export const { 
  setCurrentBooking, 
  clearCurrentBooking, 
  // addBooking, // Consider removing if you always re-fetch after create
  clearError,
  setPage, // Export new reducer
  setPageSize // Export new reducer
} = bookingSlice.actions;

export default bookingSlice.reducer;