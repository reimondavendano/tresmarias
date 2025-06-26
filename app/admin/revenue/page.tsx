'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/store/hooks';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RevenueChart } from '@/components/admin/RevenueChart';

export default function AdminRevenuePage() {
  const isAuthenticated = useAppSelector((state) => state.admin.isAuthenticated);
  const bookings = useAppSelector((state) => state.booking.bookings);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  // Calculate revenue metrics
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.price, 0);
  const confirmedRevenue = bookings
    .filter(booking => booking.status === 'confirmed')
    .reduce((sum, booking) => sum + booking.price, 0);
  const pendingRevenue = bookings
    .filter(booking => booking.status === 'pending')
    .reduce((sum, booking) => sum + booking.price, 0);
  const completedRevenue = bookings
    .filter(booking => booking.status === 'completed')
    .reduce((sum, booking) => sum + booking.price, 0);

  const revenueStats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      title: 'Confirmed Revenue',
      value: `$${confirmedRevenue.toLocaleString()}`,
      change: '+8.2%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      title: 'Pending Revenue',
      value: `$${pendingRevenue.toLocaleString()}`,
      change: `${bookings.filter(b => b.status === 'pending').length} bookings`,
      changeType: 'neutral',
      icon: Calendar,
    },
    {
      title: 'Completed Revenue',
      value: `$${completedRevenue.toLocaleString()}`,
      change: '+15.3%',
      changeType: 'positive',
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
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RevenueChart />
          
          {/* Recent High-Value Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-salon-dark">High-Value Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings
                  .filter(booking => booking.price >= 200)
                  .slice(0, 5)
                  .map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-salon-dark">{booking.customerName}</p>
                        <p className="text-sm text-gray-600">{booking.service}</p>
                        <p className="text-xs text-gray-500">{booking.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-salon-primary text-lg">${booking.price}</p>
                        <p className="text-xs text-gray-500">{booking.status}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}