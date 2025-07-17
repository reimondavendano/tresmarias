'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { AdminLayout } from '@/components/admin/AdminLayout';
import ServiceBannerManager from '@/components/admin/ServiceBannerManager'; // Import the new component

export default function AdminServiceBannersPage() {
  const isAuthenticated = useAppSelector((state) => state.admin.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Don't render anything until authenticated
  }

  return (
    <AdminLayout>
      {/* Render the ServiceBannerManager component inside the AdminLayout */}
      <ServiceBannerManager />
    </AdminLayout>
  );
}