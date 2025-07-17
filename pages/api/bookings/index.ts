// pages/api/bookings/[id].ts
// This Next.js API Route handles requests to /api/bookings/{id} for fetching, updating, and deleting a specific booking.

import type { NextApiRequest, NextApiResponse } from 'next';
// Ensure both fetchBookingById and updateBookingStatus are correctly imported
import { fetchBookingById, updateBookingStatus } from '@/utils/supabase/booking';
import { BookingStatus } from '@/types'; // Import BookingStatus type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query; // Get the booking ID from the dynamic route parameter

  // Basic validation for the ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Booking ID is required and must be a string.' });
  }

  // Handle GET requests to fetch a single booking
  if (req.method === 'GET') {
    // This line: const [booking, error] = await fetchBookingById(id);
    // is correct given the return type of fetchBookingById.
    const [booking, error] = await fetchBookingById(id); 

    if (error) {
      console.error(`API Route Error: GET /api/bookings/${id} -`, error.message);
      // For a 'not found' error from Supabase (e.g., PGRST116), it might be better to return 404
      if (error.code === 'PGRST116') { // Example Supabase error code for no rows found
        return res.status(404).json({ message: 'Booking not found.' });
      }
      return res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
    }

    if (!booking) {
      // This handles cases where fetchBookingById explicitly returns [null, null] for not found
      return res.status(404).json({ message: 'Booking not found.' });
    }

    return res.status(200).json(booking);

  // Handle PUT requests to update a booking's status
  } else if (req.method === 'PUT') {
    const { status } = req.body; 

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    // Use the specific updateBookingStatus function
    const [updatedBooking, error] = await updateBookingStatus(id, status as BookingStatus);

    if (error) {
      console.error(`API Route Error: PUT /api/bookings/${id} -`, error.message);
      return res.status(500).json({ message: 'Failed to update booking status', error: error.message });
    }

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found or could not be updated.' });
    }

    return res.status(200).json(updatedBooking);

  // You can add a DELETE handler here if needed
  // } else if (req.method === 'DELETE') {
  //   // ... (implement deletion logic)
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}