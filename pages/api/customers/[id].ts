// pages/api/customers/[id].ts
// This Next.js API Route handles requests to /api/customers/{id}.
// It serves as the server-side endpoint for fetching, updating, and deleting specific customers.

import type { NextApiRequest, NextApiResponse } from 'next';
// Note: These imports assume you have corresponding functions in your supabaseService file.
import { fetchCustomerById, updateCustomer, deleteCustomer } from '@/utils/supabase/customers';
import { Customer } from '@/types'; // Import Customer type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      message: 'Invalid customer ID',
      error: 'Customer ID is required and must be a string'
    });
  }

  if (req.method === 'GET') {
    const [customer, error] = await fetchCustomerById(id);

    if (error) {
      console.error(`API Route Error: GET /api/customers/${id} -`, error.message);
      return res.status(500).json({ message: 'Failed to fetch customer', error: error.message });
    }

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    return res.status(200).json(customer);

  // Handle PUT requests to update a customer
  } else if (req.method === 'PUT') {
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'No updates provided',
        error: 'Request body must contain fields to update'
      });
    }

    const [customer, error] = await updateCustomer(id, updates);

    if (error) {
      console.error('API Route Error: PUT /api/customers/[id] -', error.message);
      return res.status(500).json({ message: 'Failed to update customer', error: error.message });
    }

    return res.status(200).json(customer);

  // Handle DELETE requests to delete a customer
  } else if (req.method === 'DELETE') {
    const [success, error] = await deleteCustomer(id);

    if (error) {
      console.error('API Route Error: DELETE /api/customers/[id] -', error.message);
      return res.status(500).json({ message: 'Failed to delete customer', error: error.message });
    }

    if (!success) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json({ message: 'Customer deleted successfully' });

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
