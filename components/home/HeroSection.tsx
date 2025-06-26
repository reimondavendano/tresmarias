'use client';

import Link from 'next/link';
import { Calendar, Star, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-salon-gradient opacity-70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Image Section */}
            <div className="flex-shrink-0">
              <img
                src="/assets/img/1.jpg"
                alt="Tres Marias Salon"
                className="w-40 h-40 md:w-52 md:h-52 rounded-full object-cover shadow-lg"
              />
            </div>

            {/* Text Section */}
            <div className="text-center md:text-left">
              <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
                Where Beauty
                <span className="text-salon-accent block">Meets Grace</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl animate-slide-up">
                Experience the art of beauty at Tres Marias Salon, a place where style, care, and confidence come together
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up">
            <Link href="/booking">
              <Button size="lg" className="bg-white text-salon-primary hover:bg-gray-100 text-lg px-8 py-4 h-auto">
                <Calendar className="h-5 w-5 mr-2" />
                Book Your Appointment
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-salon-primary hover:bg-white hover:text-salon-primary text-lg px-8 py-4 h-auto"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Our Services
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto animate-slide-up">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-salon-accent mr-1" />
                <span className="text-2xl font-bold text-white">4.9</span>
              </div>
              <p className="text-white/80 text-sm">Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-salon-accent mr-1" />
                <span className="text-2xl font-bold text-white">2K+</span>
              </div>
              <p className="text-white/80 text-sm">Happy Clients</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-salon-accent mr-1" />
                <span className="text-2xl font-bold text-white">15+</span>
              </div>
              <p className="text-white/80 text-sm">Years Experience</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-salon-accent mr-1" />
                <span className="text-2xl font-bold text-white">500+</span>
              </div>
              <p className="text-white/80 text-sm">Monthly Bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}