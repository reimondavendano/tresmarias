// pages/api/services/[id].ts
// This Next.js API Route handles requests to /api/services/[id].
// It serves as the server-side endpoint for updating and deleting specific services.

import type { NextApiRequest, NextApiResponse } from 'next';
import { updateService, deleteService, fetchServiceById } from '@/utils/supabase/services';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ 
      message: 'Invalid service ID', 
      error: 'Service ID is required and must be a string' 
    });
  }

  if (req.method === 'GET') {
    const [service, error] = await fetchServiceById(id);

    if (error) {
      console.error(`API Route Error: GET /api/services/${id} -`, error.message);
      return res.status(500).json({ message: 'Failed to fetch service', error: error.message });
    }

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    return res.status(200).json(service);

  // Handle PUT requests to update a service
  } else if (req.method === 'PUT') {
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        message: 'No updates provided', 
        error: 'Request body must contain fields to update' 
      });
    }

    const [service, error] = await updateService(id, updates);

    if (error) {
      console.error('API Route Error: PUT /api/services/[id] -', error.message);
      return res.status(500).json({ message: 'Failed to update service', error: error.message });
    }

    return res.status(200).json(service);

  // Handle DELETE requests to delete a service
  } else if (req.method === 'DELETE') {
    const [success, error] = await deleteService(id);

    if (error) {
      console.error('API Route Error: DELETE /api/services/[id] -', error.message);
      return res.status(500).json({ message: 'Failed to delete service', error: error.message });
    }

    if (!success) {
      return res.status(404).json({ message: 'Service not found' });
    }

    return res.status(200).json({ message: 'Service deleted successfully' });

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}