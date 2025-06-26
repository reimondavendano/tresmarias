'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentBooking } from '@/store/slices/bookingSlice';

interface CustomerDetailsProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function CustomerDetails({ onNext, onPrevious }: CustomerDetailsProps) {
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);
  const dispatch = useAppDispatch();
  
  const [formData, setFormData] = useState({
    customerName: currentBooking.customerName || '',
    email: currentBooking.email || '',
    phone: currentBooking.phone || '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    dispatch(setCurrentBooking({ [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-salon-dark mb-4">
          Your Details
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Please provide your contact information so we can confirm your appointment 
          and send you important updates.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-salon-dark font-medium">
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="customerName"
                type="text"
                placeholder="Enter your full name"
                className={`pl-10 ${errors.customerName ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
              />
            </div>
            {errors.customerName && (
              <p className="text-red-500 text-sm">{errors.customerName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-salon-dark font-medium">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className={`pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-salon-dark font-medium">
              Phone Number *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className={`pl-10 ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-salon-dark font-medium">
              Special Requests or Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any special requests, allergies, or preferences you'd like us to know about?"
              rows={4}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          {/* Privacy Notice */}
          <div className="bg-salon-neutral p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Privacy Notice:</strong> Your personal information will be used only for 
              appointment scheduling and communication. We respect your privacy and will never 
              share your details with third parties.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          size="lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Date & Time
        </Button>
        <Button
          onClick={handleNext}
          size="lg"
          className="bg-salon-primary hover:bg-salon-primary/90 text-white"
        >
          Review Booking
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}