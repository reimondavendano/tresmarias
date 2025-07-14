'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, Calendar, CreditCard, Loader2 } from 'lucide-react'; // Added Loader2
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector, useAppDispatch } from '@/store/hooks'; // Import useAppDispatch
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { fetchBookings } from '@/store/slices/bookingSlice'; // Import fetchBookings
import { Booking } from '@/types'; // Import Booking type

export default function AdminRevenuePage() {
  const isAuthenticated = useAppSelector((state) => state.admin.isAuthenticated);
  const bookings = useAppSelector((state) => state.booking.bookings);
  const isLoadingBookings = useAppSelector((state) => state.booking.isLoading); // Get loading state
  const errorBookings = useAppSelector((state) => state.booking.error); // Get error state
  const dispatch = useAppDispatch(); // Initialize dispatch
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    } else {
      // Fetch bookings when the component mounts and user is authenticated
      dispatch(fetchBookings(20));
    }
  }, [isAuthenticated, router, dispatch]);

  if (!isAuthenticated) {
    return null;
  }

  // Show loading state for bookings
  if (isLoadingBookings) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-3 text-salon-primary" />
          Loading revenue data...
        </div>
      </AdminLayout>
    );
  }

  // Show error state for bookings
  if (errorBookings) {
    return (
      <AdminLayout>
        <div className="text-center text-red-600 p-4">
          Error loading revenue data: {errorBookings}
        </div>
      </AdminLayout>
    );
  }

  // Calculate revenue metrics
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
  const confirmedRevenue = bookings
    .filter(booking => booking.status === 'confirmed' || booking.status === 'completed') // Include completed in confirmed revenue
    .reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
  const pendingRevenue = bookings
    .filter(booking => booking.status === 'pending')
    .reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
  const completedRevenue = bookings
    .filter(booking => booking.status === 'completed')
    .reduce((sum, booking) => sum + (booking.total_amount || 0), 0);

  // Placeholder for change percentages - these would typically come from a comparison with previous period data
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Dummy previous month data for demonstration (replace with actual data if available)
  const dummyPreviousMonthTotal = totalRevenue * 0.9; // Assume 10% growth
  const dummyPreviousMonthConfirmed = confirmedRevenue * 0.92; // Assume 8% growth
  const dummyPreviousMonthCompleted = completedRevenue * 0.85; // Assume 15% growth

  const revenueStats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: calculateChange(totalRevenue, dummyPreviousMonthTotal),
      changeType: totalRevenue >= dummyPreviousMonthTotal ? 'positive' : 'negative',
      icon: DollarSign,
    },
    {
      title: 'Confirmed Revenue',
      value: `$${confirmedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: calculateChange(confirmedRevenue, dummyPreviousMonthConfirmed),
      changeType: confirmedRevenue >= dummyPreviousMonthConfirmed ? 'positive' : 'negative',
      icon: TrendingUp,
    },
    {
      title: 'Pending Bookings', // Changed title to reflect count, not revenue
      value: `${bookings.filter(b => b.status === 'pending').length} bookings`, // Display count
      change: `Worth $${pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // Show worth
      changeType: 'neutral',
      icon: Calendar,
    },
    {
      title: 'Completed Revenue',
      value: `$${completedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: calculateChange(completedRevenue, dummyPreviousMonthCompleted),
      changeType: completedRevenue >= dummyPreviousMonthCompleted ? 'positive' : 'negative',
      icon: CreditCard,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-salon-dark">
            Revenue Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Track your salon's financial performance and revenue trends
          </p>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {revenueStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-salon-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-salon-dark">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}>
                  {stat.change} {stat.title.includes('Pending') ? '' : 'from last month'} {/* Adjusted text for pending */}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* You'll need to pass dynamic data to RevenueChart if it expects it */}
          <RevenueChart />

          {/* Recent High-Value Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-salon-dark">High-Value Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings
                  .filter((booking: Booking) => (booking.total_amount || 0) >= 200) // Access total_amount
                  .slice(0, 5)
                  .map((booking: Booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-salon-dark">{booking.customer?.name || 'N/A'}</p> {/* Access nested customer name */}
                        <p className="text-sm text-gray-600">{booking.service?.name || 'N/A'}</p> {/* Access nested service name */}
                        <p className="text-xs text-gray-500">{new Date(booking.booking_date).toLocaleDateString()}</p> {/* Use booking_date */}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-salon-primary text-lg">${(booking.total_amount || 0).toFixed(2)}</p> {/* Access total_amount */}
                        <p className="text-xs text-gray-500">{booking.status}</p>
                      </div>
                    </div>
                  ))}
              </div>
              {bookings.filter((booking: Booking) => (booking.total_amount || 0) >= 200).length === 0 && (
                <p className="text-center text-gray-500 mt-4">No high-value bookings found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
