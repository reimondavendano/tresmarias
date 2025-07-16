// components/home/GallerySection.tsx
// This component displays a gallery of images with a modal carousel.

'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGalleryImages } from '@/store/slices/gallerySlice';
import { RootState } from '@/store/store';
import { GalleryImage } from '@/types';

// Assuming shadcn/ui components for Dialog and Button
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react'; // Icons for carousel navigation and close

export function GallerySection() {
  const dispatch = useAppDispatch();
  const {
    images,
    isLoading,
    error,
  } = useAppSelector((state: RootState) => state.gallery);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchGalleryImages());
  }, [dispatch]);

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <section id="gallery" className="py-20 bg-gray-50"> {/* Consistent background with ServicesSection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-salon-dark mb-4">
            Our Gallery
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Explore our captivating gallery showcasing the artistry and transformations from our salon.
          </p>
        </div>

        {isLoading && (
          <div className="text-center text-salon-primary text-xl mb-8">
            Loading gallery images...
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-xl mb-8">
            Error: {error}. Please try again later.
          </div>
        )}

        {!isLoading && !error && images.length === 0 && (
          <div className="text-center text-gray-700 text-xl mb-8">
            No gallery images found.
          </div>
        )}

        {!isLoading && !error && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image: GalleryImage, index: number) => (
              <div
                key={image.id}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                onClick={() => openModal(index)}
              >
                <img
                  src={image.image_url || `https://placehold.co/400x300/E0E7FF/4338CA?text=Gallery%20Image%20${index + 1}`}
                  alt={image.name}
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.currentTarget.src = `https://placehold.co/400x300/cccccc/333333?text=Image+Error`; }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-lg font-semibold text-center px-4">{image.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Carousel */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl w-full h-auto p-0 overflow-hidden flex flex-col bg-transparent border-none shadow-none">
          {images.length > 0 && (
            <div className="relative flex items-center justify-center h-full max-h-[80vh]">
              {/* Close Button */}
              <Button
                variant="ghost"
                onClick={closeModal}
                className="absolute top-2 right-2 z-20 text-white hover:bg-white/20 p-2 rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Image */}
              <img
                src={images[currentImageIndex]?.image_url || `https://placehold.co/800x600/E0E7FF/4338CA?text=Image%20${currentImageIndex + 1}`}
                alt={images[currentImageIndex]?.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={(e) => { e.currentTarget.src = `https://placehold.co/800x600/cccccc/333333?text=Image+Error`; }}
              />

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    onClick={goToPreviousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 p-2 rounded-full"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={goToNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 p-2 rounded-full"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
