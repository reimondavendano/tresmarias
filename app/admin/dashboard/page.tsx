'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { AdminLayout } from '@/components/admin/AdminLayout';
import  DashboardStats  from '@/components/admin/DashboardStats';
import { RecentBookings } from '@/components/admin/RecentBookings';
import { RevenueChart } from '@/components/admin/RevenueChart';

export default function AdminDashboardPage() {
  const isAuthenticated = useAppSelector((state) => state.admin.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
  if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-salon-primary">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening at your salon today.
          </p>
        </div>
        <DashboardStats />
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-2">
          <RecentBookings />
        </div>
      </div>
    </AdminLayout>
  );
}