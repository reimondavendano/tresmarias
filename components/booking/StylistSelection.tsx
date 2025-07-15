'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import { ArrowLeft, ArrowRight, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming relative path
import { Card, CardContent } from '@/components/ui/card'; // Assuming relative path
import { useAppSelector, useAppDispatch } from '@/store/hooks'; // Assuming relative path
import { setCurrentBooking } from '@/store/slices/bookingSlice'; // Assuming relative path
import { fetchStylists } from '@/store/slices/stylistsSlice'; // Import fetchStylists thunk
import { Stylist } from '@/types'; // Import the Stylist type from your types file

interface StylistSelectionProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function StylistSelection({ onNext, onPrevious }: StylistSelectionProps) {
  const dispatch = useAppDispatch();
  const stylists = useAppSelector((state) => state.stylists.stylists); // Corrected selector to state.stylists
  const isLoadingStylists = useAppSelector((state) => state.stylists.isLoadingStylists);
  const errorStylists = useAppSelector((state) => state.stylists.errorStylists);
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);

  // Find the special "Any Available Stylist" entry if it exists in the fetched data
  const anyStylistOption = stylists.find(
    (s) => s.name === "Any Available Stylist" || s.name === "Any Recommended Stylist"
  );

  // Initialize selectedStylist state using stylist_id from currentBooking
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(() => {
    if (currentBooking.stylist_id) {
      // If a stylist_id is already in currentBooking, try to find the full stylist object
      const foundStylist = stylists.find(s => s.id === currentBooking.stylist_id);
      // If the found stylist is the "Any" option, set selectedStylist to anyStylistOption
      if (foundStylist && (foundStylist.id === anyStylistOption?.id)) {
        return anyStylistOption || null;
      }
      return foundStylist || null;
    }
    return null; // Default to no selection
  });

  // Fetch stylists when the component mounts
  useEffect(() => {
    dispatch(fetchStylists());
  }, [dispatch]);

  // Filter stylists based on availability AND exclude the special "Any" stylist
  const availableStylists = stylists.filter(
    (stylist: Stylist) =>
      stylist.is_available &&
      stylist.name !== "Any Recommended Stylist" && // Exclude from individual list
      stylist.name !== "Any Available Stylist" // Exclude from individual list if named this way
  );

  const handleStylistSelect = (stylist: Stylist | null) => {
    setSelectedStylist(stylist);
    dispatch(setCurrentBooking({
      // If a specific stylist object is passed, use its ID.
      // If null is passed (meaning "Any Available Stylist" was clicked),
      // use the ID of the 'anyStylistOption' if it was found from the database.
      // Otherwise, set to undefined.
      stylist_id: stylist ? stylist.id : (anyStylistOption ? anyStylistOption.id : undefined),
      // You might also want to store stylist.name for display purposes
      // e.g., stylistName: stylist ? stylist.name : (anyStylistOption?.name || 'Any Available Stylist'),
    }));
  };

  const handleNext = () => {
    // Check if a stylist is selected (either a specific one or the "Any" option)
    if (selectedStylist !== null) {
      onNext();
    }
  };

  if (isLoadingStylists) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 mr-3 text-salon-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading stylists...
      </div>
    );
  }

  if (errorStylists) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading stylists: {errorStylists}
      </div>
    );
  }

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
          selectedStylist?.id === anyStylistOption?.id // Highlight if the "Any" option is selected
            ? 'ring-2 ring-salon-primary bg-salon-light'
            : 'hover:shadow-md'
        }`}
        onClick={() => handleStylistSelect(anyStylistOption || null)} // Pass the actual 'anyStylistOption' object or null
      >
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-salon-gradient rounded-full flex items-center justify-center">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-salon-dark mb-1">
                {anyStylistOption?.name || 'Any Available Stylist'} {/* Dynamic name */}
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
        {availableStylists.length > 0 ? (
          availableStylists.map((stylist: Stylist) => (
            <Card
              key={stylist.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedStylist?.id === stylist.id // Compare by ID
                  ? 'ring-2 ring-salon-primary bg-salon-light'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleStylistSelect(stylist)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={stylist.image_url || `https://placehold.co/400x400/E0E7FF/4338CA?text=${stylist.name.split(' ').map(n => n[0]).join('')}`}
                      alt={stylist.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/64x64/E0BBE4/FFFFFF?text=${stylist.name.split(' ').map(n => n[0]).join('')}`;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-salon-dark mb-2">
                      {stylist.name}
                    </h3>
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-600">
                        {stylist.rating.toFixed(1)} {/* Format rating */}
                      </span>
                      <Award className="h-4 w-4 text-salon-primary ml-3" />
                      <span className="ml-1 text-sm text-gray-600">
                        {stylist.experience_years} years exp
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {/* Added conditional check for stylist.specialties */}
                      {Array.isArray(stylist.specialties) && stylist.specialties.length > 0 && stylist.specialties.map((specialty: string) => (
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
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">No stylists available for selection.</p>
        )}
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
          disabled={selectedStylist === null} // Disable if no selection has been made yet (including 'Any')
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
