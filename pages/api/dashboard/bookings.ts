import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
// Import fetchPaginatedBookings instead of fetchRecentBookings
import { fetchPaginatedBookings } from '@/utils/supabase/booking';

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
      // Ensure process.env.JWT_SECRET is correctly set in your .env.local file
      jwt.verify(token, process.env.JWT_SECRET!); 

      const limit = parseInt(req.query.limit as string) || 10;

      // Use fetchPaginatedBookings to get recent (first page) bookings
      // Pass page = 1, pageSize = limit, an empty searchTerm, and 'all' for statusFilter
      const [result, error] = await fetchPaginatedBookings(1, limit, '', 'all');

      if (error) {
        console.error('API Route Error: GET /api/dashboard/bookings -', error.message);
        return res.status(500).json({ 
          message: 'Failed to fetch recent bookings',
          error: error.message
        });
      }

      // fetchPaginatedBookings returns an object { bookings: [], totalCount: 0 }
      // Extract the 'bookings' array to send as data
      const bookings = result?.bookings || [];

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