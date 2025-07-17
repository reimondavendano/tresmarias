'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchBookings, setPage } from '@/store/slices/bookingSlice'; // Re-use fetchBookings and setPage
import { Booking } from '@/types'; // Import Booking type
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

export function CustomerView() { // Export as a named export
  const bookings = useAppSelector((state) => state.booking.bookings);
  const isLoadingBookings = useAppSelector((state) => state.booking.isLoading);
  const errorBookings = useAppSelector((state) => state.booking.error);
  const currentPage = useAppSelector((state) => state.booking.currentPage);
  const pageSize = useAppSelector((state) => state.booking.pageSize);
  const totalPages = useAppSelector((state) => state.booking.totalPages);

  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Keep status filter for flexibility

  // Memoized function to fetch bookings with current pagination/filter states
  const getBookings = useCallback((page: number, search: string, status: string) => {
    dispatch(fetchBookings({ page, pageSize, searchTerm: search, statusFilter: status }));
  }, [dispatch, pageSize]);

  // Effect to fetch bookings on component mount and when filters/page change
  useEffect(() => {
    getBookings(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter, getBookings]);

  // Handlers for pagination and filters
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(setPage(page));
    }
  };

  const handleSearch = () => {
    dispatch(setPage(1)); // Reset to first page on new search
    // getBookings will be called by useEffect due to searchTerm change
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    dispatch(setPage(1)); // Reset to first page on status filter change
    // getBookings will be called by useEffect due to statusFilter change
  };

  // Helper function to get status color (reused from AdminBookingsPage)
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoadingBookings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mr-3 text-salon-primary" />
        Loading customer bookings...
      </div>
    );
  }

  if (errorBookings) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading customer bookings: {errorBookings}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-salon-primary">
            Customer Bookings Overview
          </h1>
          <p className="text-gray-600 mt-2">
            View all bookings and associated customer details.
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
                placeholder="Search by customer name, email, or service..."
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

      {/* Customer Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Service Booked</TableHead>
                  <TableHead>Booking Status</TableHead>
                  <TableHead>Booked Date</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking: Booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium text-salon-dark">
                      {booking.customer?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {booking.customer?.email || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {booking.customer?.phone || booking.customer_phone || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {booking.service?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(booking.booking_date)}
                    </TableCell>
                    <TableCell className="text-right">
                      P{booking.total_amount?.toFixed(2) || '0.00'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customer bookings found</h3>
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
  );
}