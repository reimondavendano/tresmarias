// utils/supabase/booking.ts

import { supabaseService } from './client/supaBaseClient'; // Assuming your Supabase client setup
import { Booking, BookingData, BookingStatus } from '../../types'; // Import Booking, BookingData, and BookingStatus types

/**
 * Creates a new booking. This function first checks if the customer already exists.
 * If the customer exists, it uses their ID. Otherwise, it creates a new customer
 * and then proceeds to create the booking, linking it to the customer.
 */
export const createBooking = async (bookingData: BookingData): Promise<[Booking | null, any | null]> => {
  try {
    let customerId: string;

    // 1. Check if customer already exists by email
    const { data: existingCustomer, error: customerCheckError } = await supabaseService
      .from('tbl_customers')
      .select('id')
      .eq('email', bookingData.customer_email)
      .single();

    // Handle error during customer check, but ignore 'PGRST116' (no rows found)
    if (customerCheckError && customerCheckError.code !== 'PGRST116') {
      console.error('Supabase Service Error: Failed to check customer:', customerCheckError.message);
      return [null, customerCheckError];
    }

    if (existingCustomer) {
      // Customer exists, use their ID
      customerId = existingCustomer.id;
    } else {
      // Customer does not exist, create a new one
      const { data: newCustomer, error: newCustomerError } = await supabaseService
        .from('tbl_customers')
        .insert([{
          name: bookingData.customer_name,
          email: bookingData.customer_email,
          phone: bookingData.customer_phone,
        }])
        .select('id') // Select only the ID of the newly created customer
        .single();

      if (newCustomerError) {
        console.error('Supabase Service Error: Failed to create new customer:', newCustomerError.message);
        return [null, newCustomerError];
      }

      customerId = newCustomer.id;
    }

    // 2. Create the booking with the obtained customerId
    const { data: booking, error: bookingError } = await supabaseService
      .from('tbl_bookings')
      .insert([{
        customer_id: customerId, // Use the customerId obtained above
        service_id: bookingData.service_id,
        stylist_id: bookingData.stylist_id || null, // Ensure null for optional stylist_id if undefined
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        special_requests: bookingData.special_requests || null, // Ensure null for optional special_requests
        total_amount: bookingData.total_amount,
        status: 'pending' // Default status for new bookings
      }])
      .select(`
        *,
        customer:tbl_customers(id, name, email, phone),
        service:tbl_services(id, name, price, duration, image, category),
        stylist:tbl_stylists(id, name, email, phone, specialties, experience_years, rating, image_url)
      `)
      .single();

    if (bookingError) {
      console.error('Supabase Service Error: Failed to create booking:', bookingError.message);
      return [null, bookingError];
    }

    return [booking as Booking, null];
  } catch (error: any) {
    console.error('Supabase Service Error: Unexpected error in createBooking:', error);
    return [null, error];
  }
};

/**
 * Checks if a time slot is available for booking.
 * @param date The booking date (YYYY-MM-DD).
 * @param time The booking time (HH:MM).
 * @param stylistId Optional ID of the stylist to check availability for.
 */
export const checkTimeSlotAvailability = async (
  date: string,
  time: string,
  stylistId?: string
): Promise<[boolean, any | null]> => {
  let query = supabaseService
    .from('tbl_bookings')
    .select('id')
    .eq('booking_date', date)
    .eq('booking_time', time)
    .neq('status', 'cancelled'); // Do not consider cancelled bookings as occupied

  if (stylistId) {
    query = query.eq('stylist_id', stylistId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase Service Error: Failed to check availability:', error.message);
    return [false, error];
  }

  // If data.length is 0, the slot is available. Otherwise, it's occupied.
  return [data.length === 0, null];
};

/**
 * Fetches recent bookings with joined customer, service, and stylist data for dashboard display.
 * @param limit The maximum number of bookings to fetch.
 */
export const fetchRecentBookings = async (limit: number = 10): Promise<[Booking[] | null, any | null]> => {
  const { data, error } = await supabaseService
    .from('tbl_bookings')
    .select(`
      *,
      customer:tbl_customers(id, name, email, phone),
      service:tbl_services(id, name, price, duration, image, category),
      stylist:tbl_stylists(id, name, email, phone, specialties, experience_years, rating, image_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Supabase Booking Service Error: Failed to fetch recent bookings:', error.message);
    return [null, error];
  }
  return [data as Booking[], null];
};

/**
 * Updates an existing booking in the 'tbl_bookings' table.
 * This function now returns the full booking object with joined data after update.
 * @param id The ID of the booking to update.
 * @param updates An object containing the fields to update (e.g., { status: 'confirmed' }).
 */
export const updateBooking = async (id: string, updates: Partial<Booking>): Promise<[Booking | null, any | null]> => {
  const { data, error } = await supabaseService
    .from('tbl_bookings')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      customer:tbl_customers(id, name, email, phone),
      service:tbl_services(id, name, price, duration, image, category),
      stylist:tbl_stylists(id, name, email, phone, specialties, experience_years, rating, image_url)
    `) // Include joins to return full booking data
    .single();
  if (error) {
    console.error('Supabase Service Error: Failed to update booking:', error.message);
    return [null, error];
  }
  return [data as Booking, null];
};

/**
 * Fetches a single booking by its ID.
 * @param id The ID of the booking to fetch.
 */
export const fetchBookingById = async (id: string): Promise<[Booking | null, any | null]> => {
  const { data, error } = await supabaseService
    .from('tbl_bookings')
    .select(`
      *,
      customer:tbl_customers(id, name, email, phone),
      service:tbl_services(id, name, price, duration, image, category),
      stylist:tbl_stylists(id, name, email, phone, specialties, experience_years, rating, image_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Supabase Booking Service Error: Failed to fetch booking by ID:', error.message);
    if (error.code === 'PGRST116') { // No rows found
      return [null, null];
    }
    return [null, error];
  }
  return [data as Booking, null];
};


/**
 * Deletes a booking from the 'tbl_bookings' table.
 * @param id The ID of the booking to delete.
 */
export const deleteBooking = async (id: string): Promise<[boolean, any | null]> => {
  const { error } = await supabaseService
    .from('tbl_bookings')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Supabase Service Error: Failed to delete booking:', error.message);
    return [false, error];
  }
  return [true, null];
};
