// lib/redux/slices/bookingSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking, BookingData, BookingStatus } from '@/types';

interface BookingState {
  bookings: Booking[];
  currentBooking: Partial<BookingData>;
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  createError: string | null;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: {},
  isLoading: false,
  error: null,
  isCreating: false,
  createError: null,
};

// Async thunk for fetching bookings
export const fetchBookings = createAsyncThunk(
  'booking/fetchBookings',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/bookings?limit=${limit}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }
      const data: Booking[] = await response.json();
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
        method: 'PUT', // Use PUT for updating an existing resource
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
      return data.available;
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
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.unshift(action.payload); // Add to beginning of array
    },
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchBookings ---
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.isLoading = false;
        state.bookings = action.payload;
        state.error = null;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.bookings = [];
      })
      // --- createBooking ---
      .addCase(createBooking.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.isCreating = false;
        state.bookings.unshift(action.payload); // Add to beginning of array
        state.createError = null;
        state.currentBooking = {}; // Clear current booking after successful creation
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      });
  },
});

export const { 
  setCurrentBooking, 
  clearCurrentBooking, 
  addBooking, 
  clearError 
} = bookingSlice.actions;

export default bookingSlice.reducer;