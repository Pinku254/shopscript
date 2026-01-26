'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { api } from '@/lib/api';
import { CATEGORY_SUBCATEGORIES } from '@/constants/categories';

export default function CategoryPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSubcategory, setActiveSubcategory] = useState<string>('All');

    useEffect(() => {
        if (slug) {
            setLoading(true);
            setActiveSubcategory('All'); // Reset subcategory when category changes
            const fetchProducts = async () => {
                try {
                    const productsData = (await api.get('/products')) as unknown as Product[];
                    const categoryProducts = productsData.filter(p =>
                        p.category && p.category.toLowerCase() === slug.toLowerCase()
                    );
                    setAllProducts(categoryProducts);
                    setFilteredProducts(categoryProducts);
                } catch (error) {
                    console.error("Failed to fetch products", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProducts();
        }
    }, [slug]);

    useEffect(() => {
        if (activeSubcategory === 'All') {
            setFilteredProducts(allProducts);
        } else {
            setFilteredProducts(allProducts.filter(p => p.subcategory === activeSubcategory));
        }
    }, [activeSubcategory, allProducts]);

    const categoryName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category';
    const subcategories = slug ? CATEGORY_SUBCATEGORIES[slug] || [] : [];

    return (
        <div className="bg-background min-h-screen py-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-foreground tracking-tight">{categoryName} Collection</h1>
                    <p className="mt-4 text-xl text-muted-foreground">Explore the best styles and offers for {categoryName}.</p>
                </div>

                {/* Subcategory Navbar */}
                {subcategories.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        <button
                            onClick={() => setActiveSubcategory('All')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeSubcategory === 'All'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            All
                        </button>
                        {subcategories.map((sub) => (
                            <button
                                key={sub}
                                onClick={() => setActiveSubcategory(sub)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeSubcategory === sub
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-card h-96 rounded-lg shadow-sm animate-pulse border border-border"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-muted-foreground text-lg">No products found in this category.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
