'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { api } from '@/lib/api';

export default function CategoryPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            setLoading(true);
            const fetchProducts = async () => {
                try {
                    const allProducts = (await api.get('/products')) as unknown as Product[];
                    // Filter by category
                    // Assuming the category field in DB matches the slug 
                    // (slugs are usually lowercase: 'kids', 'boys', 'girls')
                    const filtered = allProducts.filter(p =>
                        p.category && p.category.toLowerCase() === slug.toLowerCase()
                    );
                    setProducts(filtered);
                } catch (error) {
                    console.error("Failed to fetch products", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProducts();
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
                        {products.length > 0 ? (
                            products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg">No products found in this category.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
