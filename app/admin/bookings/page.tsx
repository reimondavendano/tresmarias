'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Eye, Calendar, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchBookings, updateBookingStatus, setPage } from '@/store/slices/bookingSlice'; // Import setPage
import { AdminLayout } from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { Booking } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';


export default function AdminBookingsPage() {
  const isAuthenticated = useAppSelector((state) => state.admin.isAuthenticated);
  const bookings = useAppSelector((state) => state.booking.bookings);
  const isLoadingBookings = useAppSelector((state) => state.booking.isLoading);
  const errorBookings = useAppSelector((state) => state.booking.error);
  const currentPage = useAppSelector((state) => state.booking.currentPage);
  const pageSize = useAppSelector((state) => state.booking.pageSize);
  const totalPages = useAppSelector((state) => state.booking.totalPages);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingBookingIds, setUpdatingBookingIds] = useState<Set<string>>(new Set());

  const getBookings = useCallback((page: number, search: string, status: string) => {
    dispatch(fetchBookings({ page, pageSize, searchTerm: search, statusFilter: status }));
  }, [dispatch, pageSize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    } else {
      getBookings(currentPage, searchTerm, statusFilter);
    }
  }, [isAuthenticated, router, currentPage, searchTerm, statusFilter, getBookings]);

  if (!isAuthenticated) {
    return null;
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
    setUpdatingBookingIds(prev => new Set(prev).add(bookingId));
    const resultAction = await dispatch(updateBookingStatus({ id: bookingId, status: newStatus }));
    setUpdatingBookingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(bookingId);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    if (!dateString || !timeString) return 'N/A';
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(setPage(page));
    }
  };

  const handleSearch = () => {
    dispatch(setPage(1)); // Reset to first page on new search
    getBookings(1, searchTerm, statusFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    dispatch(setPage(1)); // Reset to first page on status filter change
    // getBookings will be called by useEffect due to statusFilter change
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
            <h1 className="font-display text-3xl font-bold text-salon-primary">
              Booking Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all customer bookings and appointments
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer name, service, or email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <Button onClick={handleSearch} className="bg-salon-primary hover:bg-salon-primary/90">
                Apply Search
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  onClick={() => handleStatusFilterChange(status)}
                  className={statusFilter === status ? 'bg-salon-primary hover:bg-salon-primary/90' : ''}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardContent className="p-0">
            {bookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Stylist</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking: Booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium text-salon-dark">{booking.customer?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{booking.customer?.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{booking.customer?.phone || booking.customer_phone || 'N/A'}</div>
                      </TableCell>
                      <TableCell>{booking.service?.name || 'N/A'}</TableCell>
                      <TableCell>{booking.stylist?.name || 'Any Available'}</TableCell>
                      <TableCell>{formatDateTime(booking.booking_date, booking.booking_time)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        P{booking.total_amount?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={updatingBookingIds.has(booking.id)}
                              >
                                {updatingBookingIds.has(booking.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                disabled={updatingBookingIds.has(booking.id)}
                              >
                                {updatingBookingIds.has(booking.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={updatingBookingIds.has(booking.id)}
                            >
                              {updatingBookingIds.has(booking.id) ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                              Complete
                            </Button>
                          )}
                           {/* View details button (optional, if you have a detail page) */}
                          {/* <Button size="sm" variant="outline" onClick={() => router.push(`/admin/bookings/${booking.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No bookings have been made yet.'}
                </p>
              </CardContent>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </AdminLayout>
  );
}