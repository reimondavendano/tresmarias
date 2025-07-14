'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, Mail, Phone, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchService } from '@/store/slices/servicesSlice'; // Import fetchService (single)
import { fetchStylist } from '@/store/slices/stylistsSlice'; // Import fetchStylist (single)
import { fetchCustomer } from '@/store/slices/customerSlice';
import { Service, Stylist, Customer } from '@/types';

interface BookingSummaryProps {
  onComplete: () => void;
  onPrevious: () => void;
  isCreating: boolean;
}

export function BookingSummary({ onComplete, onPrevious, isCreating }: BookingSummaryProps) {
  const dispatch = useAppDispatch();
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);

  // States to hold fetched full details
  const [serviceDetails, setServiceDetails] = useState<Service | null>(null);
  const [stylistDetails, setStylistDetails] = useState<Stylist | null>(null);
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);

  // Loading and error states from Redux for individual fetches
  const isLoadingService = useAppSelector((state) => state.services.isLoadingSingleService);
  const serviceError = useAppSelector((state) => state.services.singleServiceError);
  const isLoadingStylist = useAppSelector((state) => state.stylists.isFetchingStylist);
  const stylistError = useAppSelector((state) => state.stylists.fetchStylistError);
  const isLoadingCustomer = useAppSelector((state) => state.customers.isFetchingCustomer);
  const customerError = useAppSelector((state) => state.customers.fetchCustomerError);


  useEffect(() => {
    // Fetch Service Details
    if (currentBooking.service_id) {
      dispatch(fetchService(currentBooking.service_id))
        .then((action) => {
          if (fetchService.fulfilled.match(action)) {
            setServiceDetails(action.payload);
          } else {
            console.error("Failed to fetch service details:", action.payload);
            setServiceDetails(null);
          }
        });
    }

    // Fetch Stylist Details
    if (currentBooking.stylist_id) {
      dispatch(fetchStylist({ id: currentBooking.stylist_id }))
        .then((action) => {
          if (fetchStylist.fulfilled.match(action)) {
            setStylistDetails(action.payload);
          } else {
            console.error("Failed to fetch stylist details:", action.payload);
            setStylistDetails(null);
          }
        });
    } else {
      setStylistDetails(null);
    }

    // Fetch Customer Details
    if (currentBooking.customer_id) {
      dispatch(fetchCustomer({ id: currentBooking.customer_id }))
        .then((action) => {
          if (fetchCustomer.fulfilled.match(action)) {
            setCustomerDetails(action.payload);
          } else {
            console.error("Failed to fetch customer details:", action.payload);
            setCustomerDetails(null);
          }
        });
    }
  }, [dispatch, currentBooking.service_id, currentBooking.stylist_id, currentBooking.customer_id]);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Determine if all necessary data is loaded
  const isDataLoading = isLoadingService || isLoadingStylist || isLoadingCustomer;
  // Corrected: Convert hasError to a boolean using !!
  const hasError = !!(serviceError || stylistError || customerError);

  if (isDataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mr-3 text-salon-primary" />
        Loading booking summary...
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading booking details: {serviceError || stylistError || customerError}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-salon-dark mb-4">
          Confirm Your Booking
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Please review your appointment details below. Once confirmed,
          we'll send you a confirmation email with all the details.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-salon-primary" />
              <span>Service Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service</span>
              <span className="font-medium text-salon-dark">
                {serviceDetails?.name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stylist</span>
              <span className="font-medium text-salon-dark">
                {stylistDetails?.name || 'Any Available Stylist'}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-salon-dark">
                {currentBooking.booking_date && formatDate(currentBooking.booking_date)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time</span>
              <span className="font-medium text-salon-dark">
                {currentBooking.booking_time && formatTime(currentBooking.booking_time)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-salon-primary" />
              <span>Customer Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Name</span>
              <span className="font-medium text-salon-dark">{customerDetails?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-salon-dark">{customerDetails?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium text-salon-dark">{customerDetails?.phone || 'N/A'}</span>
            </div>
            {currentBooking.special_requests && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Special Requests</span>
                <span className="font-medium text-salon-dark">{currentBooking.special_requests}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-salon-primary" />
              <span>Price Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service Price</span>
              <span className="font-medium text-salon-dark">${currentBooking.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium text-salon-dark">$0.00</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-salon-dark">Total</span>
              <span className="text-salon-primary">${currentBooking.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Notice */}
        <div className="bg-salon-light p-6 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-salon-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-salon-dark mb-2">Payment & Cancellation Policy</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Payment is due at the time of service</li>
                <li>• We accept cash, credit cards, and digital payments</li>
                <li>• Free cancellation up to 24 hours before your appointment</li>
                <li>• Late cancellations may incur a 50% service fee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          size="lg"
          disabled={isCreating || isDataLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Details
        </Button>
        <Button
          onClick={onComplete}
          size="lg"
          className="bg-salon-primary hover:bg-salon-primary/90 text-white"
          disabled={isCreating || isDataLoading || hasError || !serviceDetails || !customerDetails}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isCreating ? 'Confirming...' : 'Confirm Booking'}
        </Button>
      </div>
    </div>
  );
}
