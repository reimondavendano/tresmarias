// lib/redux/slices/bookingSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking, BookingData, BookingStatus } from '@/types';
import { supabaseBrowser } from '@/utils/supabase/client/supabaseBrowser'; // Assuming you have a client-side Supabase client
import { RootState } from '@/store/store'; 

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

  // For pagination and search
  currentPage: number;
  pageSize: number;
  totalBookings: number;
  totalPages: number;
  searchTerm: string;
  statusFilter: string;
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
  pageSize: 10,
  totalBookings: 0,
  totalPages: 0,
  searchTerm: '', // <--- ENSURE THIS IS AN EMPTY STRING
  statusFilter: 'all', // <--- ENSURE THIS IS A DEFAULT STRING LIKE 'all'
};

// Async thunk for fetching bookings with pagination, search, and filters
export const fetchBookings = createAsyncThunk(
  'booking/fetchBookings',
  async ({ page, pageSize, searchTerm, statusFilter }: { page?: number; pageSize?: number; searchTerm?: string; statusFilter?: string }, { getState, rejectWithValue }) => {
    try {
      // Access current state for defaults using the correctly typed RootState
      const state = getState() as RootState;

      // Determine current values, falling back to Redux state if not provided in dispatch
      const currentPage = page ?? state.booking.currentPage;
      const currentPagesize = pageSize ?? state.booking.pageSize;
      const currentSearchTerm = searchTerm ?? state.booking.searchTerm; // Fallback to state's searchTerm
      const currentStatusFilter = statusFilter ?? state.booking.statusFilter; // Fallback to state's statusFilter

      // Construct URLSearchParams for clean API calls.
      // Your backend /api/bookings/index.ts route will handle converting
      // statusFilter='all' to an empty string for the Supabase RPC.
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: currentPagesize.toString(),
        searchTerm: currentSearchTerm,
        statusFilter: currentStatusFilter,
      });

      // Perform the fetch request using the constructed query string
      const response = await fetch(`/api/bookings?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }

      // API now correctly returns { bookings, totalCount }
      const data: { bookings: Booking[], totalCount: number } = await response.json();
      return data;
    } catch (error: any) {
      console.error('Redux Thunk Error (fetchBookings):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while fetching bookings.');
    }
  }
);

// Async thunk to create a new booking
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

      const newBooking: Booking = await response.json();
      return newBooking;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update booking status
export const updateBookingStatus = createAsyncThunk(
  'booking/updateBookingStatus',
  async ({ id, status }: { id: string; status: BookingStatus }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update booking status');
      }

      const updatedBooking: Booking = await response.json();
      return updatedBooking;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAvailability = createAsyncThunk(
  'booking/checkAvailability',
  async ({ date, time, stylistId }: { date: string; time: string; stylistId?: string | null }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({ date, time });
      if (stylistId) {
        queryParams.append('stylistId', stylistId);
      }
      // FIX THIS LINE: Change the API endpoint URL
      const response = await fetch(`/api/bookings/check-availability?${queryParams.toString()}`); // CORRECTED PATH

      if (!response.ok) {
        const errorData = await response.json();
        // It's good to log the full error response for debugging API issues
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || 'Failed to check availability.');
      }
      const data: { available: boolean } = await response.json();
      return data.available;
    } catch (error: any) {
      console.error('Redux Thunk Error (checkAvailability):', error);
      return rejectWithValue(error.message || 'An unknown error occurred during availability check.');
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
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateStatusError = null;
      state.checkAvailabilityError = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
        state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
        state.pageSize = action.payload;
    },
    // NEW REDUCERS FOR REALTIME (BROADCAST) UPDATES
    addRealtimeBooking: (state, action: PayloadAction<Booking>) => {
      // Add the new booking if it's not already in the current list
      const exists = state.bookings.some(b => b.id === action.payload.id);
      if (!exists) {
        state.bookings.unshift(action.payload); // Add to the beginning for freshness
        state.totalBookings += 1; // Increment total count
        state.totalPages = Math.ceil(state.totalBookings / state.pageSize);
        // Ensure the current page's view is not overflowing if adding to it directly
        state.bookings = state.bookings.slice(0, state.pageSize); // Keep only visible items if strict
      }
    },
    updateRealtimeBooking: (state, action: PayloadAction<Booking>) => {
      const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      } else {
        // If the updated booking wasn't in the current view (e.g., on another page),
        // we could potentially add it or rely on the `fetchBookings` triggered by broadcast.
        // For simplicity, we update only if present.
      }
    },
    deleteRealtimeBooking: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.filter(booking => booking.id !== action.payload);
      state.totalBookings -= 1; // Decrement total count
      state.totalPages = Math.ceil(state.totalBookings / state.pageSize);
    },
  },
  extraReducers: (builder) => {
    builder
      // Cases for fetchBookings
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<{ bookings: Booking[]; totalCount: number }>) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings;
        state.totalBookings = action.payload.totalCount;
        state.totalPages = Math.ceil(action.payload.totalCount / state.pageSize);
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Cases for createBooking
      .addCase(createBooking.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.isCreating = false;
        state.createError = null;
        state.currentBooking = {}; // Clear the form after successful creation
        // The addRealtimeBooking reducer will handle adding this via the Broadcast event,
        // so we don't need to directly modify `state.bookings` here.
        // If you were NOT using real-time, you'd unshift it here: state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      })

      // Cases for updateBookingStatus
      .addCase(updateBookingStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.updateStatusError = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.isUpdatingStatus = false;
        state.updateStatusError = null;
        // The updateRealtimeBooking reducer will handle this via the Broadcast event,
        // so we don't need to directly modify `state.bookings` here.
        // If you were NOT using real-time, you'd find and update the booking here.
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.updateStatusError = action.payload as string;
      })

      // Cases for checkAvailability
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
  clearError,
  setPage,
  setPageSize,
  // Export new realtime reducers for direct dispatch from broadcast listener
  addRealtimeBooking,
  updateRealtimeBooking,
  deleteRealtimeBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;