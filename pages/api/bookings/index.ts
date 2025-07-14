// pages/api/bookings/index.ts
// This Next.js API Route handles requests to /api/bookings.
// It serves as the server-side endpoint for creating and fetching bookings.

import type { NextApiRequest, NextApiResponse } from 'next';
import { createBooking, fetchRecentBookings } from '@/utils/supabase/booking'; // Import the booking service

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle POST requests to create a new booking
  if (req.method === 'POST') {
    const bookingData = req.body;

    // Validate required fields
    const requiredFields = ['service_id', 'booking_date', 'booking_time', 'customer_name', 'customer_email', 'customer_phone', 'total_amount'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        error: `Required fields: ${missingFields.join(', ')}` 
      });
    }

    const [booking, error] = await createBooking(bookingData);

    if (error) {
      console.error('API Route Error: POST /api/bookings -', error.message);
      return res.status(500).json({ message: 'Failed to create booking', error: error.message });
    }

    // Send a 201 Created response with the booking data
    return res.status(201).json(booking);

  // Handle GET requests to fetch recent bookings
  } else if (req.method === 'GET') {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const [bookings, error] = await fetchRecentBookings(limit);

    if (error) {
      console.error('API Route Error: GET /api/bookings -', error.message);
      return res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }

    return res.status(200).json(bookings);

  // Handle other HTTP methods not allowed
  } else {
    // Inform the client which methods are allowed for this endpoint
    res.setHeader('Allow', ['GET', 'POST']);
    // Send a 405 Method Not Allowed response
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}