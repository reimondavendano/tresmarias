'use client';

import { whyChooseUs } from '@/lib/mockData';
import { Award, ShieldCheck, Sparkles, Smile } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const iconMap: any = {
    Award,
    ShieldCheck,
    Sparkles,
    Smile,
};

export function WhyChooseUsSection() {
    return (
        <section className="py-20 bg-salon-neutral/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl font-bold text-salon-dark mb-4">
                        Why Choose <span className="text-salon-primary">Tres Marias?</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        We are dedicated to providing the best beauty experience with professional care.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {whyChooseUs.map((item, index) => {
                        const Icon = iconMap[item.icon] || Sparkles;
                        return (
                            <Card key={index} className="text-center border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <CardContent className="p-8 flex flex-col items-center">
                                    <div className="h-16 w-16 bg-salon-primary/10 rounded-full flex items-center justify-center text-salon-primary mb-6">
                                        <Icon size={32} />
                                    </div>
                                    <h3 className="font-bold text-lg text-salon-dark mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {item.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
