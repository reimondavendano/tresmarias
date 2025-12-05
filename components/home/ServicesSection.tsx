'use client';

import Link from 'next/link';
import { Clock, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockServices } from '@/lib/mockData';

const MESSENGER_LINK = "https://www.facebook.com/messages/t/257099821110072";

export function ServicesSection() {

  return (
    <section id="services" className="py-20 bg-salon-neutral relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-salon-dark mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Renowned for excellence in hair rebonding, precision haircuts, and expert nail and foot care — including manicure, pedicure, and relaxing foot spa treatments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {mockServices.map((service, index) => (
            <Card
              key={service.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden relative hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={service.image || '/assets/img/1.jpg'}
                  alt={service.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
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
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <a href={MESSENGER_LINK} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-salon-primary hover:bg-salon-primary/90 text-white font-bold h-12 px-8 shadow-md hover:shadow-xl transition-shadow">
              Book Your Service Now
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
