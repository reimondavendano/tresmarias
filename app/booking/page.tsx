'use client';

import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentBooking, createBooking, clearCurrentBooking } from '@/store/slices/bookingSlice';
import { ServiceSelection } from '@/components/booking/ServiceSelection';
import { StylistSelection } from '@/components/booking/StylistSelection';
import { DateTimeSelection } from '@/components/booking/DateTimeSelection';
import { CustomerDetails } from '@/components/booking/CustomerDetails';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { BookingData } from '@/types';

const steps = [
  { id: 1, name: 'Service', icon: Calendar },
  { id: 2, name: 'Stylist', icon: User },
  { id: 3, name: 'Date & Time', icon: Clock },
  { id: 4, name: 'Details', icon: MapPin },
  { id: 5, name: 'Confirm', icon: Calendar },
];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);
  const { isCreating, createError } = useAppSelector((state) => state.booking);
  const dispatch = useAppDispatch();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Ensure all required fields are present and correctly typed
    const bookingData: BookingData = {
      service_id: currentBooking.service_id || '',
      booking_date: currentBooking.booking_date || '',
      booking_time: currentBooking.booking_time || '',
      customer_name: currentBooking.customer_name || '',
      customer_email: currentBooking.customer_email || '',
      customer_phone: currentBooking.customer_phone || '',
      total_amount: currentBooking.total_amount || 0,
      customer_id: currentBooking.customer_id || '', // Ensure customer_id is included
      // Optional fields, provide default undefined if not present
      stylist_id: currentBooking.stylist_id || undefined,
      special_requests: currentBooking.special_requests || undefined
    };

    // Log the bookingData to inspect its contents before dispatching
    console.log('Booking Data to be sent:', bookingData);

    // Dispatch the createBooking async thunk
    const resultAction = await dispatch(createBooking(bookingData));

    // Check if the booking creation was successful
    if (createBooking.fulfilled.match(resultAction)) {
      dispatch(clearCurrentBooking()); // Clear the current booking state
      // Redirect to confirmation or home page on success
      window.location.href = '/booking/confirmation';
    } else {
      // Handle error, e.g., display a message to the user
      console.error('Failed to create booking:', createError || 'An unknown error occurred.');
      // You might want to show a user-friendly error message here
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ServiceSelection onNext={handleNext} />;
      case 2:
        return <StylistSelection onNext={handleNext} onPrevious={handlePrevious} />;
      case 3:
        return <DateTimeSelection onNext={handleNext} onPrevious={handlePrevious} />;
      case 4:
        return <CustomerDetails onNext={handleNext} onPrevious={handlePrevious} />;
      case 5:
        return <BookingSummary onComplete={handleComplete} onPrevious={handlePrevious} isCreating={isCreating} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-salon-neutral">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center text-salon-primary hover:text-salon-dark">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </a>
            <h1 className="font-display text-2xl font-bold text-salon-dark">
              Book Your Appointment
            </h1>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className="relative flex-1">
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200">
                      <div
                        className="h-full bg-salon-primary transition-all duration-300"
                        style={{
                          width: currentStep > step.id ? '100%' : '0%',
                        }}
                      />
                    </div>
                  )}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
                        ${currentStep === step.id
                          ? 'border-salon-primary bg-salon-primary text-white'
                          : currentStep > step.id
                          ? 'border-salon-primary bg-salon-primary text-white'
                          : 'border-gray-300 bg-white text-gray-500'
                        }
                      `}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`
                        mt-2 text-xs font-medium
                        ${currentStep >= step.id ? 'text-salon-primary' : 'text-gray-500'}
                      `}
                    >
                      {step.name}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepContent()}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-salon-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating your booking...</span>
            </div>
          </div>
        )}
        {createError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {createError}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => dispatch(clearCurrentBooking())}>
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.697l-2.651 2.652a1.2 1.2 0 1 1-1.697-1.697L8.303 10 5.651 7.348a1.2 1.2 0 1 1 1.697-1.697L10 8.303l2.651-2.652a1.2 1.2 0 0 1 1.697 1.697L11.697 10l2.651 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
