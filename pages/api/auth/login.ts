import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { authenticateAdmin } from '@/utils/supabase/admin'; // Import the authentication service


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle POST requests for admin login
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          message: 'Username and password are required',
          error: 'Missing credentials'
        });
      }

      // Authenticate admin using the service
      const [admin, error] = await authenticateAdmin({ username, password });

      if (error) {
        console.error('API Route Error: POST /api/auth/login -', error.message);
        return res.status(401).json({ 
          message: 'Authentication failed',
          error: error.message
        });
      }

      if (!admin) {
        return res.status(401).json({ 
          message: 'Invalid credentials',
          error: 'Admin not found or invalid password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id, 
          username: admin.username
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      // Set HTTP-only cookie
      res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`);

      // Send success response
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        },
        token,
      });

    } catch (error: any) {
      console.error('API Route Error: POST /api/auth/login -', error.message);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error.message
      });
    }

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}