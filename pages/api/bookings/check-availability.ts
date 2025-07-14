// pages/api/bookings/check-availability.ts
// This Next.js API Route handles requests to /api/bookings/check-availability.
// It serves as the server-side endpoint for checking time slot availability.

import type { NextApiRequest, NextApiResponse } from 'next';
import { checkTimeSlotAvailability } from '@/utils/supabase/booking'; // Import the service to check availability

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests to check availability
  if (req.method === 'GET') {
    const { date, time, stylistId } = req.query;

    if (!date || !time) {
      return res.status(400).json({ 
        message: 'Missing required parameters', 
        error: 'Date and time are required' 
      });
    }

    const [isAvailable, error] = await checkTimeSlotAvailability(
      date as string, 
      time as string, 
      stylistId as string | undefined
    );

    if (error) {
      console.error('API Route Error: GET /api/bookings/check-availability -', error.message);
      return res.status(500).json({ message: 'Failed to check availability', error: error.message });
    }

    // Send a 200 OK response with availability status
    return res.status(200).json({ available: isAvailable });

  // Handle other HTTP methods not allowed
  } else {
    // Inform the client which methods are allowed for this endpoint
    res.setHeader('Allow', ['GET']);
    // Send a 405 Method Not Allowed response
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}