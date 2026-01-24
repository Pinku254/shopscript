'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import Link from 'next/link';

interface BannerCarouselProps {
    banners: Product[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance
    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    if (!banners.length) return null;

    return (
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-[var(--background)] group">
            <div
                className="flex transition-transform duration-700 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner, index) => (
                    <div key={banner.id} className="w-full flex-shrink-0 relative h-full">
                        {/* We use standard img for now, or next/image if configured. Using img for compatibility with external generic URLs */}
                        <img
                            src={banner.imageUrl}
                            alt={banner.name}
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay Content */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="text-center text-white px-4 max-w-4xl">
                                <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{banner.name}</h2>
                                <p className="text-xl md:text-2xl mb-8 drop-shadow-md">{banner.description}</p>
                                <Link
                                    href="/category/daily_special"
                                    className="bg-[var(--color-accent)] text-white px-8 py-3 rounded-full font-medium hover:bg-[var(--color-accent-hover)] transition-transform transform hover:scale-105 shadow-lg inline-block"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
