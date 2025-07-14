// utils/supabase/index.ts
// This file acts as the central hub for server-side database functions and re-exports.

import { supabaseService } from '@/utils/supabase/client/supaBaseClient'; // <-- Import the service client directly here
import { Booking, Service, Stylist, Customer } from '@/types'; // Ensure all types are imported if needed for fetchDashboardStats

/**
 * Fetches dashboard statistics.
 * @returns A tuple containing the stats object or null, and an error object or null.
 */
export const fetchDashboardStats = async (): Promise<[any | null, any | null]> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get total bookings
    const { count: totalBookings, error: totalBookingsError } = await supabaseService // <-- Use supabaseService directly
      .from('tbl_bookings')
      .select('*', { count: 'exact', head: true });

    // Get total revenue (completed bookings only)
    const { data: revenueData, error: revenueError } = await supabaseService // <-- Use supabaseService directly
      .from('tbl_bookings')
      .select('total_amount')
      .eq('status', 'completed');

    // Get total customers
    const { count: totalCustomers, error: totalCustomersError } = await supabaseService // <-- Use supabaseService directly
      .from('tbl_customers')
      .select('*', { count: 'exact', head: true });

    // Get today's bookings
    const { count: todayBookings, error: todayBookingsError } = await supabaseService // <-- Use supabaseService directly
      .from('tbl_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('booking_date', today);

    const errors = [totalBookingsError, revenueError, totalCustomersError, todayBookingsError].filter(Boolean);
    if (errors.length > 0) {
      console.error('Supabase Service Error: Failed to fetch dashboard stats:', errors[0]);
      return [null, errors[0]];
    }

    const totalRevenue = (revenueData || []).reduce((sum, booking) => sum + booking.total_amount, 0);

    return [{
      totalBookings: totalBookings || 0,
      totalRevenue: totalRevenue || 0,
      totalCustomers: totalCustomers || 0,
      todayBookings: todayBookings || 0,
    }, null];
  } catch (error) {
    console.error('Supabase Service Error: Unexpected error in fetchDashboardStats:', error);
    return [null, error];
  }
};

// Re-export all functions from the other files.
// These files will now directly import `supabaseService` from its source.
export * from './services';
export * from './stylists';
export * from './booking';
export * from './admin';