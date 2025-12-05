'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { TeamSection } from '@/components/home/TeamSection';
import { AboutSection } from '@/components/home/AboutSection';
import { GallerySection } from '@/components/home/GallerySection';
import { WhyChooseUsSection } from '@/components/home/WhyChooseUsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { FAQSection } from '@/components/home/FAQSection';
import { InquirySection } from '@/components/home/InquirySection';
import { MapSection } from '@/components/home/MapSection';
import { InstagramSection } from '@/components/home/InstagramSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />

      <WhyChooseUsSection />
      <AboutSection />
      <ServicesSection />
      <GallerySection />
      <TestimonialsSection />
      <TeamSection />
      <FAQSection />
      <InquirySection />
      <MapSection />
      <InstagramSection />

      <Footer />
    </main>
  );
}