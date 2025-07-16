import Link from 'next/link';
import { Sparkles, MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-salon-neutral text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8 text-salon-primary" />
              <span className="font-display text-2xl font-bold">Tres Marias Salon</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              Stay connected with us — follow Tres Marias Salon or reach out through any of the channels below..
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/tresmariassalon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-salon-primary transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://web.facebook.com/tresmarias28"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-salon-primary transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://x.com/mariastres1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-salon-primary transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-salon-primary mt-0.5" />
                <div>
                  <p className="text-gray-600">2nd Floor (Formely HBC Building)</p>
                  <p className="text-gray-600">Crisostomo St. San Vicente Malolos</p>
                  <p className="text-gray-600">In Front of Villarica Pawnshop</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-salon-primary" />
                <p className="text-gray-600">0975-062-2263</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-salon-primary" />
                <p className="text-gray-600">tresmarias28@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Opening Hours</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mon - Fri</span>
                <span className="text-gray-600">9:00am - 6:00pm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Saturday</span>
                <span className="text-gray-600">9:00am - 6:00pm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sunday</span>
                <span className="text-gray-600">9:00am - 6:00pm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-600">
            © 2010 Tres Marias Salon. All rights reserved. Designed with love for beauty.
          </p>
        </div>
      </div>
    </footer>
  );
}