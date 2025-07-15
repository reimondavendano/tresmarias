'use client';

import React from 'react';
import ServiceManagement from '@/components/admin/ServiceManagement'; // Adjust path if your ServiceManagement component is elsewhere
import { AdminLayout } from '@/components/admin/AdminLayout';

// This is the Next.js page component for /admin/services
export default function AdminServicesPage() {
  return (
    <AdminLayout>
        <ServiceManagement />
    </AdminLayout>
    
  );
}
