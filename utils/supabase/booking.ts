// utils/supabase/booking.ts

import { supabaseAdmin } from './client/supabaseAdmin';
import { Booking, BookingData, BookingStatus } from '@/types';

/**
 * Creates a new booking.
 * ... (your createBooking function) ...
 */
export const createBooking = async (bookingData: BookingData): Promise<[Booking | null, any | null]> => {
  try {
    let customerId: string;

    // 1. Check if customer already exists by email
    const { data: existingCustomer, error: customerCheckError } = await supabaseAdmin
      .from('tbl_customers')
      .select('id')
      .eq('email', bookingData.customer_email)
      .single();

    if (customerCheckError && customerCheckError.code !== 'PGRST116') {
      console.error('Supabase Service Error: Failed to check customer:', customerCheckError.message);
      return [null, customerCheckError];
    }

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: newCustomerError } = await supabaseAdmin
        .from('tbl_customers')
        .insert({
          name: bookingData.customer_name,
          email: bookingData.customer_email,
          phone: bookingData.customer_phone,
        })
        .select()
        .single();

      if (newCustomerError) {
        console.error('Supabase Service Error: Failed to create new customer:', newCustomerError.message);
        return [null, newCustomerError];
      }
      customerId = newCustomer.id;
    }

    // 2. Create the booking with the customerId
    const { data: newBooking, error: bookingError } = await supabaseAdmin
      .from('tbl_bookings')
      .insert({
        customer_id: customerId,
        service_id: bookingData.service_id,
        stylist_id: bookingData.stylist_id, // stylist_id is optional
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        special_requests: bookingData.special_requests,
        total_amount: bookingData.total_amount,
        status: 'pending', // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Supabase Service Error: Failed to create booking:', bookingError.message);
      return [null, bookingError];
    }

    // Fetch the newly created booking with all related details (customer, service, stylist)
    // to ensure the returned object matches the 'Booking' type structure
    const [fetchedBooking, fetchError] = await fetchBookingById(newBooking.id);
    if (fetchError || !fetchedBooking) {
      console.error('Supabase Service Error: Failed to fetch newly created booking:', fetchError?.message || 'Booking not found after creation');
      // Even if fetching fails, the booking was created, so return the raw newBooking or handle as needed
      return [newBooking as Booking, null]; // Or return [null, fetchError] if strict
    }

    return [fetchedBooking, null];
  } catch (error: any) {
    console.error('Supabase Booking Service Error: An unexpected error occurred during createBooking:', error.message);
    return [null, error];
  }
};

/**
 * Updates an existing booking record with partial data (generic update).
 * NOTE: This function is less specific than updateBookingStatus.
 */
export const updateBooking = async (
  id: string,
  updates: Partial<BookingData> // Or Partial<Booking> if it updates more fields
): Promise<[Booking | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_bookings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Supabase Service Error: Failed to update booking (generic):', error.message);
    return [null, error];
  }
  return [data as Booking, null];
};

/**
 * Updates the status of a specific booking.
 */
export const updateBookingStatus = async (
  id: string,
  status: BookingStatus
): Promise<[Booking | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase Booking Service Error: Failed to update booking status:', error.message);
    return [null, error];
  }
  return [data as Booking, null];
};


/**
 * Fetches a single booking by its ID, including related customer, service, and stylist details.
 */
export const fetchBookingById = async (id: string): Promise<[Booking | null, any | null]> => {
  const { data, error } = await supabaseAdmin
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
 * Checks if a specific time slot is available for booking, optionally for a specific stylist.
 */
export const checkTimeSlotAvailability = async (
  date: string,
  time: string,
  stylistId?: string
): Promise<[boolean | null, any | null]> => {
  try {
    let query = supabaseAdmin
      .from('tbl_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('booking_date', date)
      .eq('booking_time', time)
      .eq('status', 'confirmed'); // Only count confirmed bookings for conflicts

    if (stylistId) {
      query = query.eq('stylist_id', stylistId);
    }

    const { count, error } = await query;

    if (error) {
      throw error;
    }

    return [count === 0, null];
  } catch (error: any) {
    console.error('Supabase Service Error: Failed to check time slot availability:', error.message);
    return [null, error];
  }
};

/**
 * Fetches paginated bookings using a Supabase SQL function for search and filters.
 */
export const fetchPaginatedBookings = async (
  page: number,
  pageSize: number,
  searchTerm: string,
  statusFilter: string
): Promise<[{ bookings: Booking[], totalCount: number } | null, any | null]> => {
  try {
    const page_offset = (page - 1) * pageSize;
    const page_size = pageSize; 

    // Call the Supabase RPC function 'search_bookings'
    const { data, error: rpcError } = await supabaseAdmin.rpc('search_bookings', {
      p_search_term: searchTerm,
      p_status_filter: statusFilter, 
      p_page_offset: page_offset,
      p_page_size: page_size,
    });

    if (rpcError) {
      console.error('Supabase RPC Error (search_bookings):', rpcError.message);
      throw rpcError;
    }

    // The RPC function returns a single row with 'bookings_json' and 'total_count'
    // If no data is returned, it means no bookings matched the criteria
    if (!data || data.length === 0 || !data[0].bookings_json) {
      return [{ bookings: [], totalCount: 0 }, null];
    }

    const rpcResult = data[0]; 
    const bookings: Booking[] = rpcResult.bookings_json;
    const totalCount: number = rpcResult.total_count;

    return [{ bookings, totalCount }, null];
  } catch (error: any) {
    console.error('Supabase Booking Service Error: Failed to fetch paginated bookings (RPC):', error.message);
    return [null, error];
  }
};

/**
 * Deletes a booking from the 'tbl_bookings' table.
 */
export const deleteBooking = async (id: string): Promise<[boolean, any | null]> => {
  const { error } = await supabaseAdmin
    .from('tbl_bookings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase Booking Service Error: Failed to delete booking:', error.message);
    return [false, error];
  }
  return [true, null];
};