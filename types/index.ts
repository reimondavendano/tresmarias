// types/index.ts

/**
 * Interface representing a service offered by the salon.
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category: 'hair' | 'nails' | 'foot' | 'facial' | string; // 
  image: string;
}

/**
 * Interface representing a stylist working at the salon.
 */
export interface Stylist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties: string[];
  experience_years: number;
  rating: number;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface representing a customer.
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Type alias for the possible statuses of a booking.
 */
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

/**
 * Interface representing a complete booking record stored in the database.
 */
export interface Booking {
  id: string;
  customer_id: string;
  service_id: string;
  stylist_id?: string;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  total_amount: number;
  customer_phone?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
  // Joined data - for `fetchRecentBookings`
  customer?: Customer;
  service?: Service;
  stylist?: Stylist;
}

export interface BookingData {
  service_id: string;
  stylist_id?: string;
  booking_date: string;
  booking_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  special_requests?: string;
  total_amount: number;
  customer_id: string; 
}

// Admin Interfaces
export interface Admin {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AdminResponse {
  id: string;
  username: string;
  email: string;
}

export type AdminUser = AdminResponse;


