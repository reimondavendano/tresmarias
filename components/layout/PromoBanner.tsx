'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PromoBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-salon-dark text-white py-2 px-4 relative z-[60]">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex-1 text-center text-sm md:text-base font-medium flex items-center justify-center gap-2">
                    <Sparkles size={16} className="text-yellow-400" />
                    <span>Special Offer: Get <span className="text-yellow-400 font-bold">20% OFF</span> on Rebond + Color Package this Month!</span>
                    <a
                        href="https://www.facebook.com/profile.php?id=100064024891300"
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-salon-primary ml-1"
                    >
                        Book Now
                    </a>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-white/60 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
