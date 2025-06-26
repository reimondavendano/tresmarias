'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentBooking } from '@/store/slices/bookingSlice';

interface DateTimeSelectionProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function DateTimeSelection({ onNext, onPrevious }: DateTimeSelectionProps) {
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);
  const dispatch = useAppDispatch();
  const [selectedDate, setSelectedDate] = useState(currentBooking.date || '');
  const [selectedTime, setSelectedTime] = useState(currentBooking.time || '');

  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // Time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30'
  ];

  const dates = generateDates();

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    dispatch(setCurrentBooking({ date: dateString }));
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    dispatch(setCurrentBooking({ time }));
  };

  const handleNext = () => {
    if (selectedDate && selectedTime) {
      onNext();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-salon-dark mb-4">
          Select Date & Time
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose your preferred appointment date and time. We recommend booking in advance 
          to ensure availability with your chosen stylist.
        </p>
      </div>

      {/* Date Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-salon-primary" />
          <h3 className="font-semibold text-lg text-salon-dark">Select Date</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {dates.map((date) => {
            const dateString = date.toISOString().split('T')[0];
            const isSelected = selectedDate === dateString;
            
            return (
              <Card
                key={dateString}
                className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                  isSelected
                    ? 'ring-2 ring-salon-primary bg-salon-primary text-white'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleDateSelect(date)}
              >
                <CardContent className="p-4 text-center">
                  <div className="font-medium text-sm mb-1">
                    {isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-bold">
                    {date.getDate()}
                  </div>
                  <div className="text-xs opacity-75">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-salon-primary" />
            <h3 className="font-semibold text-lg text-salon-dark">Select Time</h3>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time;
              
              return (
                <Button
                  key={time}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-12 ${
                    isSelected
                      ? 'bg-salon-primary hover:bg-salon-primary/90 text-white'
                      : 'hover:border-salon-primary hover:text-salon-primary'
                  }`}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          size="lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stylist
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedDate || !selectedTime}
          size="lg"
          className="bg-salon-primary hover:bg-salon-primary/90 text-white"
        >
          Continue to Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}