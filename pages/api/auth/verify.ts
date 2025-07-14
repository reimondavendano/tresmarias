import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { fetchAdminById } from '@/utils/supabase/admin'; // Import the service to fetch admin details

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests for token verification
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Get admin details from database using the service
      const [admin, error] = await fetchAdminById(decoded.id);

      if (error) {
        console.error('API Route Error: GET /api/auth/verify -', error.message);
        return res.status(500).json({ 
          message: 'Database error',
          error: error.message
        });
      }

      if (!admin) {
        return res.status(401).json({ 
          message: 'Admin not found',
          error: 'Invalid token or admin deactivated'
        });
      }

      return res.status(200).json({
        success: true,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        },
      });

    } catch (error: any) {
      console.error('API Route Error: GET /api/auth/verify -', error.message);
      return res.status(401).json({ 
        message: 'Invalid token',
        error: error.message
      });
    }

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}