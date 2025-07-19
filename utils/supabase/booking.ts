// utils/supabase/booking.ts

import { supabaseAdmin } from './client/supabaseAdmin';
import { Booking, BookingData, BookingStatus } from '@/types';

/**
 * Creates a new booking using an atomic PostgreSQL function to prevent race conditions.
 * This function also handles customer creation/lookup.
 */
export const createBookingAtomic = async (bookingData: BookingData): Promise<[Booking | null, any | null]> => {
  try {
    let customerId: string;

    // 1. Check/create customer (this part can remain outside the RPC if you prefer)
    // Note: If you want this to be part of the atomic transaction,
    // the customer lookup/insert would need to be inside the Postgres function.
    // For simplicity here, we assume customer creation can be separate or handled beforehand.
    const { data: existingCustomer, error: customerCheckError } = await supabaseAdmin
      .from('tbl_customers')
      .select('id')
      .eq('email', bookingData.customer_email)
      .single();

    if (customerCheckError && customerCheckError.code !== 'PGRST116') { // PGRST116 means "no rows found"
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

    // 2. Call the atomic PostgreSQL function 'create_booking_atomic'
    // This function must exist in your Supabase database.
    // It handles the availability check and booking insertion atomically.
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('create_booking_atomic', {
      p_customer_id: customerId,
      p_service_id: bookingData.service_id,
      p_stylist_id: bookingData.stylist_id || null, // Pass null if stylistId is optional/undefined
      p_booking_date: bookingData.booking_date,
      p_booking_time: bookingData.booking_time,
      p_special_requests: bookingData.special_requests || null,
      p_total_amount: bookingData.total_amount,
    });

    if (rpcError) {
      console.error('Supabase RPC Error (create_booking_atomic):', rpcError.message);
      return [null, rpcError];
    }

    // rpcResult will be an array with one object like { new_booking_id: "...", current_status: "..." }
    const { new_booking_id } = rpcResult[0];

    // 3. Fetch the newly created booking with all related details for the client
    const [fetchedBooking, fetchError] = await fetchBookingById(new_booking_id);
    if (fetchError || !fetchedBooking) {
      console.error('Supabase Service Error: Failed to fetch newly created booking after RPC:', fetchError?.message || 'Booking not found after creation');
      // Even if fetching fails, the booking was created by RPC, so return minimal info or handle as needed
      return [null, fetchError || new Error('Booking created but details could not be fetched.')];
    }

    return [fetchedBooking, null];
  } catch (error: any) {
    console.error('Supabase Booking Service Error: An unexpected error occurred during createBookingAtomic:', error.message);
    return [null, error];
  }
};


/**
 * Original createBooking function - kept for reference or if used elsewhere for non-atomic creation.
 * If you primarily use createBookingAtomic, this might become redundant.
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

    // 2. Insert the new booking record
    const { data: newBooking, error: bookingError } = await supabaseAdmin
      .from('tbl_bookings')
      .insert({
        customer_id: customerId,
        service_id: bookingData.service_id,
        stylist_id: bookingData.stylist_id || null, // Ensure stylist_id is null if not provided
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        status: 'pending' as BookingStatus, // Default status
        total_amount: bookingData.total_amount,
        special_requests: bookingData.special_requests || null,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Supabase Service Error: Failed to create booking:', bookingError.message);
      return [null, bookingError];
    }

    // Fetch the newly created booking with joined data
    const [fetchedBooking, fetchError] = await fetchBookingById(newBooking.id);
    if (fetchError) {
      console.error('Supabase Service Error: Failed to fetch newly created booking:', fetchError.message);
      return [fetchedBooking, fetchError]; // Return partial data if available
    }

    return [fetchedBooking, null];
  } catch (error: any) {
    console.error('Supabase Booking Service Error: An unexpected error occurred:', error.message);
    return [null, error];
  }
};


/**
 * Updates an existing booking in the 'tbl_bookings' table.
 */
export const updateBooking = async (
  id: string,
  updates: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'customer' | 'service' | 'stylist'>> // Omit auto-managed fields and joined data
): Promise<[Booking | null, any | null]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tbl_bookings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(), // Manually update updated_at
      })
      .eq('id', id)
      .select() // Select the updated row
      .single();

    if (error) {
      console.error('Supabase Service Error: Failed to update booking:', error.message);
      return [null, error];
    }

    // Fetch the updated booking with joined data
    const [fetchedBooking, fetchError] = await fetchBookingById(data.id);
    if (fetchError) {
      console.error('Supabase Service Error: Failed to fetch updated booking:', fetchError.message);
      return [fetchedBooking, fetchError]; // Return partial data if available
    }

    return [fetchedBooking, null];
  } catch (error: any) {
    console.error('Supabase Booking Service Error: An unexpected error occurred during updateBooking:', error.message);
    return [null, error];
  }
};


/**
 * Updates the status of a specific booking.
 */
export const updateBookingStatus = async (
  id: string,
  newStatus: BookingStatus
): Promise<[Booking | null, any | null]> => {
  try {
    const [updatedBooking, error] = await updateBooking(id, { status: newStatus });
    return [updatedBooking, error];
  } catch (error: any) {
    console.error('Supabase Service Error: An unexpected error occurred during updateBookingStatus:', error.message);
    return [null, error];
  }
};

/**
 * Fetches a single booking by its ID, with joined customer, service, and stylist data.
 */
export const fetchBookingById = async (id: string): Promise<[Booking | null, any | null]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tbl_bookings')
      .select(
        `
        *,
        customer:tbl_customers!customer_id (id, name, email, phone),
        service:tbl_services!service_id (id, name, description, price, duration, category, image, discount, total_price),
        stylist:tbl_stylists!stylist_id (id, name, specialties, image_url, is_available)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase Service Error: Failed to fetch booking by ID:', error.message);
      return [null, error];
    }

    return [data as Booking, null];
  } catch (error: any) {
    console.error('Supabase Booking Service Error: An unexpected error occurred during fetchBookingById:', error.message);
    return [null, error];
  }
};

/**
 * Fetches bookings based on pagination, search term, and status filter using a Supabase RPC.
 */
export const fetchPaginatedBookings = async (
  page: number,
  pageSize: number,
  searchTerm: string = '',
  statusFilter: string = 'all' // 'all' or specific BookingStatus
): Promise<[{ bookings: Booking[]; totalCount: number } | null, any | null]> => {
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
export const deleteBooking = async (id: string): Promise<[boolean | null, any | null]> => {
  try {
    const { error } = await supabaseAdmin
      .from('tbl_bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Service Error: Failed to delete booking:', error.message);
      return [false, error];
    }
    return [true, null];
  } catch (error: any) {
    console.error('Supabase Booking Service Error: An unexpected error occurred during deleteBooking:', error.message);
    return [null, error];
  }
};


/**
 * Checks if a specific time slot is available for a given date and optional stylist.
 * Now considers 'pending' and 'confirmed' bookings as unavailable.
 */
export const checkTimeSlotAvailability = async (
  date: string,
  time: string,
  stylistId?: string
): Promise<[boolean | null, any | null]> => {
  try {
    let query = supabaseAdmin
      .from('tbl_bookings')
      .select('*', { count: 'exact', head: true }) // Use head: true for efficiency if just counting
      .eq('booking_date', date)
      .eq('booking_time', time);

    // Consider 'pending' and 'confirmed' bookings as unavailable
    query = query.in('status', ['pending', 'confirmed']);

    if (stylistId) {
      query = query.eq('stylist_id', stylistId);
    }

    const { count, error } = await query;

    if (error) {
      throw error;
    }

    // If count is 0, the slot is available
    return [count === 0, null];
  } catch (error: any) {
    console.error('Supabase Service Error: Failed to check time slot availability:', error.message);
    return [null, error];
  }
};