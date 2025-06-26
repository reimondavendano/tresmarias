import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  service: string;
  stylist: string;
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

interface BookingState {
  bookings: Booking[];
  currentBooking: Partial<Booking>;
  isLoading: boolean;
}

const initialState: BookingState = {
  bookings: [
    {
      id: '1',
      customerName: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      service: 'Hair Cut & Styling',
      stylist: 'Emma Rodriguez',
      date: '2025-01-20',
      time: '10:00',
      price: 120,
      status: 'confirmed',
      createdAt: '2025-01-15T09:00:00Z'
    },
    {
      id: '2',
      customerName: 'Michael Chen',
      email: 'michael@example.com', 
      phone: '+1 (555) 987-6543',
      service: 'Hair Color & Highlights',
      stylist: 'Sofia Martinez',
      date: '2025-01-21',
      time: '14:30',
      price: 250,
      status: 'pending',
      createdAt: '2025-01-16T11:30:00Z'
    },
    {
      id: '3',
      customerName: 'Jessica Williams',
      email: 'jessica@example.com',
      phone: '+1 (555) 456-7890',
      service: 'Premium Facial Treatment',
      stylist: 'Isabella Thompson',
      date: '2025-01-22',
      time: '16:00',
      price: 180,
      status: 'confirmed',
      createdAt: '2025-01-17T14:15:00Z'
    }
  ],
  currentBooking: {},
  isLoading: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCurrentBooking: (state, action: PayloadAction<Partial<Booking>>) => {
      state.currentBooking = { ...state.currentBooking, ...action.payload };
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = {};
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.push(action.payload);
    },
    updateBookingStatus: (state, action: PayloadAction<{ id: string; status: Booking['status'] }>) => {
      const booking = state.bookings.find(b => b.id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { 
  setCurrentBooking, 
  clearCurrentBooking, 
  addBooking, 
  updateBookingStatus, 
  setLoading 
} = bookingSlice.actions;

export default bookingSlice.reducer;