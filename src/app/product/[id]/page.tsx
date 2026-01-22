'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Product, Review } from '@/types';
import { api } from '@/lib/api';

export default function ProductDetails() {
    const params = useParams();
    const id = params.id;

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Review Form
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

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
            alert('Review submitted for approval!');
        } catch (error) {
            alert('Failed to submit review');
        }
    };

    const handleBuyNow = async () => {
        try {
            // Hardcoded user ID for demo
            await api.post(`/orders/user/1`, {
                totalAmount: product?.price,
                status: 'PENDING'
            });
            alert('Order placed successfully!');
        } catch (error) {
            alert('Failed to place order');
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    return (
        <div className="bg-white">
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
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>

                    <div className="mt-3">
                        <h2 className="sr-only">Product information</h2>
                        <p className="text-3xl text-gray-900">${product.price}</p>
                    </div>

                    <div className="mt-6">
                        <h3 className="sr-only">Description</h3>
                        <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: product.description }} />
                    </div>

                    <div className="mt-10 flex sm:flex-col1">
                        <button
                            onClick={handleBuyNow}
                            className="max-w-xs flex-1 bg-gray-900 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-500 sm:w-full"
                        >
                            Buy Now
                        </button>
                    </div>

                    {/* Reviews Section */}
                    <section aria-labelledby="reviews-heading" className="mt-16 pt-10 border-t border-gray-200">
                        <h2 id="reviews-heading" className="text-lg font-medium text-gray-900">Recent Reviews</h2>

                        <div className="mt-6 space-y-10 divide-y divide-gray-200 border-b border-gray-200 pb-10">
                            {reviews.map((review) => (
                                <div key={review.id} className="pt-10 lg:grid lg:grid-cols-12 lg:gap-x-8">
                                    <div className="lg:col-span-8 lg:col-start-5 xl:col-span-9 xl:col-start-4 xl:grid xl:grid-cols-3 xl:gap-x-8">
                                        <div className="flex items-center xl:col-span-1">
                                            <div className="flex items-center">
                                                {[0, 1, 2, 3, 4].map((rating) => (
                                                    <svg
                                                        key={rating}
                                                        className={`${review.rating > rating ? 'text-yellow-400' : 'text-gray-200'
                                                            } h-5 w-5 flex-shrink-0`}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <p className="ml-3 text-sm text-gray-700">{review.rating} stars</p>
                                        </div>

                                        <div className="mt-4 lg:mt-0 xl:col-span-2 xl:mt-0">
                                            <div className="mt-3 space-y-6 text-sm text-gray-500">
                                                <p>{review.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
                        </div>

                        {/* Add Review Form */}
                        <div className="mt-10">
                            <h3 className="text-lg font-medium text-gray-900">Share your thoughts</h3>
                            <form onSubmit={handleAddReview} className="mt-4 space-y-4">
                                <div>
                                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating</label>
                                    <select
                                        id="rating"
                                        value={newReview.rating}
                                        onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md border"
                                    >
                                        <option value="5">5 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="3">3 Stars</option>
                                        <option value="2">2 Stars</option>
                                        <option value="1">1 Star</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
                                    <textarea
                                        id="comment"
                                        rows={4}
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        className="mt-1 block w-full shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm border-gray-300 rounded-md border p-2"
                                        required
                                    />
                                </div>
                                <button type="submit" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
