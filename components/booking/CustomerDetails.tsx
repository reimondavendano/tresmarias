'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, User, Mail, Phone, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setCurrentBooking } from '../../store/slices/bookingSlice';
import { createOrFetchCustomer, clearCustomerError } from '../../store/slices/customerSlice';
import { Customer } from '../../types'; // Corrected import path for Customer type

interface CustomerDetailsProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function CustomerDetails({ onNext, onPrevious }: CustomerDetailsProps) {
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);
  const { isLoadingCustomer, createCustomerError } = useAppSelector((state) => state.customers);
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    customerName: currentBooking.customer_name || '',
    email: currentBooking.customer_email || '',
    phone: currentBooking.customer_phone || '',
    special_requests: currentBooking.special_requests || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      customerName: currentBooking.customer_name || '',
      email: currentBooking.customer_email || '',
      phone: currentBooking.customer_phone || '',
      special_requests: currentBooking.special_requests || '',
    });

    return () => {
      dispatch(clearCustomerError());
    };
  }, [dispatch, currentBooking.customer_name, currentBooking.customer_email, currentBooking.customer_phone, currentBooking.special_requests]);


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'customerName') dispatch(setCurrentBooking({ customer_name: value }));
    if (field === 'email') dispatch(setCurrentBooking({ customer_email: value }));
    if (field === 'phone') dispatch(setCurrentBooking({ customer_phone: value }));
    if (field === 'special_requests') dispatch(setCurrentBooking({ special_requests: value }));

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

  const handleNext = async () => {
    if (validateForm()) {
      dispatch(clearCustomerError());
      const resultAction = await dispatch(createOrFetchCustomer({
        name: formData.customerName,
        email: formData.email,
        phone: formData.phone,
      }));

      if (createOrFetchCustomer.fulfilled.match(resultAction)) {
        const customer: Customer = resultAction.payload;
        dispatch(setCurrentBooking({ customer_id: customer.id }));
        onNext();
      } else {
        console.error("Failed to create or fetch customer:", createCustomerError);
      }
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
            <Label htmlFor="special_requests" className="text-salon-dark font-medium">
              Special Requests or Notes (Optional)
            </Label>
            <Textarea
              id="special_requests"
              placeholder="Any special requests, allergies, or preferences you'd like us to know about?"
              rows={4}
              value={formData.special_requests}
              onChange={(e) => handleInputChange('special_requests', e.target.value)}
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
          disabled={isLoadingCustomer}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Date & Time
        </Button>
        <Button
          onClick={handleNext}
          size="lg"
          className="bg-salon-primary hover:bg-salon-primary/90 text-white"
          disabled={isLoadingCustomer}
        >
          {isLoadingCustomer ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ArrowRight className="h-4 w-4 ml-2" />
          )}
          {isLoadingCustomer ? 'Processing...' : 'Review Booking'}
        </Button>
      </div>

      {createCustomerError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {createCustomerError}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => dispatch(clearCustomerError())}>
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.697l-2.651 2.652a1.2 1.2 0 1 1-1.697-1.697L8.303 10 5.651 7.348a1.2 1.2 0 1 1 1.697-1.697L10 8.303l2.651-2.652a1.2 1.2 0 0 1 1.697 1.697L11.697 10l2.651 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
