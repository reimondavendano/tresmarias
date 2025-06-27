'use client';

import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';
import { fetchServices } from '@/store/slices/servicesSlice';

type Service = {
  id: string;
  name: string;
  description: string;
  image: string;
  duration: number;
};

export function ServicesSection() {
  const dispatch = useAppDispatch();
  const { services, isLoadingServices, errorServices } = useAppSelector((state) => state.services);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]); // Dependency array includes dispatch to ensure effect runs if dispatch changes (though it's stable)

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
            {services.map((service, index) => (
              <Card 
                key={service.id} 
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                  <img
                    src={service.image}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration} mins
                    </div>
                    <Link href="/booking" className="text-salon-primary hover:text-salon-dark transition-colors">
                      <ArrowRight className="h-5 w-5" />
                    </Link>
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