'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentBooking } from '@/store/slices/bookingSlice';

interface StylistSelectionProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function StylistSelection({ onNext, onPrevious }: StylistSelectionProps) {
  const stylists = useAppSelector((state) => state.services.stylists);
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);
  const dispatch = useAppDispatch();
  const [selectedStylist, setSelectedStylist] = useState(currentBooking.stylist || '');

  const availableStylists = stylists.filter(stylist => stylist.available);

  const handleStylistSelect = (stylist: any) => {
    setSelectedStylist(stylist.name);
    dispatch(setCurrentBooking({
      stylist: stylist.name,
    }));
  };

  const handleNext = () => {
    if (selectedStylist) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-salon-dark mb-4">
          Choose Your Stylist
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our expert stylists are passionate about their craft and dedicated to making you look and feel amazing. 
          Select your preferred professional or let us match you with the perfect stylist.
        </p>
      </div>

      {/* Any Stylist Option */}
      <Card
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
          selectedStylist === 'Any Available Stylist'
            ? 'ring-2 ring-salon-primary bg-salon-light'
            : 'hover:shadow-md'
        }`}
        onClick={() => handleStylistSelect({ name: 'Any Available Stylist' })}
      >
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-salon-gradient rounded-full flex items-center justify-center">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-salon-dark mb-1">
                Any Available Stylist
              </h3>
              <p className="text-gray-600 text-sm">
                Let us match you with one of our talented professionals based on your service and availability.
              </p>
            </div>
            <div className="text-salon-primary">
              <span className="text-sm font-medium">Recommended</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Stylists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {availableStylists.map((stylist) => (
          <Card
            key={stylist.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedStylist === stylist.name
                ? 'ring-2 ring-salon-primary bg-salon-light'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleStylistSelect(stylist)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={stylist.image}
                    alt={stylist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-salon-dark mb-2">
                    {stylist.name}
                  </h3>
                  <div className="flex items-center mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-600">
                      {stylist.rating}
                    </span>
                    <Award className="h-4 w-4 text-salon-primary ml-3" />
                    <span className="ml-1 text-sm text-gray-600">
                      {stylist.experience} years exp
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {stylist.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2 py-1 bg-white text-salon-dark text-xs rounded-full border border-salon-primary/20"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          size="lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedStylist}
          size="lg"
          className="bg-salon-primary hover:bg-salon-primary/90 text-white"
        >
          Continue to Date & Time
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}