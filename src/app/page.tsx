'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { api } from '@/lib/api';

export default function Home() {
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSettings, setHeroSettings] = useState({
    title: 'Find Your Next Obsession',
    subtitle: 'Shop the latest trends in fashion, electronics, and home essentials. unbeatable prices and premium quality.',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-415522f97817?auto=format&fit=crop&q=80&w=1920'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Site Settings
        const settings: any = await api.get('/settings');
        if (settings) {
          setHeroSettings({
            title: settings.hero_title || heroSettings.title,
            subtitle: settings.hero_subtitle || heroSettings.subtitle,
            imageUrl: settings.hero_image || heroSettings.imageUrl
          });
        }

        // Fetch Products (in real app, you'd filter by 'deals' or 'recommended')
        // For now, let's just grab some products
        const allProducts = (await api.get('/products')) as unknown as Product[];

        // Randomly slice for display if backend doesn't support specific queries yet
        if (allProducts && allProducts.length > 0) {
          setDealProducts(allProducts.slice(0, 4));
          setRecommendedProducts(allProducts.slice(4, 8));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data', error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-60"
            src={heroSettings.imageUrl}
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white drop-shadow-md">
            {heroSettings.title}
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            {heroSettings.subtitle}
          </p>
          <div className="mt-10">
            <Link href="/register" className="inline-block bg-white border border-transparent rounded-md py-3 px-8 text-base font-medium text-gray-900 hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg">
              Join & Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Category Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Girls', 'Boys', 'Kids'].map((category) => (
            <Link key={category} href={`/category/${category.toLowerCase()}`} className="group relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors z-0"></div>
              <h3 className="text-2xl font-bold text-gray-900 z-10 relative">{category}'s Fashion</h3>
              <p className="mt-2 text-gray-500 z-10 relative group-hover:text-indigo-600 transition-colors">Shop Collection &rarr;</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Best Deals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Today's Best Deals</h2>
          <Link href="/deals" className="text-indigo-600 hover:text-indigo-800 font-medium">See all deals &rarr;</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white h-96 rounded-lg shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {dealProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Recommended for You / More Products */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recommended For You</h2>
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {recommendedProducts.length === 0 && <p className="col-span-4 text-center text-gray-500">More products coming soon!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
