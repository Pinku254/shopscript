'use client';

import { useState, useEffect } from 'react';
import { Product, Order, Review } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'reviews'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // New Product Form State
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', imageUrl: '', stock: '' });

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'ADMIN') {
                router.push('/');
            } else {
                loadData();
            }
        }
    }, [activeTab, user, authLoading]);

    const loadData = async () => {
        try {
            if (activeTab === 'products') {
                const data = (await api.get('/products')) as unknown as Product[];
                setProducts(data);
            } else if (activeTab === 'orders') {
                const data = (await api.get('/orders')) as unknown as Order[];
                setOrders(data);
            } else if (activeTab === 'reviews') {
                const data = (await api.get('/reviews/pending')) as unknown as Review[];
                setReviews(data);
            }
        } catch (error) {
            console.error('Error loading data', error);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/products', {
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock),
            });
            setNewProduct({ name: '', description: '', price: '', imageUrl: '', stock: '' });
            loadData();
        } catch (error) {
            alert('Failed to add product');
        }
    };

    const handleOrderStatus = async (id: number, status: string) => {
        try {
            await api.put(`/orders/${id}/status?status=${status}`, {});
            loadData();
        } catch (error) {
            alert('Failed to update order status');
        }
    };

    const handleReviewApproval = async (id: number, approved: boolean) => {
        try {
            await api.put(`/reviews/${id}/approval?approved=${approved}`, {});
            loadData();
        } catch (error) {
            alert('Failed to update review');
        }
    };

    if (authLoading) return <div className="text-center py-20">Loading...</div>;
    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['products', 'orders', 'reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`${activeTab === tab
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'products' && (
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h2 className="text-lg font-medium mb-4">Add New Product</h2>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <input
                                    type="text"
                                    placeholder="Product Name"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-2 border"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-2 border"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-2 border"
                                    required
                                />
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Product Image</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    const formData = new FormData();
                                                    formData.append('file', file);

                                                    try {
                                                        const res = (await api.post('/uploads/image', formData, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        })) as any;
                                                        setNewProduct({ ...newProduct, imageUrl: res.imageUrl });
                                                    } catch (err) {
                                                        console.error("Upload failed", err);
                                                        alert("Image upload failed");
                                                    }
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-indigo-50 file:text-indigo-700
                                                hover:file:bg-indigo-100"
                                        />
                                    </div>
                                    {newProduct.imageUrl && (
                                        <div className="mt-2">
                                            <p className="text-xs text-green-600 mb-1">Image uploaded successfully:</p>
                                            <img src={newProduct.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <textarea
                                placeholder="Description"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-2 border"
                                rows={3}
                            />
                            <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                                Add Product
                            </button>
                        </form>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                        <ul className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <li key={product.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                                        <p className="text-sm text-gray-500">${product.price} - Stock: {product.stock}</p>
                                    </div>
                                    <button className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {orders.map((order) => (
                            <li key={order.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Order #{order.id}</h3>
                                    <p className="text-sm text-gray-500">Total: ${order.totalAmount} - Status: <span className="font-bold">{order.status}</span></p>
                                </div>
                                <div className="space-x-2">
                                    {order.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleOrderStatus(order.id, 'APPROVED')} className="text-green-600 hover:text-green-900 text-sm font-medium">Approve</button>
                                            <button onClick={() => handleOrderStatus(order.id, 'REJECTED')} className="text-red-600 hover:text-red-900 text-sm font-medium">Reject</button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Pending Reviews</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {reviews.map((review) => (
                            <li key={review.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Rating: {review.rating}/5</p>
                                        <p className="text-sm text-gray-500 mt-1">{review.comment}</p>
                                    </div>
                                    <div className="space-x-2">
                                        <button onClick={() => handleReviewApproval(review.id, true)} className="text-green-600 hover:text-green-900 text-sm font-medium">Approve</button>
                                        <button onClick={() => handleReviewApproval(review.id, false)} className="text-red-600 hover:text-red-900 text-sm font-medium">Reject</button>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {reviews.length === 0 && (
                            <li className="px-6 py-4 text-sm text-gray-500">No pending reviews.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
