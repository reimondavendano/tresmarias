// newServiceSelection (renamed to ServiceSelection for clarity)

'use client';

import { useState, useEffect } from 'react';
import { Clock, ArrowRight, Tag, Sparkles } from 'lucide-react'; // Added Tag and Sparkles import
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentBooking } from '@/store/slices/bookingSlice';
import { fetchServices } from '@/store/slices/servicesSlice';
import { fetchActiveBanner } from '@/store/slices/serviceBannerSlice'; // Import fetchActiveBanner
import { Service } from '@/types';
import { RootState } from '@/store/store'; // Import RootState


interface ServiceSelectionProps {
  onNext: () => void;
}

export function ServiceSelection({ onNext }: ServiceSelectionProps) {
  const dispatch = useAppDispatch();
  const services = useAppSelector((state) => state.services.services);
  const isLoadingServices = useAppSelector((state) => state.services.isLoadingServices);
  const errorServices = useAppSelector((state) => state.services.errorServices);
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);

  // Access active banner from Redux store
  const { activeBanner, isLoading: isLoadingBanner, error: errorBanner } = useAppSelector((state: RootState) => state.serviceBanner);


  const [selectedService, setSelectedService] = useState<Service | null>(
    currentBooking.service_id
      ? services.find(s => s.id === currentBooking.service_id) || null
      : null
  );

  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchActiveBanner()); // Fetch the active banner here too
  }, [dispatch]);

  // Dynamically generate categories based on fetched services
  const dynamicCategories = Array.from(new Set(services.map(service => service.category)))
    .map(category => {
      let color = 'bg-gray-100 text-gray-800'; // Default color
      let name = category; // Default name, can be refined

      switch (category) {
        case 'hair':
          name = 'Hair Services';
          color = 'bg-pink-100 text-pink-800';
          break;
        case 'facial':
          name = 'Facial Treatments';
          color = 'bg-purple-100 text-purple-800';
          break;
        case 'nails':
          name = 'Nail Care';
          color = 'bg-blue-100 text-blue-800';
          break;
        case 'foot':
          name = 'Footspa';
          color = 'bg-green-100 text-green-800';
          break;
        // Add more cases for other specific categories if needed
        default:
          // Capitalize the first letter for unknown categories
          name = category.charAt(0).toUpperCase() + category.slice(1) + ' Services';
          break;
      }
      return { id: category, name, color };
    });

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Use total_price if available, otherwise fallback to price
    dispatch(setCurrentBooking({
      service_id: service.id,
      total_amount: service.total_price !== undefined ? service.total_price : service.price,
    }));
  };

  const handleNext = () => {
    if (selectedService) {
      onNext();
    }
  };

  if (isLoadingServices) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 mr-3 text-salon-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading services...
      </div>
    );
  }

  if (errorServices) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading services: {errorServices}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center text-gray-600 p-4">
        No services available at the moment. Please check back later!
      </div>
    );
  }

  return (
    <div className="space-y-8">
     
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-salon-dark mb-4">
          Choose Your Service
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select from our range of premium beauty and wellness services.
          Each treatment is designed to provide you with the ultimate luxury experience.
        </p>
      </div>

       {/* Active Banner Display (Aligned with content) - Corporate Design */}
      {/* Added condition: activeBanner.title !== "Regular" */}
      {!isLoadingBanner && !errorBanner && activeBanner && activeBanner.title && activeBanner.title !== "Regular" && (
        <div className="mb-12 mx-auto max-w-2xl"> {/* Aligned with mx-auto, reduced max-width */}
          {/* Redesigned banner div to match the "Special Discount" image style */}
          <div className="relative bg-white p-6 rounded-lg shadow-xl overflow-hidden">
            {/* Background angled elements */}
            <div className="absolute inset-0 bg-gray-200 transform -skew-y-3 z-0"></div>
            <div className="absolute inset-0 bg-gray-800 transform skew-y-3 z-0 opacity-75"></div>
            <div className="absolute inset-0 bg-salon-primary transform -skew-y-6 z-0 opacity-65"></div>

            {/* Content Container */}
           
            <div className="relative z-10 flex items-center py-4"> {/* Changed to flex and items-center */}
              {/* Added the logo image - aligned left */}
              <img 
                src="/assets/img/1.jpg" 
                alt="Company Logo" 
                className="w-24 h-24 object-contain mr-6 rounded-full shadow-md flex-shrink-0" // Added mr-6 for spacing, flex-shrink-0
              />
              <div className="text-left flex-grow"> {/* Added text-left and flex-grow */}
                <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white uppercase tracking-wide leading-none">
                  {activeBanner.title}
                </h3>
                {activeBanner.description && (
                  <p className="text-sm md:text-base text-gray-200 mt-2"> {/* Removed max-w-xl mx-auto */}
                    {activeBanner.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Use dynamicCategories instead of the hardcoded array */}
      {dynamicCategories.map((category) => {
        const categoryServices = services.filter((service: Service) => service.category === category.id);

        if (categoryServices.length === 0) return null;
        return (
          <div key={category.id} className="mb-8">
            <h3 className={`text-xl font-bold mb-4 px-2 py-1 rounded ${category.color}`}>
              {category.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryServices.map((service: Service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg relative ${ // Added relative for discount tag
                    selectedService?.id === service.id
                      ? 'ring-2 ring-salon-primary bg-salon-light'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  {/* Discount Tag - Only show if discount is a number and greater than 0 */}
                  {typeof service.discount === 'number' && service.discount > 0 && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center shadow-md">
                      <Tag className="h-4 w-4 mr-1" /> {/* Using Tag icon */}
                      {`P${service.discount} OFF`}
                    </div>
                  )}

                  <div className="aspect-w-16 aspect-h-12 overflow-hidden rounded-t-lg">
                    <img
                      src={service.image || 'https://placehold.co/400x300/E0E7FF/4338CA?text=Service%20Image'}
                      alt={service.name}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/400x300/E0BBE4/FFFFFF?text=${service.name.replace(/\s/g, '+')}`;
                      }}
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-salon-dark">
                        {service.name}
                      </h3>
                      {/* Price Display Logic */}
                      <div className="flex flex-col items-end"> {/* Align prices to the right */}
                        {typeof service.discount === 'number' && service.discount > 0 ? (
                          <>
                            {/* Original Price (Strikethrough) for discounted items */}
                            <span className="text-sm text-gray-500 line-through">
                              P{service.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {/* Total Price (New Price) for discounted items */}
                            {service.total_price !== undefined && (
                              <span className="text-xl font-bold text-red-600">
                                P{service.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            )}
                            {/* Fallback if total_price is missing but discount exists (should not happen if DB computes) */}
                            {service.total_price === undefined && (
                              <span className="text-xl font-bold text-red-600">
                                P{(service.price * (1 - (service.discount / 100))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            )}
                          </>
                        ) : (
                          // If no discount or discount is 0, display only total_price (or original price if total_price is absent)
                          <span className="text-xl font-bold text-salon-primary">
                            P{(service.total_price !== undefined ? service.total_price : service.price)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    {/* <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration} minutes
                    </div> */}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleNext}
          disabled={!selectedService}
          size="lg"
          className="bg-salon-primary hover:bg-salon-primary/90 text-white"
        >
          Continue to Stylist Selection
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
