import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { fetchRecentBookings } from '@/utils/supabase/booking';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests for recent bookings
  if (req.method === 'GET') {
    try {
      const token = req.cookies.admin_token || req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ 
          message: 'No token provided',
          error: 'Authentication required'
        });
      }

      // Verify JWT token
      jwt.verify(token, process.env.JWT_SECRET!);

      const limit = parseInt(req.query.limit as string) || 10;

      // Get recent bookings using the supabase service
      const [bookings, error] = await fetchRecentBookings(limit);

      if (error) {
        console.error('API Route Error: GET /api/dashboard/bookings -', error.message);
        return res.status(500).json({ 
          message: 'Failed to fetch recent bookings',
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: bookings,
      });

    } catch (error: any) {
      console.error('API Route Error: GET /api/dashboard/bookings -', error.message);
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ 
          message: 'Invalid token',
          error: error.message
        });
      }
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error.message
      });
    }

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}