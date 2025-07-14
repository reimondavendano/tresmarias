'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react'; // Added Loader2 for loading spinner
import { Button } from '@/components/ui/button'; // Assuming relative path
import { Card, CardContent } from '@/components/ui/card'; // Assuming relative path
import { useAppSelector, useAppDispatch } from '@/store/hooks'; // Assuming relative path
import { setCurrentBooking, checkAvailability, clearError } from '@/store/slices/bookingSlice'; // Import checkAvailability and clearError

interface DateTimeSelectionProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function DateTimeSelection({ onNext, onPrevious }: DateTimeSelectionProps) {
  const dispatch = useAppDispatch();
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);
  const isAvailabilityLoading = useAppSelector((state) => state.booking.isLoading); // Assuming isLoading for availability check
  const availabilityError = useAppSelector((state) => state.booking.error); // Assuming error for availability check

  const [selectedDate, setSelectedDate] = useState(currentBooking.booking_date || '');
  const [selectedTime, setSelectedTime] = useState(currentBooking.booking_time || '');
  const [isSlotAvailable, setIsSlotAvailable] = useState<boolean | null>(null); // State to store availability

  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    for (let i = 0; i < 14; i++) { // Start from today
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Dynamically generate time slots from 9:00 AM to 6:00 PM (18:00) in 30-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = 9 * 60; // 9:00 AM in minutes
    const endTime = 18 * 60;   // 6:00 PM (18:00) in minutes

    for (let totalMinutes = startTime; totalMinutes <= endTime; totalMinutes += 30) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');
      slots.push(`${formattedHours}:${formattedMinutes}`);
    }
    return slots;
  };

  const dates = generateDates();
  const timeSlots = generateTimeSlots(); // Use the dynamically generated time slots

  // Effect to check availability whenever selectedDate, selectedTime, or stylist_id changes
  useEffect(() => {
    if (selectedDate && selectedTime && currentBooking.stylist_id !== undefined) {
      dispatch(clearError()); // Clear previous errors
      dispatch(checkAvailability({
        date: selectedDate,
        time: selectedTime,
        stylistId: currentBooking.stylist_id || undefined // Pass stylistId if available
      }))
      .then((action) => {
        if (checkAvailability.fulfilled.match(action)) {
          setIsSlotAvailable(action.payload);
        } else if (checkAvailability.rejected.match(action)) {
          setIsSlotAvailable(false); // Assume not available on error
          console.error("Availability check failed:", action.payload);
        }
      });
    } else {
      setIsSlotAvailable(null); // Reset availability if date/time/stylist is not fully selected
    }
  }, [selectedDate, selectedTime, currentBooking.stylist_id, dispatch]);

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    dispatch(setCurrentBooking({ booking_date: dateString })); // Use booking_date
    setSelectedTime(''); // Reset time selection when date changes
    setIsSlotAvailable(null); // Reset availability
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    dispatch(setCurrentBooking({ booking_time: time })); // Use booking_time
  };

  const handleNext = () => {
    // Only proceed if a date and time are selected, and the slot is confirmed available
    if (selectedDate && selectedTime && isSlotAvailable) {
      onNext();
    }
  };

  const formatDateDisplay = (date: Date) => {
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
                    {isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : formatDateDisplay(date)}
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
              // Determine if the current time slot is the one being checked for availability
              const isCheckingThisSlot = isAvailabilityLoading && selectedDate === currentBooking.booking_date && time === currentBooking.booking_time;
              // Determine if the slot should be disabled
              const isDisabled = (isSlotAvailable === false && isSelected) || (isSlotAvailable === false && !isSelected && isCheckingThisSlot);

              return (
                <Button
                  key={time}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-12 ${
                    isSelected
                      ? 'bg-salon-primary hover:bg-salon-primary/90 text-white'
                      : 'hover:border-salon-primary hover:text-salon-primary'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleTimeSelect(time)}
                  disabled={isDisabled || isCheckingThisSlot} // Disable if explicitly unavailable or currently checking
                >
                  {isCheckingThisSlot ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {time}
                </Button>
              );
            })}
          </div>

          {/* Availability Status Message */}
          {selectedDate && selectedTime && isAvailabilityLoading && (
            <p className="text-center text-salon-primary flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Checking availability...
            </p>
          )}
          {selectedDate && selectedTime && isSlotAvailable === true && !isAvailabilityLoading && (
            <p className="text-center text-green-600">
              <CheckCircle className="h-4 w-4 inline-block mr-1" /> This slot is available!
            </p>
          )}
          {selectedDate && selectedTime && isSlotAvailable === false && !isAvailabilityLoading && availabilityError && (
            <p className="text-center text-red-600">
              <XCircle className="h-4 w-4 inline-block mr-1" /> {availabilityError}
            </p>
          )}
          {selectedDate && selectedTime && isSlotAvailable === false && !isAvailabilityLoading && !availabilityError && (
            <p className="text-center text-red-600">
              <XCircle className="h-4 w-4 inline-block mr-1" /> This slot is not available. Please choose another.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          size="lg"
          disabled={isAvailabilityLoading} // Disable navigation during availability check
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stylist
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedDate || !selectedTime || !isSlotAvailable || isAvailabilityLoading} // Disable if not available or loading
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
