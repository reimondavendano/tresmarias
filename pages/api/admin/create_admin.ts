import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdmin } from '@/utils/supabase/admin'; // Import the service to create an admin

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end();

  // Expect plain password from client
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const [admin, error] = await createAdmin({ username, email, password });
  if (error || !admin) return res.status(400).json({ error: error?.message || 'Failed to create admin' });
  res.status(200).json({ admin });
}