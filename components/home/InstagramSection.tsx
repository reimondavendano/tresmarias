'use client';

import { Facebook } from 'lucide-react';

const posts = [
    '/assets/gallery/1.jpg',
    '/assets/gallery/2.jpg',
    '/assets/gallery/3.jpg',
    '/assets/gallery/4.jpg',
    '/assets/gallery/5.jpg',
    '/assets/gallery/6.jpg',
];

export function InstagramSection() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-display text-4xl font-bold text-salon-dark mb-4 flex items-center justify-center gap-3">
                        <Facebook className="text-blue-600 fill-blue-600" /> Follow Us On Facebook
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Tres Marias Salon — See our latest works and happy clients.
                    </p>
                    <a
                        href="https://www.facebook.com/tresmarias28"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                        Visit Our Page
                    </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {posts.map((url, index) => (
                        <div key={index} className="aspect-square relative group overflow-hidden cursor-pointer">
                            <img src={url} alt="Facebook Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <Facebook className="text-white w-8 h-8 fill-white" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
