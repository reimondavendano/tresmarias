// pages/api/bookings/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchPaginatedBookings, createBooking } from '@/utils/supabase/booking'; // Make sure createBooking is imported if you handle POST here

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { page, pageSize, searchTerm, statusFilter } = req.query;

    const parsedPage = parseInt(page as string) || 1;
    const parsedPageSize = parseInt(pageSize as string) || 10;
    const parsedSearchTerm = (searchTerm as string) || '';
    
    // --- IMPORTANT FIX HERE: Handle 'all' status filter for Supabase RPC ---
    let statusFilterForSupabase = (statusFilter as string) || 'all';
    if (statusFilterForSupabase === 'all') {
      // Change 'all' to an empty string. Your Supabase RPC 'search_bookings'
      // must be configured to interpret an empty string as "no status filter applied".
      statusFilterForSupabase = ''; 
    }
    
    // Call the fetchPaginatedBookings function with the parsed parameters
    const [data, error] = await fetchPaginatedBookings(
      parsedPage,
      parsedPageSize,
      parsedSearchTerm,
      statusFilterForSupabase // Use the adjusted status filter value
    );

    if (error) {
      console.error('API Route Error: GET /api/bookings -', error.message);
      return res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }

    if (!data) {
      // If no data is returned but no error, return an empty array and 0 count
      return res.status(200).json({ bookings: [], totalCount: 0 });
    }

    return res.status(200).json(data);
  } else if (req.method === 'POST') {
    // This block handles the POST request for creating new bookings.
    try {
      const bookingData = req.body; // Assuming req.body contains the booking data
      const [newBooking, error] = await createBooking(bookingData);

      if (error) {
        console.error('API Route Error: POST /api/bookings -', error.message);
        return res.status(500).json({ message: 'Failed to create booking', error: error.message });
      }

      if (!newBooking) {
        return res.status(400).json({ message: 'Failed to create booking: No data returned.' });
      }

      return res.status(201).json(newBooking);
    } catch (error: any) {
      console.error('API Route Error: POST /api/bookings -', error.message);
      return res.status(500).json({ message: 'An unexpected error occurred while creating booking.', error: error.message });
    }
  }
   else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}