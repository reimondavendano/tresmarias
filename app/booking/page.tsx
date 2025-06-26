'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentBooking, addBooking } from '@/store/slices/bookingSlice';
import { ServiceSelection } from '@/components/booking/ServiceSelection';
import { StylistSelection } from '@/components/booking/StylistSelection';
import { DateTimeSelection } from '@/components/booking/DateTimeSelection';
import { CustomerDetails } from '@/components/booking/CustomerDetails';
import { BookingSummary } from '@/components/booking/BookingSummary';

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

  const handleComplete = () => {
    const booking = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: currentBooking.customerName || '',
      email: currentBooking.email || '',
      phone: currentBooking.phone || '',
      service: currentBooking.service || '',
      stylist: currentBooking.stylist || '',
      date: currentBooking.date || '',
      time: currentBooking.time || '',
      price: currentBooking.price || 0,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    dispatch(addBooking(booking));
    // Redirect to confirmation or home page
    window.location.href = '/booking/confirmation';
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
        return <BookingSummary onComplete={handleComplete} onPrevious={handlePrevious} />;
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
            <Link href="/" className="flex items-center text-salon-primary hover:text-salon-dark">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
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
      </div>
    </div>
  );
}