'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, Review } from '@/types';
import { api } from '@/lib/api';
import { useCart } from '@/context/CartContext';

import Notification from '@/components/Notification';

export default function ProductDetails() {
    const params = useParams();
    const id = params.id;

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Review Form
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [selectedSize, setSelectedSize] = useState('');
    const [showSizeError, setShowSizeError] = useState(false);

    // Notification State
    const [notification, setNotification] = useState({
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
        isVisible: false
    });

    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type, isVisible: true });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    };

    useEffect(() => {
        if (id) {
            loadProduct();
            loadReviews();
        }
    }, [id]);

    const loadProduct = async () => {
        try {
            const data = (await api.get(`/products/${id}`)) as unknown as Product;
            setProduct(data);
        } catch (error) {
            console.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const loadReviews = async () => {
        try {
            const data = (await api.get(`/reviews/product/${id}`)) as unknown as Review[];
            setReviews(data);
        } catch (error) {
            console.error('Failed to load reviews');
        }
    };

    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Hardcoded user ID for demo
            await api.post(`/reviews/product/${id}/user/1`, newReview);
            setNewReview({ rating: 5, comment: '' });
            showNotification('Review submitted for approval!', 'success');
        } catch (error) {
            showNotification('Failed to submit review', 'error');
        }
    };

    const { addToCart } = useCart();
    const router = useRouter();

    const getPriceForSize = () => {
        if (!product) return 0;
        if (!selectedSize || !product.sizePrices) return product.price;
        try {
            const prices = JSON.parse(product.sizePrices);
            return prices[selectedSize] || product.price;
        } catch (e) {
            return product.price;
        }
    };

    const currentPrice = getPriceForSize();

    const handleAddToCart = () => {
        if (product) {
            if (!selectedSize) {
                setShowSizeError(true);
                showNotification('Please select a size to continue', 'error');
                return;
            }
            setShowSizeError(false);
            addToCart(product, 1, selectedSize, currentPrice);
            showNotification('Added to cart successfully', 'success');
        }
    };

    const handleBuyNow = () => {
        if (product) {
            if (!selectedSize) {
                setShowSizeError(true);
                showNotification('Please select a size to continue', 'error');
                return;
            }
            setShowSizeError(false);
            addToCart(product, 1, selectedSize, currentPrice);
            router.push('/checkout');
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    return (
        <div className="bg-background transition-colors duration-300 relative">
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={closeNotification}
            />

            <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:gap-x-8">
                {/* Product Image */}
                <div className="lg:max-w-lg lg:self-end">
                    <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                        <img
                            src={product.imageUrl || 'https://via.placeholder.com/600'}
                            alt={product.name}
                            className="w-full h-full object-center object-cover"
                        />
                    </div>
                </div>

                {/* Product Info */}
                <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                    <div className="mb-6">
                        <button
                            onClick={() => router.back()}
                            className="text-sm text-muted-foreground hover:text-foreground flex items-center"
                        >
                            ← Back
                        </button>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{product.name}</h1>

                    <div className="mt-3">
                        <h2 className="sr-only">Product information</h2>
                        <div className="flex items-baseline space-x-2">
                            <p className="text-3xl text-foreground font-bold">₹{currentPrice}</p>
                            {selectedSize && product.sizePrices && (
                                <span className="text-sm text-muted-foreground"> (for size {selectedSize})</span>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="sr-only">Description</h3>
                        <div className="text-base text-muted-foreground space-y-6" dangerouslySetInnerHTML={{ __html: product.description }} />
                    </div>

                    {/* Size Selector */}
                    {(() => {
                        const availableSizes = (product.sizes && product.sizes.trim().length > 0)
                            ? product.sizes.split(',').map(s => s.trim())
                            : ["S", "M", "L", "XL"];

                        let sizePrices: Record<string, number> = {};
                        try {
                            sizePrices = product.sizePrices ? JSON.parse(product.sizePrices) : {};
                        } catch (e) {
                            console.error("Error parsing sizePrices", e);
                        }

                        return (
                            <div className={`mt-8 p-4 rounded-lg transition-colors ${showSizeError ? 'bg-red-500/10 border border-red-500/20' : 'bg-secondary/50 border border-border'}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className={`text-sm font-bold ${showSizeError ? 'text-red-500' : 'text-foreground'}`}>
                                        {showSizeError ? 'PLEASE SELECT A SIZE:' : 'CHOOSE YOUR SIZE'}
                                    </h3>
                                    {showSizeError && (
                                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest animate-pulse">Required Case</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                    {availableSizes.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => {
                                                setSelectedSize(s);
                                                setShowSizeError(false);
                                            }}
                                            className={`${selectedSize === s
                                                ? 'bg-primary border-transparent text-primary-foreground shadow-lg scale-105'
                                                : 'bg-input border-border text-foreground hover:bg-secondary'
                                                } border rounded-xl py-4 flex flex-col items-center justify-center transition-all duration-200 group relative overflow-hidden`}
                                        >
                                            <span className="text-lg font-bold">{s}</span>
                                            {sizePrices[s] && (
                                                <span className={`text-[10px] mt-1 ${selectedSize === s ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                    ₹{sizePrices[s]}
                                                </span>
                                            )}
                                            {selectedSize === s && (
                                                <div className="absolute top-0 right-0 p-1">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-secondary border border-border rounded-xl py-4 px-8 flex items-center justify-center text-base font-bold text-foreground hover:bg-muted transition-all active:scale-95 shadow-sm"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            Add to Cart
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="flex-1 bg-primary border border-transparent rounded-xl py-4 px-8 flex items-center justify-center text-base font-bold text-primary-foreground hover:bg-orange-600 transition-all active:scale-95 shadow-md"
                        >
                            Buy Now
                        </button>
                    </div>

                    {/* Product Details Section (Admin Managed) */}
                    <div className="mt-16 pt-10 border-t border-border">
                        <h2 className="text-xl font-bold text-foreground mb-6">Product Details</h2>
                        <div className="prose prose-sm sm:prose text-muted-foreground">
                            {product.details ? (
                                <div dangerouslySetInnerHTML={{ __html: product.details.replace(/\n/g, '<br />') }} />
                            ) : (
                                <p>No additional details available for this product.</p>
                            )}
                        </div>
                    </div>

                    {/* Reviews List (Kept for viewing, but form removed as per request to replace 'share thoughts' with details) */}
                    <div className="mt-10 border-t border-border pt-10">
                        <h3 className="text-lg font-medium text-foreground mb-4">Customer Reviews</h3>
                        <div className="space-y-10 divide-y divide-border border-b border-border pb-10">
                            {reviews.map((review) => (
                                <div key={review.id} className="pt-6">
                                    <div className="flex items-center mb-2">
                                        <div className="flex items-center text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">{/* ... path ... */}</svg>
                                            ))}
                                        </div>
                                        <span className="ml-2 text-sm text-foreground">{review.rating} stars</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                                </div>
                            ))}
                            {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
