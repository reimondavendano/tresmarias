'use client';

import { faqs } from '@/lib/mockData';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
    return (
        <section id="faq" className="py-20 bg-salon-neutral">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl font-bold text-salon-dark mb-4">
                        Frequently Asked <span className="text-salon-primary">Questions</span>
                    </h2>
                    <p className="text-gray-600">
                        Got questions regarding our services? We've got answers.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left font-semibold text-salon-dark hover:text-salon-primary">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
