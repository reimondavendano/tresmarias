'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/store/hooks';
import { Booking } from '@/types'; // Import the Booking type

export function RecentBookings() {
  const bookings = useAppSelector((state) => state.booking.bookings);
  // Slice to get only the most recent 5 bookings
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="col-span-full p-6 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-salon-dark">Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking: Booking) => ( // Explicitly type booking
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-salon-dark">{booking.customer?.name || 'N/A'}</p> {/* Access nested customer name */}
                  <p className="text-sm text-gray-600">{booking.service?.name || 'N/A'}</p> {/* Access nested service name */}
                  <p className="text-xs text-gray-500">
                    {formatDate(booking.booking_date)} at {booking.booking_time} {/* Use booking_date and booking_time */}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  <p className="font-semibold text-salon-primary">P{(booking.total_amount || 0).toFixed(2)}</p> {/* Access total_amount */}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-4">No recent bookings found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
