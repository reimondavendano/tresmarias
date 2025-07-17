'use client';

import Link from 'next/link';
import { CheckCircle, Calendar, Clock, User, Mail, Phone, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BookingConfirmationPage() {
  return (
    <div className="min-h-screen bg-salon-neutral flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-salon-dark mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for choosing Elegance Salon. Your appointment has been successfully booked.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-salon-primary">
              Your Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-salon-light p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
              <p className="text-lg font-bold text-salon-dark">#ELG{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-salon-primary" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">January 25, 2025</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-salon-primary" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium">2:30 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-salon-primary" />
                <div>
                  <p className="text-sm text-gray-600">Stylist</p>
                  <p className="font-medium">Sofia Martinez</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-salon-primary" />
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium">Hair Color & Highlights</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="font-semibold text-lg text-salon-dark mb-4">What's Next?</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-salon-primary mt-0.5" />
              <div>
                <p className="font-medium text-salon-dark">Confirmation Email</p>
                <p className="text-sm text-gray-600">We've sent a confirmation email with all your appointment details.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-salon-primary mt-0.5" />
              <div>
                <p className="font-medium text-salon-dark">Reminder Call</p>
                <p className="text-sm text-gray-600">We'll call you 24 hours before your appointment to confirm.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-salon-primary mt-0.5" />
              <div>
                <p className="font-medium text-salon-dark">Arrive Early</p>
                <p className="text-sm text-gray-600">Please arrive 15 minutes early for consultation and preparation.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link href="/">
            <Button size="lg" className="bg-salon-primary hover:bg-salon-primary/90 text-white">
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </Link>
          <p className="text-sm text-gray-600">
            Need to reschedule or cancel? Call us at{' '}
            <a href="#" className="text-salon-primary hover:underline">
              0975-062-2263
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}