'use client';

import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/store/hooks';

export function DashboardStats() {
  const bookings = useAppSelector((state) => state.booking.bookings);

  const stats = [
    {
      title: 'Total Bookings',
      value: bookings.length.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: Calendar,
    },
    {
      title: 'Monthly Revenue',
      value: '$12,450',
      change: '+8%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      title: 'Active Customers',
      value: '86',
      change: '+5%',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Pending Bookings',
      value: bookings.filter(b => b.status === 'pending').length.toString(),
      change: '2 new',
      changeType: 'neutral',
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
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
  );
}