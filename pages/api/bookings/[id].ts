// pages/api/bookings/[id].ts
// This Next.js API Route handles requests to /api/bookings/{id} for fetching, updating, and deleting a specific booking.

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchBookingById, updateBooking } from '@/utils/supabase/booking'; // Import booking service functions
import { BookingStatus } from '@/types'; // Import BookingStatus type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query; // Get the booking ID from the dynamic route parameter

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Booking ID is required and must be a string.' });
  }

  // Handle GET requests to fetch a single booking
  if (req.method === 'GET') {
    const [booking, error] = await fetchBookingById(id);

    if (error) {
      console.error(`API Route Error: GET /api/bookings/${id} -`, error.message);
      return res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    return res.status(200).json(booking);

  // Handle PUT requests to update a booking (e.g., status)
  } else if (req.method === 'PUT') {
    const { status } = req.body; // Expecting only 'status' for this update

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const [updatedBooking, error] = await updateBooking(id, { status });

    if (error) {
      console.error(`API Route Error: PUT /api/bookings/${id} -`, error.message);
      return res.status(500).json({ message: 'Failed to update booking status', error: error.message });
    }

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found or could not be updated.' });
    }

    return res.status(200).json(updatedBooking);

  // Handle DELETE requests (if you want to allow deleting bookings)
  // } else if (req.method === 'DELETE') {
  //   // Implement deleteBooking in utils/supabase/booking.ts and call it here
  //   // const [success, error] = await deleteBooking(id);
  //   // if (error) { ... }
  //   // return res.status(200).json({ message: 'Booking deleted successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'PUT']); // Allow only GET and PUT for now
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
