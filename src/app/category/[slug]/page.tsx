'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

// Mock data generator helper
const getMockProducts = (category: string): Product[] => {
    const baseId = category === 'girls' ? 200 : category === 'boys' ? 300 : 400;
    const prefixes = ['Summer', 'Winter', 'Casual', 'Party', 'Sport'];
    const items = category === 'kids' ? ['Toy', 'Game', 'Puzzle', 'Bike'] : ['Shirt', 'Pants', 'Shoes', 'Jacket'];

    return Array.from({ length: 8 }).map((_, i) => ({
        id: baseId + i,
        name: `${category.charAt(0).toUpperCase() + category.slice(1)}'s ${prefixes[i % prefixes.length]} ${items[i % items.length]}`,
        description: `High quality ${category} item for everyday use.`,
        price: Math.floor(Math.random() * 50) + 20,
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4', // Generic clothing image
        stock: Math.floor(Math.random() * 20) + 1,
    }));
};

export default function CategoryPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            setLoading(true);
            // Simulate API fetch
            setTimeout(() => {
                setProducts(getMockProducts(slug));
                setLoading(false);
            }, 500);
        }
    }, [slug]);

    const categoryName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category';

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{categoryName} Collection</h1>
                    <p className="mt-4 text-xl text-gray-500">Explore the best styles and offers for {categoryName}.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white h-96 rounded-lg shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
