'use client';

import { Star, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/store/hooks';

export function TeamSection() {
  const stylists = useAppSelector((state) => state.services.stylists);

  return (
    <section id="team" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-salon-dark mb-4">
            Meet Our Expert Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our talented professionals bring years of experience and passion for beauty. 
            Each stylist is carefully selected for their expertise and dedication to excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stylists.map((stylist : any, index : any) => (
            <Card 
              key={stylist.id} 
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={stylist.image}
                  alt={stylist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-xl text-salon-dark mb-2">
                  {stylist.name}
                </h3>

                <div className="flex flex-wrap gap-1 justify-center">
                  {stylist.specialties.slice(0, 4).map((specialty : any) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-salon-light text-salon-dark text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                {!stylist.available && (
                  <div className="mt-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Currently Unavailable
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}