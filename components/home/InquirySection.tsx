'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/mockData';
import { CheckCircle, Send, Copy, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MESSENGER_LINK = "https://www.facebook.com/messages/t/257099821110072";

export function InquirySection() {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [redirectTimer, setRedirectTimer] = useState(10);
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        address: '',
        service: '',
        message: ''
    });

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 'success' && redirectTimer > 0) {
            interval = setInterval(() => {
                setRedirectTimer((prev) => prev - 1);
            }, 1000);
        } else if (step === 'success' && redirectTimer === 0) {
            window.open(MESSENGER_LINK, '_blank');
            setStep('form');
        }
        return () => clearInterval(interval);
    }, [step, redirectTimer]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const text = `Hi Tres Marias, I would like to inquire.
    
Name: ${formData.name}
Phone: ${formData.number}
Address: ${formData.address}
Service: ${formData.service}
Message: ${formData.message}`;

        navigator.clipboard.writeText(text);
        setStep('success');
        setRedirectTimer(10);
    };

    const handleManualRedirect = () => {
        window.open(MESSENGER_LINK, '_blank');
    };

    return (
        <section id="contact" className="py-20 bg-white text-gray-900 relative overflow-hidden">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* Contact Info Column */}
                    <div>
                        <h2 className="font-display text-4xl font-bold mb-6 text-gray-900">
                            Get in <span className="text-salon-primary">Touch</span>
                        </h2>
                        <p className="text-gray-600 mb-12 text-lg">
                            Ready for your transformation? Visit us or send us a message. We're excited to see you!
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-salon-primary/20 p-3 rounded-lg text-salon-primary">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-1 text-gray-900">Our Location</h4>
                                    <p className="text-gray-600 font-medium">Phase 3B Blk 1 Lot 2, Pacita 1, San Pedro Laguna</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-salon-primary/20 p-3 rounded-lg text-salon-primary">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-1 text-gray-900">Contact Number</h4>
                                    <p className="text-gray-600 font-medium">0912 345 6789</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-salon-primary/20 p-3 rounded-lg text-salon-primary">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-1 text-gray-900">Business Hours</h4>
                                    <p className="text-gray-600 font-medium">Mon - Sun: 9:00 AM - 7:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inquiry Form Column */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl text-gray-900 border border-gray-100">
                        {step === 'form' ? (
                            <>
                                <h3 className="text-2xl font-bold font-display mb-6">Send us an Inquiry</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="inq-name">Name</Label>
                                        <Input
                                            id="inq-name"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="Your Name"
                                            className="bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="inq-number">Mobile Number</Label>
                                        <Input
                                            id="inq-number"
                                            value={formData.number}
                                            onChange={e => setFormData({ ...formData, number: e.target.value })}
                                            required
                                            placeholder="0912 345 6789"
                                            className="bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="inq-address">Address</Label>
                                        <Input
                                            id="inq-address"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            required
                                            placeholder="City / Municipality"
                                            className="bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="inq-service">Service</Label>
                                        <Select
                                            value={formData.service}
                                            onValueChange={(val) => setFormData({ ...formData, service: val })}
                                            required
                                        >
                                            <SelectTrigger className="bg-gray-50 border-gray-200">
                                                <SelectValue placeholder="Select a service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bookingOptions.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="inq-message">Message / Inquiries</Label>
                                        <Textarea
                                            id="inq-message"
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Any questions?"
                                            className="bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-salon-primary hover:bg-salon-primary/90 text-white font-bold h-12 text-lg mt-4">
                                        Inquire Now
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                                    <CheckCircle size={48} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Inquiry Copied!</h3>
                                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                                    We've copied your details. Please paste them into our Messenger chat to proceed.
                                </p>

                                <div className="w-full max-w-xs space-y-4">
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-salon-primary transition-all duration-1000 ease-linear"
                                            style={{ width: `${(redirectTimer / 10) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-400">Opening Messenger in {redirectTimer}s...</p>

                                    <Button
                                        onClick={handleManualRedirect}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                    >
                                        <Send size={18} /> Open Messenger
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
}
