'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/store/hooks';

export function RecentBookings() {
  const bookings = useAppSelector((state) => state.booking.bookings);
  const recentBookings = bookings.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-salon-dark">Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-salon-dark">{booking.customerName}</p>
                <p className="text-sm text-gray-600">{booking.service}</p>
                <p className="text-xs text-gray-500">{booking.date} at {booking.time}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
                <p className="font-semibold text-salon-primary">${booking.price}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}