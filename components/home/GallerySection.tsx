'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Static gallery images
const images = Array.from({ length: 9 }, (_, i) => ({ // Using 9 images as listed previously or I can use 11 if I want to match file count exactly. 
  // Step 661 listed 11 files (1.jpg to 11.jpg). I'll map them all.
  id: String(i + 1),
  name: `Transformation ${i + 1}`,
  image_url: `/assets/gallery/${i + 1}.jpg`
}));

// Add specific images if needed or just use loop up to 11
const allImages = [
  ...Array.from({ length: 11 }, (_, i) => ({
    id: String(i + 1),
    name: `Transformation ${i + 1}`,
    image_url: `/assets/gallery/${i + 1}.jpg`
  }))
];


export function GallerySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
  };

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-salon-dark mb-4">
            Our Gallery
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Explore our captivating gallery showcasing the artistry and transformations from our salon.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allImages.map((image, index) => (
            <div
              key={image.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 aspect-square"
              onClick={() => openModal(index)}
            >
              <img
                src={image.image_url}
                alt={image.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-lg font-semibold text-center px-4">{image.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Carousel */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden flex flex-col bg-transparent border-none shadow-none focus:outline-none">
          <div className="relative flex items-center justify-center h-full w-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image */}
            <img
              src={allImages[currentImageIndex]?.image_url}
              alt={allImages[currentImageIndex]?.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />

            {/* Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  onClick={goToPreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={goToNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
