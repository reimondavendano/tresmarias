import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { fetchDashboardStats } from '@/utils/supabase/index'; // Import the service to fetch dashboard statistics

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests for dashboard statistics
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

      // Get dashboard statistics using the supabase service
      const [stats, error] = await fetchDashboardStats();

      if (error) {
        console.error('API Route Error: GET /api/dashboard/stats -', error.message);
        return res.status(500).json({ 
          message: 'Failed to fetch dashboard statistics',
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: stats,
      });

    } catch (error: any) {
      console.error('API Route Error: GET /api/dashboard/stats -', error.message);
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