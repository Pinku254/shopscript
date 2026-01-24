'use client';

import { useState, useEffect } from 'react';
import { Product, Order, Review } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { downloadExcel } from '@/lib/export';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'kids' | 'boys' | 'girls' | 'daily_special' | 'orders' | 'reviews' | 'site_settings' | 'users' | 'banners'>('kids');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [usersList, setUsersList] = useState<any[]>([]); // Using any for simplicity or define User type
    const [banners, setBanners] = useState<Product[]>([]); // Reusing Product type as Banner for simplicity for now, or I should define Banner type. The user asked for "image scrolling", effectively banners. I'll check if I should create a new type, but for now reuse Product structure or just {id, imageUrl, name (title), description}. Let's assume using Product structure with category 'banner' is easiest way to leverage existing API.
    const [siteSettings, setSiteSettings] = useState({ hero_title: '', hero_subtitle: '', hero_image: '', hero_video: '' });
    const { user, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();

    // New Product Form State
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', imageUrl: '', stock: '', category: 'kids' });
    const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
    const [selectedUser, setSelectedUser] = useState<any>(null);

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

    // Update category when tab changes
    useEffect(() => {
        if (['kids', 'boys', 'girls', 'daily_special', 'banners'].includes(activeTab)) {
            setNewProduct(prev => ({ ...prev, category: activeTab }));
        }
    }, [activeTab]);

    const loadData = async () => {
        try {
            if (['kids', 'boys', 'girls', 'daily_special', 'banners'].includes(activeTab)) {
                // For now, fetch all and filter client-side. 
                // In a real app, you'd fetch /products?category=...
                const data = (await api.get('/products')) as unknown as Product[];
                setProducts(data);
            } else if (activeTab === 'orders') {
                const data = (await api.get('/orders')) as unknown as Order[];
                setOrders(data);
            } else if (activeTab === 'reviews') {
                const data = (await api.get('/reviews/pending')) as unknown as Review[];
                setReviews(data);
            } else if (activeTab === 'site_settings') {
                const data: any = await api.get('/settings');
                setSiteSettings({
                    hero_title: data.hero_title || '',
                    hero_subtitle: data.hero_subtitle || '',
                    hero_image: data.hero_image || '',
                    hero_video: data.hero_video || ''
                });
            } else if (activeTab === 'users') {
                const [usersData, ordersData] = await Promise.all([
                    api.get('/users'),
                    api.get('/orders')
                ]);
                setUsersList(usersData as unknown as any[]);
                setOrders(ordersData as unknown as Order[]);
            }
        } catch (error) {
            console.error('Error loading data', error);
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/settings', siteSettings);
            alert('Settings updated successfully');
        } catch (error) {
            alert('Failed to update settings');
        }
    };

    const handleExport = (type: string) => {
        const timestamp = new Date().toISOString().slice(0, 10);
        let dataToExport: any[] = [];
        let filename = '';

        if (type === 'products') {
            dataToExport = products;
            filename = `products_${timestamp}.xlsx`;
        } else if (type === 'orders') {
            dataToExport = orders.map(o => ({
                'Order ID': o.id,
                'Placed By': o.user?.username || 'Unknown',
                'Date': new Date(o.createdAt).toLocaleDateString(),
                'Total Amount': o.totalAmount,
                'Status': o.status,
                'Shipping Address': o.shippingAddress,
                'Payment Method': o.paymentMethod,
                'Payment Status': o.paymentStatus,
                'Items': o.items?.map(i => `${i.product?.name} (x${i.quantity})`).join(', ')
            }));
            filename = `orders_${timestamp}.xlsx`;
        } else if (type === 'reviews') {
            dataToExport = reviews;
            filename = `reviews_${timestamp}.xlsx`;
        } else if (type === 'users') {
            dataToExport = usersList.map(u => {
                const userOrders = orders.filter(o => o.user?.username === u.username);
                const lastOrder = userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                const confirmedCount = userOrders.filter(o => ['APPROVED', 'DELIVERED'].includes(o.status)).length;
                const cancelledCount = userOrders.filter(o => ['REJECTED', 'CANCELLED'].includes(o.status)).length;

                return {
                    'Username': u.username,
                    'Role': u.role,
                    'Confirmed Orders': confirmedCount,
                    'Cancelled Orders': cancelledCount,
                    'Last Delivery Address': lastOrder?.shippingAddress || 'N/A'
                };
            });
            filename = `users_${timestamp}.xlsx`;
        }

        if (dataToExport.length > 0) {
            downloadExcel(dataToExport, filename);
        } else {
            alert('No data to export');
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const username = (form.elements.namedItem('username') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            await api.post('/users/create', { username, password, role: 'ADMIN' });
            alert('Admin user created successfully');
            form.reset();
            loadData();
        } catch (error) {
            alert('Failed to delete product'); // Copy paste error in my thought, fixed below
        }
    };

    // Correct catch block manually
    const handleCreateAdminFixed = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const username = (form.elements.namedItem('username') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            await api.post('/users/create', { username, password, role: 'ADMIN' });
            alert('Admin user created successfully');
            form.reset();
            loadData();
        } catch (error) {
            alert('Failed to create admin user');
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
            setNewProduct(prev => ({ ...prev, name: '', description: '', price: '', imageUrl: '', stock: '' })); // Keep category
            loadData();
        } catch (error) {
            alert('Failed to add product');
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            loadData();
        } catch (error) {
            alert('Failed to delete product');
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

    const filteredProducts = products.filter(p => p.category === activeTab);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg fixed h-full">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-sm text-gray-500">Manage your store</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    {[
                        { id: 'kids', label: 'Kids Fashion' },
                        { id: 'boys', label: 'Boys Fashion' },
                        { id: 'girls', label: 'Girls Fashion' },
                        { id: 'daily_special', label: 'Daily Specials' },
                        { id: 'banners', label: 'Home Banners' },
                        { id: 'orders', label: 'Orders' },
                        { id: 'reviews', label: 'Reviews' },
                        { id: 'site_settings', label: 'Site Settings' },
                        { id: 'users', label: 'User Management' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <button
                        onClick={logout}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 mt-8"
                    >
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="ml-64 flex-1 p-8">
                {['kids', 'boys', 'girls', 'daily_special', 'banners'].includes(activeTab) && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab.replace('_', ' ')} Products</h2>
                            <div className="flex space-x-2">
                                <button onClick={() => handleExport('products')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                                    Export to Excel
                                </button>
                                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                    {filteredProducts.length} Products
                                </span>
                            </div>
                        </div>

                        {/* Add Product Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-medium mb-4">Add new item to {activeTab.replace('_', ' ')}</h3>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm p-3 border"
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm p-3 border"
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm p-3 border"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Image Source Type</label>
                                        <select
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm p-3 border mb-4"
                                            value={imageInputType}
                                            onChange={(e) => setImageInputType(e.target.value as 'url' | 'upload')}
                                        >
                                            <option value="url">Image Link (URL)</option>
                                            <option value="upload">Upload Image</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {imageInputType === 'url' ? 'Image URL' : 'Upload Image'}
                                        </label>

                                        {imageInputType === 'url' ? (
                                            <input
                                                type="text"
                                                placeholder="https://example.com/image.jpg"
                                                value={newProduct.imageUrl}
                                                onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm p-3 border"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
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
                                                                alert('Image uploaded successfully');
                                                            } catch (err) {
                                                                console.error("Upload failed", err);
                                                                alert("Image upload failed");
                                                            }
                                                        }
                                                    }}
                                                    className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-gray-900 file:text-white
                                                        hover:file:bg-gray-700 cursor-pointer"
                                                />
                                            </div>
                                        )}

                                        {newProduct.imageUrl && (
                                            <div className="mt-4">
                                                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                                                <img src={newProduct.imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded-lg shadow-sm border border-gray-200" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-md transition-all hover:scale-105">
                                        Add to {activeTab.replace('_', ' ')}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Product List */}
                        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                                    <li key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            {product.imageUrl && (
                                                <img src={product.imageUrl} alt={product.name} className="h-16 w-16 object-cover rounded-lg" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                <p className="text-sm text-gray-500 truncate">{product.description}</p>
                                            </div>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                ₹{product.price}
                                            </div>
                                            <div className="inline-flex items-center text-sm text-gray-500">
                                                Stock: {product.stock}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-red-600 hover:text-red-900 text-sm font-medium p-2 hover:bg-red-50 rounded-lg"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                )) : (
                                    <li className="p-8 text-center text-gray-500">
                                        No items in {activeTab.replace('_', ' ')} yet.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Orders</h2>
                            <button onClick={() => handleExport('orders')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                                Export to Excel
                            </button>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <li key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">Order #{order.id}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Placed by: <span className="font-semibold text-gray-700">{order.user?.username || 'Unknown User'}</span>
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">₹{order.totalAmount}</p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'APPROVED' || order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'REJECTED' || order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="font-medium text-gray-700">Shipping Address:</p>
                                                <p className="text-gray-600 whitespace-pre-line">{order.shippingAddress || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-700">Payment:</p>
                                                <p className="text-gray-600">Method: {order.paymentMethod || 'N/A'}</p>
                                                <p className="text-gray-600">Status: {order.paymentStatus || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4">
                                            <p className="font-medium text-gray-700 mb-2">Items:</p>
                                            <ul className="space-y-2">
                                                {order.items && order.items.map((item) => (
                                                    <li key={item.id} className="flex justify-between text-sm text-gray-600">
                                                        <span>{item.product?.name || 'Unknown Product'} (x{item.quantity})</span>
                                                        <span>₹{item.price}</span>
                                                    </li>
                                                ))}
                                                {(!order.items || order.items.length === 0) && (
                                                    <li className="text-sm text-gray-400">No items details available</li>
                                                )}
                                            </ul>
                                        </div>

                                        <div className="flex space-x-3 pt-2">
                                            {order.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleOrderStatus(order.id, 'APPROVED')} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                                                        Approve Order
                                                    </button>
                                                    <button onClick={() => handleOrderStatus(order.id, 'REJECTED')} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors">
                                                        Reject Order
                                                    </button>
                                                </>
                                            )}
                                            {order.status === 'APPROVED' && (
                                                <button onClick={() => handleOrderStatus(order.id, 'DELIVERED')} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                                                    Mark as Delivered
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {orders.length === 0 && (
                                <li className="px-6 py-8 text-center text-gray-500">No orders found.</li>
                            )}
                        </ul>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Pending Reviews</h2>
                            <button onClick={() => handleExport('reviews')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                                Export to Excel
                            </button>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {reviews.map((review) => (
                                <li key={review.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 flex items-center">
                                                <span className="text-yellow-400 mr-1">★</span> {review.rating}/5
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">{review.comment}</p>
                                        </div>
                                        <div className="space-x-2">
                                            <button onClick={() => handleReviewApproval(review.id, true)} className="text-green-600 hover:bg-green-50 px-3 py-1 rounded-lg text-sm font-medium transition-colors">Approve</button>
                                            <button onClick={() => handleReviewApproval(review.id, false)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-medium transition-colors">Reject</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {reviews.length === 0 && (
                                <li className="px-6 py-8 text-center text-gray-500">No pending reviews.</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            {activeTab === 'site_settings' && (
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-medium mb-4">Home Page Settings</h2>
                        <form onSubmit={handleUpdateSettings} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hero Section Title</label>
                                <input
                                    type="text"
                                    value={siteSettings.hero_title}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, hero_title: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm p-3 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hero Section Subtitle</label>
                                <textarea
                                    value={siteSettings.hero_subtitle}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, hero_subtitle: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm p-3 border"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hero Background Image URL</label>
                                <input
                                    type="text"
                                    value={siteSettings.hero_image}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, hero_image: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm p-3 border"
                                />
                                {siteSettings.hero_image && (
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-500 mb-2">Preview Image:</p>
                                        <img src={siteSettings.hero_image} alt="Hero Preview" className="h-48 w-full object-cover rounded-lg shadow-md" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hero Background Video URL (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., /videos/hero.mp4 or external URL"
                                    value={siteSettings.hero_video}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, hero_video: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm p-3 border"
                                />
                                <p className="text-xs text-gray-500 mt-1">If provided, this video will play in the background instead of the image/banners.</p>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 shadow-md transition-all hover:scale-105">
                                    Save Settings
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {activeTab === 'users' && (
                <div className="space-y-8">
                    {/* User Dashboard Stats */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Registered Users</dt>
                                            <dd className="text-3xl font-semibold text-gray-900">{usersList.length}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-medium mb-4">Create New Admin User</h2>
                        <form onSubmit={handleCreateAdminFixed} className="space-y-4">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <input
                                    name="username"
                                    type="text"
                                    placeholder="Username"
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm p-3 border"
                                    required
                                />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm p-3 border"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-md transition-all hover:scale-105">
                                    Create Admin
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">All Users</h2>
                            <button onClick={() => handleExport('users')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                                Export to Excel
                            </button>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {usersList.map((u) => {
                                const userOrders = orders.filter(o => o.user?.username === u.username);
                                const lastOrder = userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                                const confirmedCount = userOrders.filter(o => ['APPROVED', 'DELIVERED'].includes(o.status)).length;
                                const cancelledCount = userOrders.filter(o => ['REJECTED', 'CANCELLED'].includes(o.status)).length;

                                return (
                                    <li key={u.id}
                                        onClick={() => setSelectedUser({ ...u, userOrders, confirmedCount, cancelledCount, lastOrder })}
                                        className="p-6 hover:bg-indigo-50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex md:items-center justify-between flex-col md:flex-row space-y-4 md:space-y-0">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{u.username}</p>
                                                <p className="text-sm text-gray-500">Role: {u.role}</p>
                                            </div>
                                            <div className="flex-1 px-4">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</p>
                                                <p className="text-sm text-gray-600 truncate max-w-xs" title={lastOrder?.shippingAddress}>
                                                    {lastOrder?.shippingAddress ? lastOrder.shippingAddress.split('\n')[0] + '...' : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="flex flex-1 space-x-6 justify-end">
                                                <div className="text-center">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmed</p>
                                                    <p className="text-lg font-bold text-green-600">{confirmedCount}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cancelled</p>
                                                    <p className="text-lg font-bold text-red-600">{cancelledCount}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* User Details Modal */}
                    {selectedUser && (
                        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedUser(null)}></div>
                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                    User Details: {selectedUser.username}
                                                </h3>
                                                <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="block text-xs font-medium text-gray-500">Total Orders</span>
                                                        <span className="block text-xl font-bold text-gray-900">{selectedUser.userOrders.length}</span>
                                                    </div>
                                                    <div className="bg-green-50 p-3 rounded">
                                                        <span className="block text-xs font-medium text-green-600">Delivered/Approved</span>
                                                        <span className="block text-xl font-bold text-green-700">{selectedUser.confirmedCount}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Addresses Used</h4>
                                                    <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto border border-gray-200">
                                                        {selectedUser.userOrders.length > 0 ? (
                                                            [...new Set(selectedUser.userOrders.map((o: any) => o.shippingAddress))].map((addr: any, idx) => (
                                                                <div key={idx} className="text-sm text-gray-600 mb-2 border-b border-gray-200 last:border-0 pb-2 last:pb-0 whitespace-pre-line">
                                                                    {addr}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-sm text-gray-500">No addresses on record.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Orders</h4>
                                                    <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                                                        {selectedUser.userOrders.slice(0, 5).map((o: any) => (
                                                            <li key={o.id} className="p-3 text-sm flex justify-between hover:bg-gray-50">
                                                                <span>Order #{o.id} ({new Date(o.createdAt).toLocaleDateString()})</span>
                                                                <span className={`font-medium ${o.status === 'DELIVERED' ? 'text-green-600' : 'text-gray-600'}`}>{o.status}</span>
                                                            </li>
                                                        ))}
                                                        {selectedUser.userOrders.length === 0 && <li className="p-3 text-sm text-gray-500 text-center">No orders found.</li>}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => setSelectedUser(null)}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
