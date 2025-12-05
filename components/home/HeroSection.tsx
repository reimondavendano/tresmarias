'use client';

import { useState } from 'react';
import { Calendar, Star, Users, Award, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InquiryModal } from './InquiryModal';

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/assets/img/header.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-salon-gradient opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Image Section */}
            <div className="flex-shrink-0 animate-fade-in">
              <img
                src="/assets/img/1.jpg"
                alt="Tres Marias Salon"
                className="w-40 h-40 md:w-52 md:h-52 rounded-full object-cover shadow-2xl border-4 border-white/20"
              />
            </div>

            {/* Text Section */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20 animate-fade-in">
                <Clock className="w-4 h-4 text-salon-accent" />
                <span className="text-white text-sm font-medium">Open Daily: 9:00 AM - 7:00 PM</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up leading-tight">
                Where Beauty
                <span className="text-salon-accent block">Meets Grace</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl animate-slide-up font-light">
                Experience the art of beauty at Tres Marias Salon, a place where style, care, and confidence come together.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
            <Button
              size="lg"
              className="bg-salon-primary hover:bg-salon-primary/90 text-white text-lg px-8 py-6 h-auto shadow-xl shadow-salon-primary/30 min-w-[200px]"
              onClick={() => setIsModalOpen(true)}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Inquire Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-salon-dark text-lg px-8 py-6 h-auto min-w-[200px]"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Services
            </Button>
          </div>

          {/* Trust Badges Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-slide-up bg-black/20 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2 text-salon-accent">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold text-white block">15+ Years</span>
              <p className="text-white/70 text-sm">Trusted Experience</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2 text-salon-accent">
                <Users className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold text-white block">2K+</span>
              <p className="text-white/70 text-sm">Happy Clients</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2 text-salon-accent">
                <Award className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold text-white block">Certified</span>
              <p className="text-white/70 text-sm">Licensed Pro's</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2 text-salon-accent">
                <Star className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold text-white block">4.9/5</span>
              <p className="text-white/70 text-sm">Client Rating</p>
            </div>
          </div>

        </div>
      </div>

      <InquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}