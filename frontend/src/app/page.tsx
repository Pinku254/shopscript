'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

// Mock data for demonstration - in a real app this would come from the backend API
const DEAL_PRODUCTS: Product[] = [
  { id: 101, name: 'Smart Fitness Band', description: 'Track your steps and health.', price: 49.99, imageUrl: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&q=80&w=300', stock: 100 },
  { id: 102, name: 'Wireless Earbuds', description: 'Crystal clear sound quality.', price: 79.99, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=300', stock: 50 },
  { id: 103, name: 'Gaming Mouse', description: 'High precision for gamers.', price: 35.00, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=300', stock: 20 },
  { id: 104, name: '4K Monitor', description: 'Ultra HD display for work.', price: 299.00, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=300', stock: 15 },
];

const CATEGORY_PRODUCTS: Product[] = [
  { id: 201, name: 'Girl\'s Summer Dress', description: 'Light and breezy for summer.', price: 25.00, imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=300', stock: 30 },
  { id: 202, name: 'Boy\'s Denim Jacket', description: 'Cool style for everyday.', price: 45.00, imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=300', stock: 25 },
  { id: 203, name: 'Kid\'s Sneakers', description: 'Comfortable running shoes.', price: 30.00, imageUrl: 'https://images.unsplash.com/photo-1514989940723-e88754dfe329?auto=format&fit=crop&q=80&w=300', stock: 40 },
  { id: 204, name: 'Toy Robot', description: 'Interactive fun for kids.', price: 55.00, imageUrl: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&q=80&w=300', stock: 10 },
];

export default function Home() {
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setDealProducts(DEAL_PRODUCTS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-60"
            src="https://images.unsplash.com/photo-1472851294608-415522f97817?auto=format&fit=crop&q=80&w=1920"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white drop-shadow-md">
            Find Your Next Obsession
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Shop the latest trends in fashion, electronics, and home essentials. unbeatable prices and premium quality.
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
            {CATEGORY_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
