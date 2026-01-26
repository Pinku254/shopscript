'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [bannerProducts, setBannerProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const api = (await import('@/lib/api')).api;
        const [allProducts, siteSettings] = await Promise.all([
          api.get('/products') as unknown as Promise<Product[]>,
          api.get('/settings').catch(() => ({})) as Promise<any>
        ]);

        const products = await allProducts;

        // Filter for deals (daily_special)
        const deals = products.filter(p => p.category === 'daily_special');
        setDealProducts(deals);

        // Filter for banners
        const banners = products.filter(p => p.category === 'banners');
        setBannerProducts(banners);

        // Filter for recommended (just mixing others for now)
        const others = products.filter(p => p.category !== 'daily_special' && p.category !== 'banners');
        setRecommendedProducts(others.slice(0, 4)); // Show top 4

        setSettings(siteSettings || {});

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="bg-[var(--background)] min-h-screen">
      {/* Hero Section Logic: Video > Banners > Static */}
      {settings.hero_video ? (
        <div className="relative h-[400px] md:h-[600px] w-full overflow-hidden font-sans">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={settings.hero_video}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <p className="text-xl md:text-2xl font-medium mb-2 opacity-90">
              {settings.hero_title || 'Discover the Latest Styles'}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight max-w-3xl">
              {settings.hero_subtitle || 'Elevate Your Wardrobe.\nSignature Collections for Every Occasion.'}
            </h1>
            <Link
              href="/category/daily_special"
              className="bg-[#ff4500] hover:bg-[#ff3300] text-white px-10 py-4 rounded-full font-bold text-lg transition-transform transform hover:scale-105 shadow-xl"
            >
              Shop Now
            </Link>
          </div>
        </div>
      ) : bannerProducts.length > 0 ? (
        <BannerCarousel banners={bannerProducts} />
      ) : (
        /* Fallback Static Hero if no video and no banners - NOW UPDATED TO VIDEO CENTERED DESIGN */
        <div className="relative h-[500px] md:h-[700px] w-full overflow-hidden flex items-center justify-center text-center font-sans tracking-tight">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            src="https://cdn.pixabay.com/video/2024/05/31/214652_large.mp4"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60 z-10"></div>

          {/* Centered Content */}
          <div className="relative z-20 max-w-5xl mx-auto px-4 flex flex-col items-center">
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black mb-2 leading-none uppercase select-none">
              {/* Hollow/Transparent Text Effect */}
              <span className="block text-transparent transition-all duration-500" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.8)' }}>
                TRENDY
              </span>
              <span className="block text-[var(--color-accent)] mt-2">
                CLOTHING.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light tracking-wide">
              Discover the latest trends in men's, women's, and kids' fashion. High-quality fabrics and stylish designs for every season.
            </p>

            <div className="mt-10">
              <Link
                href="/category/daily_special"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-[var(--color-accent)] rounded-full hover:bg-[var(--color-accent-hover)] hover:scale-105 shadow-[0_0_20px_rgba(255,69,0,0.4)] hover:shadow-[0_0_30px_rgba(255,69,0,0.6)]"
              >
                Shop Collection
                <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Category Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Women', 'Men', 'Kids'].map((category) => (
            <Link key={category} href={`/category/${category.toLowerCase()}`} className="group relative bg-[#1A1A1A] p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all border border-gray-800 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-gray-800 group-hover:bg-gray-700 transition-colors z-0"></div>
              <h3 className="text-2xl font-bold text-white z-10 relative">{category}'s Fashion</h3>
              <p className="mt-2 text-gray-400 z-10 relative group-hover:text-[var(--color-accent)] transition-colors">Shop Collection &rarr;</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Best Deals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[var(--color-text-main)]">Today's Best Deals</h2>
          <Link href="/category/daily_special" className="text-[var(--color-accent)] hover:text-[#ff3300] font-medium">See all deals &rarr;</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-800 h-96 rounded-lg shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {dealProducts.length > 0 ? (
              dealProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">No deals available at the moment.</div>
            )}
          </div>
        )}
      </div>

      {/* Recommended for You / More Products */}
      <div className="bg-[var(--background)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[var(--color-text-main)] mb-8">Recommended For You</h2>
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {recommendedProducts.length > 0 ? (
              recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">Check back later for recommendations!</div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
}
