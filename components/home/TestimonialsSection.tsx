'use client';

import { testimonials } from '@/lib/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
    return (
        <section id="testimonials" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl font-bold text-salon-dark mb-4">
                        Client <span className="text-salon-primary">Love</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Don't just take our word for it. Here's what our beautiful clients have to say about their Tres Marias experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-50/50">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-1">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-salon-accent text-salon-accent" />
                                        ))}
                                    </div>
                                    <Quote className="h-8 w-8 text-salon-primary/20" />
                                </div>

                                <p className="text-gray-700 italic mb-6 leading-relaxed">
                                    "{testimonial.text}"
                                </p>

                                <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-salon-primary/20"
                                    />
                                    <div>
                                        <h4 className="font-bold text-salon-dark text-sm">{testimonial.name}</h4>
                                        <p className="text-salon-primary text-xs font-semibold">{testimonial.service}</p>
                                        <p className="text-gray-400 text-xs">{testimonial.date}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
