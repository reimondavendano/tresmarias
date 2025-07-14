import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle POST requests for admin logout
  if (req.method === 'POST') {
    try {
      // Clear the HTTP-only cookie
      res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');

      return res.status(200).json({
        success: true,
        message: 'Logout successful',
      });

    } catch (error: any) {
      console.error('API Route Error: POST /api/auth/logout -', error.message);
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