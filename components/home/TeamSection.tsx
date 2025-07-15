'use client';

import { Star, Award } from 'lucide-react'; // Assuming lucide-react is installed
import { Card, CardContent } from '@/components/ui/card'; // Assuming shadcn/ui Card component
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Stylist } from '@/types'; // Import the Stylist interface
import { RootState } from '@/store/store'; // Import RootState for type safety
// Import the async thunks from your Redux slice
import { fetchStylists } from '@/store/slices/stylistsSlice';
import { useEffect } from 'react';

export function TeamSection() {
  // Correctly access stylists from the stylists slice
  const dispatch = useAppDispatch();
  const { stylists, isLoadingStylists, errorStylists } = useAppSelector((state: RootState) => state.stylists);

  // Fetch stylists when the component mounts
  useEffect(() => {
    dispatch(fetchStylists());
  }, [dispatch]); // Dependency array includes dispatch to ensure effect runs if dispatch changes (though it's stable)

  if (isLoadingStylists) {
    return (
      <section id="team" className="py-20 bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-gray-600">Loading our expert team...</p>
        </div>
      </section>
    );
  }

  if (errorStylists) {
    return (
      <section id="team" className="py-20 bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-red-600">Error loading team: {errorStylists}</p>
        </div>
      </section>
    );
  }

  // Filter out the specific stylist with name "Any Recommended Stylist"
  const filteredStylists = stylists.filter(
    (stylist: Stylist) => stylist.name !== "Any Available Stylist"
  );

  if (!filteredStylists || filteredStylists.length === 0) {
    return (
      <section id="team" className="py-20 bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-gray-600">No stylists found at the moment.</p>
        </div>
      </section>
    );
  }

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
          {filteredStylists.map((stylist: Stylist, index: number) => ( // Use filteredStylists here
            <Card 
              key={stylist.id} 
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={stylist.image_url || `https://placehold.co/400x400/E0E7FF/4338CA?text=${stylist.name.split(' ').map(n => n[0]).join('')}`} // Use image_url and add a fallback
                  alt={stylist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-xl text-salon-dark mb-2">
                  {stylist.name}
                </h3>

                <div className="flex flex-wrap gap-1 justify-center">
                  {/* Ensure specialties is an array before mapping */}
                  {stylist.specialties && Array.isArray(stylist.specialties) && stylist.specialties.slice(0, 4).map((specialty: string) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-salon-light text-salon-dark text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                {/* Check is_available property */}
                {!stylist.is_available && (
                  <div className="mt-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Currently Unavailable
                    </span>
                  </div>
                )}
                {/* Display rating if available */}
                {stylist.rating !== undefined && (
                  <div className="flex items-center justify-center mt-2 text-yellow-500">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    <span className="text-sm font-medium">{stylist.rating.toFixed(1)}</span>
                  </div>
                )}
                {/* Display experience if available */}
                {/* {stylist.experience_years !== undefined && (
                  <div className="flex items-center justify-center mt-1 text-gray-500">
                    <Award className="w-4 h-4 mr-1" />
                    <span className="text-sm">{stylist.experience_years} Years Experience</span>
                  </div>
                )} */}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
