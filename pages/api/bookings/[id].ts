// pages/api/bookings/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchBookingById, updateBooking } from '@/utils/supabase/booking';
import { BookingStatus, Booking } from '@/types'; // Import Booking type as well
import { supabaseAdmin } from '@/utils/supabase/client/supabaseAdmin';

const BOOKING_CHANNEL_NAME = 'booking_broadcast_channel'; // <--- ADD THIS CONSTANT

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

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
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const updates: Partial<Omit<Booking, 'id' | 'created_at'>> = {
      status: status as BookingStatus,
    };

    const [updatedBooking, error] = await updateBooking(id, updates);

    if (error) {
      console.error(`API Route Error: PUT /api/bookings/${id} -`, error.message);
      return res.status(500).json({ message: 'Failed to update booking status', error: error.message });
    }

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found or could not be updated.' });
    }

    // --- NEW: Send Supabase Broadcast for updated booking ---
    await supabaseAdmin.channel(BOOKING_CHANNEL_NAME).send({
        type: 'broadcast',
        event: 'booking_updated', // Use 'booking_updated' event
        payload: updatedBooking, // Send the full updated booking object
    });

    return res.status(200).json(updatedBooking);

  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}