'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingOptions } from '@/lib/mockData';
import { CheckCircle, Send, Copy, ExternalLink } from 'lucide-react';

const MESSENGER_LINK = "https://www.facebook.com/messages/t/257099821110072";

interface InquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InquiryModal({ isOpen, onClose }: InquiryModalProps) {
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
            onClose();
        }
        return () => clearInterval(interval);
    }, [step, redirectTimer, onClose]);

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

    const handleReset = () => {
        setStep('form');
        setFormData({
            name: '',
            number: '',
            address: '',
            service: '',
            message: ''
        });
        onClose();
    }


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
            <DialogContent className="sm:max-w-[425px]">
                {step === 'form' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Inquire Service</DialogTitle>
                            <DialogDescription>
                                Fill out the form below to copy your inquiry details, then send it to us via Messenger.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="number">Mobile Number</Label>
                                <Input
                                    id="number"
                                    value={formData.number}
                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    required
                                    placeholder="0912 345 6789"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    placeholder="Your Address"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="service">Service</Label>
                                <Select
                                    value={formData.service}
                                    onValueChange={(val) => setFormData({ ...formData, service: val })}
                                    required
                                >
                                    <SelectTrigger>
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
                                <Label htmlFor="message">Message / Inquiries</Label>
                                <Textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Any questions or preferred date/time?"
                                />
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full bg-salon-primary hover:bg-salon-primary/90 text-white">
                                    Inquire Now
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-6 space-y-6">
                        <div className="flex justify-center">
                            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle size={40} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Inquiry Copied!</h3>
                            <p className="text-gray-500 mb-4 px-4">
                                Your inquiry details have been copied to your clipboard.
                                Please paste them into the Messenger chat.
                            </p>
                            <div className="text-sm bg-gray-100 p-3 rounded-lg flex items-center justify-center gap-2 mb-4">
                                <Copy size={16} /> Copied to clipboard
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="h-1 w-full bg-gray-100 rounded overflow-hidden">
                                <div
                                    className="h-full bg-salon-primary transition-all duration-1000 ease-linear"
                                    style={{ width: `${(redirectTimer / 10) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400">Opening Messenger in {redirectTimer}s...</p>

                            <Button
                                onClick={handleManualRedirect}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Send className="mr-2 h-4 w-4" /> Open Messenger Now
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
