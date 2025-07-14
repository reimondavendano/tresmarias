'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Eye, Calendar, Search, Loader2 } from 'lucide-react'; // Added Loader2
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchBookings, updateBookingStatus } from '@/store/slices/bookingSlice'; // Import fetchBookings
import { AdminLayout } from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { Booking } from '@/types'; // Import Booking type

export default function AdminBookingsPage() {
  const isAuthenticated = useAppSelector((state) => state.admin.isAuthenticated);
  const bookings = useAppSelector((state) => state.booking.bookings);
  const isLoadingBookings = useAppSelector((state) => state.booking.isLoading); // Get loading state
  const errorBookings = useAppSelector((state) => state.booking.error); // Get error state
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingBookingIds, setUpdatingBookingIds] = useState<Set<string>>(new Set()); // New state to track individual booking updates

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    } else {
      // Fetch bookings when the component mounts and user is authenticated
      dispatch(fetchBookings(20));
    }
  }, [isAuthenticated, router, dispatch]); // Add dispatch to dependency array

  if (!isAuthenticated) {
    return null; // Or a loading spinner/message
  }

  const filteredBookings = bookings.filter((booking: Booking) => {
    // Ensure nested properties exist before accessing them
    const customerName = booking.customer?.name || '';
    const serviceName = booking.service?.name || '';
    const customerEmail = booking.customer?.email || '';

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
    setUpdatingBookingIds(prev => new Set(prev).add(bookingId)); // Add booking ID to set when update starts
    const resultAction = await dispatch(updateBookingStatus({ id: bookingId, status: newStatus }));
    setUpdatingBookingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(bookingId); // Remove booking ID from set after update completes (fulfilled or rejected)
      return newSet;
    });

    if (updateBookingStatus.fulfilled.match(resultAction)) {
      toast.success(`Booking status updated to ${newStatus}.`);
    } else {
      toast.error(`Failed to update booking status: ${resultAction.payload || 'An unknown error occurred.'}`);
    }
  };

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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoadingBookings) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-3 text-salon-primary" />
          Loading bookings...
        </div>
      </AdminLayout>
    );
  }

  if (errorBookings) {
    return (
      <AdminLayout>
        <div className="text-center text-red-600 p-4">
          Error loading bookings: {errorBookings}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display text-3xl font-bold text-salon-dark">
              Booking Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all customer bookings and appointments
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer name, service, or email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? 'bg-salon-primary hover:bg-salon-primary/90' : ''}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="grid gap-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking: Booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-salon-dark">
                          {booking.customer?.name || 'N/A'} {/* Access nested customer name */}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Service</p>
                          <p>{booking.service?.name || 'N/A'}</p> {/* Access nested service name */}
                        </div>
                        <div>
                          <p className="font-medium">Stylist</p>
                          <p>{booking.stylist?.name || 'Any Available'}</p> {/* Access nested stylist name */}
                        </div>
                        <div>
                          <p className="font-medium">Date & Time</p>
                          <p>{formatDate(booking.booking_date)} at {booking.booking_time}</p> {/* Use booking_date and booking_time */}
                        </div>
                        <div>
                          <p className="font-medium">Contact</p>
                          <p>{booking.customer?.email || 'N/A'}</p> {/* Access nested customer email */}
                          <p>{booking.customer?.phone || booking.customer_phone || 'N/A'}</p> {/* Access nested customer phone or direct customer_phone */}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-salon-primary">${booking.total_amount?.toFixed(2) || '0.00'}</p> {/* Use total_amount */}
                        <p className="text-xs text-gray-500">
                          Booked {new Date(booking.created_at).toLocaleDateString()} {/* Use created_at */}
                        </p>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={updatingBookingIds.has(booking.id)} // Disable while updating
                          >
                            {updatingBookingIds.has(booking.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            disabled={updatingBookingIds.has(booking.id)} // Disable while updating
                          >
                            {updatingBookingIds.has(booking.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                          </Button>
                        </div>
                      )}
                      {booking.status === 'confirmed' && ( // Option to mark as completed
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={updatingBookingIds.has(booking.id)} // Disable while updating
                        >
                          {updatingBookingIds.has(booking.id) ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No bookings have been made yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
