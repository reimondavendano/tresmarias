'use client';

import { useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentBooking } from '@/store/slices/bookingSlice';

interface ServiceSelectionProps {
  onNext: () => void;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: number;
  image: string;
  category: string;
}

export function ServiceSelection({ onNext }: ServiceSelectionProps) {
  const services = useAppSelector((state) => state.services.services);
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);
  const dispatch = useAppDispatch();
  const [selectedService, setSelectedService] = useState(currentBooking.service || '');

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service.name);
    dispatch(setCurrentBooking({
      service: service.name,
      price: service.price,
    }));
  };

  const handleNext = () => {
    if (selectedService) {
      onNext();
    }
  };

  const categories = [
    { id: 'hair', name: 'Hair Services', color: 'bg-pink-100 text-pink-800' },
    { id: 'facial', name: 'Facial Treatments', color: 'bg-purple-100 text-purple-800' },
    { id: 'nails', name: 'Nail Care', color: 'bg-blue-100 text-blue-800' },
    { id: 'foot', name: 'Footspa', color: 'bg-green-100 text-green-800' },
  ];

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

      {categories.map((category) => {
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
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedService === service.name
                      ? 'ring-2 ring-salon-primary bg-salon-light'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="aspect-w-16 aspect-h-12 overflow-hidden rounded-t-lg">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-salon-dark">
                        {service.name}
                      </h3>
                      <span className="text-xl font-bold text-salon-primary">
                        ${service.price}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration} minutes
                    </div>
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