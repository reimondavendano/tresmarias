// components/home/ServicesSection.tsx
// This component displays the services and dispatches Redux thunks to fetch data.
// It now focuses solely on fetching and displaying services.

'use client';

import Link from 'next/link';
import { Clock, ArrowRight, Tag } from 'lucide-react'; // Import Tag icon for discount
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// Assuming useAppDispatch and useAppSelector are defined in '@/store/hooks'
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';
// Import only the fetchServices async thunk
import { fetchServices } from '@/store/slices/servicesSlice';
import { RootState } from '@/store/store';
import { Service } from '@/types';


export function ServicesSection() {
  // Use typed hooks for better Redux integration
  const dispatch = useAppDispatch();
  const {
    services,
    isLoadingServices,
    errorServices,
  } = useAppSelector((state: RootState) => state.services);

  // Fetch services when the component mounts
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  return (
    <section id="services" className="py-20 bg-salon-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-salon-dark mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Renowned for excellence in hair rebonding, precision haircuts, and expert nail and foot care — including manicure, pedicure, and relaxing foot spa treatments.
          </p>
        </div>

        {isLoadingServices && (
          <div className="text-center text-salon-primary text-xl mb-8">
            Loading services...
          </div>
        )}

        {errorServices && (
          <div className="text-center text-red-500 text-xl mb-8">
            Error: {errorServices}. Please try again later.
          </div>
        )}

        {!isLoadingServices && !errorServices && services.length === 0 && (
          <div className="text-center text-gray-700 text-xl mb-8">
            No services found.
          </div>
        )}

        {!isLoadingServices && !errorServices && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {services.map((service: Service, index: number) => (
              <Card
                key={service.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden relative" // Added relative for absolute positioning of discount tag
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Discount Tag - Only show if discount is greater than 0 */}
                {typeof service.discount === 'number' && service.discount > 0 && ( // Updated condition for safety
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center shadow-md">
                    <Tag className="h-4 w-4 mr-1" /> {/* Using Tag icon */}
                    {/* Display service.discount directly as it's already a percentage value */}
                    {`${service.discount}% OFF`} 
                  </div>
                )}

                <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                  <img
                    src={service.image || 'https://placehold.co/400x300/E0E7FF/4338CA?text=Service%20Image'}
                    alt={service.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-xl text-salon-dark group-hover:text-salon-primary transition-colors">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                      {/* Price Display Logic */}
                      {typeof service.discount === 'number' && service.discount > 0 ? ( // Updated condition for safety
                        <>
                          {/* Original Price (Strikethrough) for discounted items */}
                          <span className="text-sm text-gray-500 line-through mr-2">
                            P{service.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {/* Total Price (New Price) for discounted items */}
                          {service.total_price !== undefined && (
                            <span className="text-lg font-bold text-red-600">
                              P{service.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                          {/* Fallback if total_price is missing but discount exists (should not happen if DB computes) */}
                          {service.total_price === undefined && (
                            <span className="text-lg font-bold text-red-600">
                              P{(service.price * (1 - (service.discount / 100))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </>
                      ) : (
                        // If no discount or discount is 0, display only total_price (or original price if total_price is absent)
                        <span className="text-lg font-bold text-salon-dark">
                          P{(service.total_price !== undefined ? service.total_price : service.price)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href="/booking">
            <Button size="lg" className="bg-salon-primary hover:bg-salon-primary/90 text-white">
              Book Your Service Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
