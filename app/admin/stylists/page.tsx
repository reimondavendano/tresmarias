'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import StylistManagement from '@/components/admin/StylistManagement';

// This is the Next.js page component for /admin/services
export default function AdminStylistsPage() {
  return (
    <AdminLayout>
        <StylistManagement />
    </AdminLayout>
    
  );
}
