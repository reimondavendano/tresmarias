'use client';

import { ArrowLeft, Calendar, Clock, User, Mail, Phone, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppSelector } from '@/store/hooks';

interface BookingSummaryProps {
  onComplete: () => void;
  onPrevious: () => void;
}

export function BookingSummary({ onComplete, onPrevious }: BookingSummaryProps) {
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);

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
              <span className="font-medium text-salon-dark">{currentBooking.service}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stylist</span>
              <span className="font-medium text-salon-dark">{currentBooking.stylist}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-salon-dark">
                {currentBooking.date && formatDate(currentBooking.date)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time</span>
              <span className="font-medium text-salon-dark">
                {currentBooking.time && formatTime(currentBooking.time)}
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
              <span className="font-medium text-salon-dark">{currentBooking.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-salon-dark">{currentBooking.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium text-salon-dark">{currentBooking.phone}</span>
            </div>
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
              <span className="font-medium text-salon-dark">${currentBooking.price}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium text-salon-dark">$0.00</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-salon-dark">Total</span>
              <span className="text-salon-primary">${currentBooking.price}</span>
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
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Details
        </Button>
        <Button
          onClick={onComplete}
          size="lg"
          className="bg-salon-primary hover:bg-salon-primary/90 text-white"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Confirm Booking
        </Button>
      </div>
    </div>
  );
}