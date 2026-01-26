'use client';

import { useState, useEffect } from 'react';
import { Product, Order, Review, User } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { downloadExcel } from '@/lib/export';

import { CATEGORY_SUBCATEGORIES } from '@/constants/categories';

import Notification from '@/components/Notification';
import ConfirmationModal from '@/components/ConfirmationModal';
import SizeSelectorModal from '@/components/SizeSelectorModal';

export default function AdminDashboard() {
    const { user, isLoading: authLoading, logout: authLogout } = useAuth();
    const { clearCart } = useCart();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'kids' | 'men' | 'women' | 'daily_special' | 'orders' | 'reviews' | 'site_settings' | 'users' | 'banners'>('kids');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [usersList, setUsersList] = useState<User[]>([]);
    const [siteSettings, setSiteSettings] = useState({
        hero_title: '',
        hero_subtitle: '',
        hero_image: '',
        hero_video: ''
    });

    // New Product Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        stock: '',
        category: 'kids' as Product['category'],
        subcategory: '',
        sizes: '',
        details: '',
        sizePrices: ''
    });
    const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Notification State
    const [notification, setNotification] = useState({
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
        isVisible: false
    });

    // Delete Confirmation State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [sizeModalOpen, setSizeModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type, isVisible: true });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    };

    const handleLogout = () => {
        clearCart();
        authLogout();
        router.push('/login');
    };

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
    }, [user, authLoading, activeTab]);

    // Update category when tab changes
    useEffect(() => {
        if (['kids', 'men', 'women', 'daily_special', 'banners'].includes(activeTab)) {
            setNewProduct(prev => ({ ...prev, category: activeTab as any, subcategory: '' }));
        }
        setSidebarOpen(false); // Auto-close sidebar on mobile after choosing a tab
    }, [activeTab]);

    const loadData = async () => {
        try {
            if (['kids', 'men', 'women', 'daily_special', 'banners'].includes(activeTab)) {
                const data = (await api.get('/products')) as unknown as Product[];
                setProducts(data);
            } else if (activeTab === 'orders') {
                const data = (await api.get('/orders')) as unknown as Order[];
                setOrders(data.sort((a, b) => b.id - a.id));
            } else if (activeTab === 'reviews') {
                const data = (await api.get('/reviews/pending')) as unknown as Review[];
                setReviews(data);
            } else if (activeTab === 'site_settings') {
                const data: any = await api.get('/settings').catch(() => ({}));
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
            showNotification('Failed to load dashboard data', 'error');
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/settings', siteSettings);
            showNotification('Site settings updated successfully', 'success');
        } catch (error) {
            showNotification('Failed to update settings', 'error');
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
            showNotification(`Exporting ${type} data...`, 'info');
        } else {
            showNotification('No data to export', 'info');
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const username = (form.elements.namedItem('username') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            await api.post('/users/create', { username, password, role: 'ADMIN' });
            showNotification('Admin user created successfully', 'success');
            form.reset();
            loadData();
        } catch (error) {
            showNotification('Failed to create admin user', 'error');
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const productData = {
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock),
            };

            if (editingProductId) {
                await api.put(`/products/${editingProductId}`, productData);
                showNotification('Product updated successfully', 'success');
            } else {
                await api.post('/products', productData);
                showNotification('Product added successfully', 'success');
            }

            setNewProduct(prev => ({ ...prev, name: '', description: '', price: '', imageUrl: '', stock: '', subcategory: '', sizes: '', details: '', sizePrices: '' }));
            setEditingProductId(null);
            loadData();
        } catch (error) {
            showNotification('Failed to save product', 'error');
        }
    };

    const handleEditClick = (product: Product) => {
        setNewProduct({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock.toString(),
            imageUrl: product.imageUrl,
            category: product.category as any,
            subcategory: product.subcategory || '',
            sizes: product.sizes || '',
            details: product.details || '',
            sizePrices: product.sizePrices || ''
        });
        setEditingProductId(product.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setNewProduct(prev => ({ ...prev, name: '', description: '', price: '', imageUrl: '', stock: '', subcategory: '', sizes: '', details: '', sizePrices: '' }));
        setEditingProductId(null);
    };

    const handleDeleteClick = (id: number) => {
        setProductToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            await api.delete(`/products/${productToDelete}`);
            loadData();
            showNotification('Product deleted successfully', 'success');
        } catch (error) {
            showNotification('Failed to delete product', 'error');
        } finally {
            setDeleteModalOpen(false);
            setProductToDelete(null);
        }
    };

    const handleOrderStatus = async (id: number, status: string) => {
        try {
            await api.put(`/orders/${id}/status?status=${status}`, {});
            loadData();
            showNotification(`Order marked as ${status}`, 'success');
        } catch (error) {
            showNotification('Failed to update order status', 'error');
        }
    };

    const handleReviewApproval = async (id: number, approved: boolean) => {
        try {
            await api.put(`/reviews/${id}/approval?approved=${approved}`, {});
            loadData();
            showNotification(`Review ${approved ? 'approved' : 'rejected'}`, 'success');
        } catch (error) {
            showNotification('Failed to update review', 'error');
        }
    };

    if (authLoading) return <div className="text-center py-20">Loading...</div>;
    if (!user || user.role !== 'ADMIN') return null;

    const filteredProducts = products.filter(p => p.category === activeTab);

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground transition-colors duration-300 relative">
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={closeNotification}
            />
            <ConfirmationModal
                isOpen={deleteModalOpen}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                onConfirm={confirmDeleteProduct}
                onCancel={() => setDeleteModalOpen(false)}
            />

            <SizeSelectorModal
                isOpen={sizeModalOpen}
                category={activeTab}
                basePrice={newProduct.price}
                existingSizes={newProduct.sizes ? newProduct.sizes.split(',').map(x => x.trim()) : []}
                onConfirm={(s, p) => {
                    const currentSizes = newProduct.sizes ? newProduct.sizes.split(',').map(x => x.trim()).filter(x => x) : [];
                    if (s && !currentSizes.includes(s)) {
                        const newSizes = [...currentSizes, s.trim()].join(',');
                        const prices = newProduct.sizePrices ? JSON.parse(newProduct.sizePrices) : {};
                        const newPrices = { ...prices, [s.trim()]: p };

                        setNewProduct({
                            ...newProduct,
                            sizes: newSizes,
                            sizePrices: JSON.stringify(newPrices)
                        });
                        setSizeModalOpen(false);
                    } else {
                        showNotification('Size already exists', 'info');
                    }
                }}
                onCancel={() => setSizeModalOpen(false)}
            />

            {/* Mobile Header */}
            <div className="md:hidden bg-card border-b border-border p-4 flex justify-between items-center sticky top-0 z-20">
                <span className="font-bold text-lg">Admin Panel</span>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-md hover:bg-secondary focus:outline-none"
                    aria-label="Toggle Sidebar"
                >
                    {sidebarOpen ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Sidebar Overview */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`w-64 bg-card shadow-lg fixed inset-y-0 left-0 h-full border-r border-border transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 border-b border-border">
                    <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
                    <p className="text-sm text-muted-foreground">Manage your store</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    {[
                        { id: 'kids', label: 'Kids Fashion' },
                        { id: 'men', label: 'Men\'s Fashion' },
                        { id: 'women', label: 'Women\'s Fashion' },
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
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 mt-8"
                    >
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-8 md:ml-64 w-full max-w-[100vw] overflow-x-hidden">
                {['kids', 'men', 'women', 'daily_special', 'banners'].includes(activeTab) && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-foreground capitalize">{activeTab.replace('_', ' ')} Products</h2>
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
                        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                            <h3 className="text-lg font-medium mb-4">
                                {editingProductId ? 'Edit Product' : `Add new item to ${activeTab.replace('_', ' ')}`}
                            </h3>
                            <form onSubmit={handleSaveProduct} className="space-y-4">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className="block w-full rounded-lg border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border bg-input text-foreground placeholder:text-muted-foreground"
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            className="block w-full rounded-lg border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border bg-input text-foreground placeholder:text-muted-foreground"
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                            className="block w-full rounded-lg border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border bg-input text-foreground placeholder:text-muted-foreground"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <textarea
                                            placeholder="Short Description"
                                            value={newProduct.description}
                                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                            className="block w-full rounded-lg border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border bg-input text-foreground placeholder:text-muted-foreground h-24"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <textarea
                                            placeholder="Product Details (Rich Text/Long Description)"
                                            value={newProduct.details}
                                            onChange={(e) => setNewProduct({ ...newProduct, details: e.target.value })}
                                            className="block w-full rounded-lg border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border bg-input text-foreground placeholder:text-muted-foreground h-32"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">Image Source Type</label>
                                        <select
                                            className="block w-full rounded-lg border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border mb-4 bg-input text-foreground"
                                            value={imageInputType}
                                            onChange={(e) => setImageInputType(e.target.value as 'url' | 'upload')}
                                        >
                                            <option value="url">Image Link (URL)</option>
                                            <option value="upload">Upload Image</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">Subcategory</label>
                                        <select
                                            className="block w-full rounded-lg border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border mb-4 bg-input text-foreground"
                                            value={newProduct.subcategory}
                                            onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                                        >
                                            <option value="">Select Subcategory</option>
                                            {CATEGORY_SUBCATEGORIES[activeTab]?.map((sub) => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-medium text-foreground">Sizes & Individual Pricing</label>
                                            <button
                                                type="button"
                                                onClick={() => setSizeModalOpen(true)}
                                                className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-orange-600 transition-colors"
                                            >
                                                + Add Size
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {newProduct.sizes ? newProduct.sizes.split(',').map(x => x.trim()).filter(x => x).map((size) => {
                                                const prices = newProduct.sizePrices ? JSON.parse(newProduct.sizePrices) : {};
                                                return (
                                                    <div key={size} className="flex flex-col p-3 bg-secondary rounded-lg border border-border relative group">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const currentSizes = newProduct.sizes.split(',').map(x => x.trim()).filter(x => x !== size);
                                                                const newPriceObj = { ...prices };
                                                                delete newPriceObj[size];
                                                                setNewProduct({
                                                                    ...newProduct,
                                                                    sizes: currentSizes.join(','),
                                                                    sizePrices: JSON.stringify(newPriceObj)
                                                                });
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                        >
                                                            ✕
                                                        </button>
                                                        <span className="text-xs font-bold text-muted-foreground mb-1">Size: {size}</span>
                                                        <div className="flex items-center">
                                                            <span className="text-sm mr-1">₹</span>
                                                            <input
                                                                type="number"
                                                                placeholder="Price"
                                                                value={prices[size] || ''}
                                                                onChange={(e) => {
                                                                    const newPriceObj = { ...prices, [size]: parseFloat(e.target.value) || 0 };
                                                                    setNewProduct({ ...newProduct, sizePrices: JSON.stringify(newPriceObj) });
                                                                }}
                                                                className="w-full bg-input border-b border-border text-sm focus:border-primary focus:outline-none py-1"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            }) : (
                                                <p className="col-span-full text-xs text-muted-foreground italic p-4 bg-secondary/50 rounded-lg text-center border border-dashed border-border">
                                                    No sizes added. Click &quot;+ Add Size&quot; to define sizes and their specific prices.
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">
                                            * Base price (set above) will be used if a size doesn&apos;t have a specific price.
                                        </p>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            {imageInputType === 'url' ? 'Image URL' : 'Upload Image'}
                                        </label>

                                        {imageInputType === 'url' ? (
                                            <input
                                                type="text"
                                                placeholder="https://example.com/image.jpg"
                                                value={newProduct.imageUrl}
                                                onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                                                className="block w-full rounded-lg border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border bg-input text-foreground placeholder:text-muted-foreground"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-4 p-4 border-2 border-dashed border-border rounded-lg bg-secondary">
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
                                                                showNotification('Image uploaded successfully', 'success');
                                                            } catch (err) {
                                                                showNotification("Image upload failed", 'error');
                                                            }
                                                        }
                                                    }}
                                                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-orange-600 cursor-pointer"
                                                />
                                            </div>
                                        )}

                                        {newProduct.imageUrl && (
                                            <div className="mt-4">
                                                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                                                <img src={newProduct.imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded-lg shadow-sm border border-border" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    {editingProductId && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="bg-secondary text-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-muted shadow-md transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button type="submit" className="bg-gray-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 shadow-md transition-all">
                                        {editingProductId ? 'Save Changes' : `Add Product`}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Product List */}
                        <div className="bg-card shadow-sm rounded-xl border border-border overflow-hidden">
                            <ul className="divide-y divide-border">
                                {filteredProducts.length > 0 ? filteredProducts.map((p) => (
                                    <li key={p.id} className="p-4 hover:bg-secondary transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            {p.imageUrl && (
                                                <img src={p.imageUrl} alt={p.name} className="h-16 w-16 object-cover rounded-lg bg-gray-100" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{p.subcategory || 'No subcategory'}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-sm font-semibold text-foreground">₹{p.price}</span>
                                                <span className="text-sm text-muted-foreground">Qty: {p.stock}</span>
                                                <button onClick={() => handleEditClick(p)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDeleteClick(p.id)} className="text-red-600 hover:text-red-900 text-sm font-medium p-2 hover:bg-red-50 rounded-lg transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                )) : (
                                    <li className="p-8 text-center text-muted-foreground">
                                        No items in this category yet.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-card shadow-sm rounded-xl border border-border overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-lg font-medium text-foreground">Orders</h2>
                            <button onClick={() => handleExport('orders')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                                Export to Excel
                            </button>
                        </div>
                        <ul className="divide-y divide-border">
                            {orders.map((order) => (
                                <li key={order.id} className="p-6 hover:bg-secondary transition-colors">
                                    <div className="flex flex-col space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div>
                                                <h3 className="text-lg font-medium text-foreground">Order #{order.id}</h3>
                                                <p className="text-sm text-muted-foreground">Placed by: {order.user?.username || 'Unknown'}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <p className="text-lg font-bold text-foreground">₹{order.totalAmount}</p>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${['APPROVED', 'DELIVERED'].includes(order.status) ? 'bg-green-100 text-green-800' :
                                                    ['REJECTED', 'CANCELLED'].includes(order.status) ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            {order.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleOrderStatus(order.id, 'APPROVED')} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">Approve</button>
                                                    <button onClick={() => handleOrderStatus(order.id, 'REJECTED')} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">Reject</button>
                                                </>
                                            )}
                                            {order.status === 'APPROVED' && (
                                                <button onClick={() => handleOrderStatus(order.id, 'DELIVERED')} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Mark Delivered</button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="bg-card shadow-sm rounded-xl border border-border overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-lg font-medium text-foreground">Pending Reviews</h2>
                        </div>
                        <ul className="divide-y divide-border">
                            {reviews.map((r) => (
                                <li key={r.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Rating: {r.rating}/5</p>
                                            <p className="text-sm text-muted-foreground">{r.comment}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleReviewApproval(r.id, true)} className="text-green-600 hover:bg-green-50 px-3 py-1 rounded text-sm transition-colors">Approve</button>
                                            <button onClick={() => handleReviewApproval(r.id, false)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm transition-colors">Reject</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {reviews.length === 0 && <li className="p-8 text-center text-muted-foreground">No pending reviews.</li>}
                        </ul>
                    </div>
                )}

                {activeTab === 'site_settings' && (
                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                        <h2 className="text-lg font-medium mb-6">Site Settings</h2>
                        <form onSubmit={handleUpdateSettings} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Hero Title</label>
                                <input type="text" value={siteSettings.hero_title} onChange={e => setSiteSettings({ ...siteSettings, hero_title: e.target.value })} className="w-full bg-input border border-border rounded-lg p-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                                <textarea value={siteSettings.hero_subtitle} onChange={e => setSiteSettings({ ...siteSettings, hero_subtitle: e.target.value })} className="w-full bg-input border border-border rounded-lg p-3 h-24" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Hero Image URL</label>
                                <input type="text" value={siteSettings.hero_image} onChange={e => setSiteSettings({ ...siteSettings, hero_image: e.target.value })} className="w-full bg-input border border-border rounded-lg p-3" />
                            </div>
                            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-orange-600 shadow-md">
                                Save Settings
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-8">
                        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                            <h2 className="text-lg font-medium mb-4">Create Admin</h2>
                            <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input name="username" placeholder="Username" required className="bg-input border border-border rounded-lg p-3" />
                                <input name="password" type="password" placeholder="Password" required className="bg-input border border-border rounded-lg p-3" />
                                <button type="submit" className="sm:col-span-2 bg-gray-900 text-white px-6 py-2 rounded-lg">Create Admin Account</button>
                            </form>
                        </div>
                        <div className="bg-card shadow-sm rounded-xl border border-border overflow-hidden">
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <h2 className="text-lg font-medium">All Users</h2>
                                <button onClick={() => handleExport('users')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Export Users</button>
                            </div>
                            <ul className="divide-y divide-border">
                                {usersList.map(u => (
                                    <li key={u.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{u.username}</p>
                                            <p className="text-sm text-muted-foreground">Role: {u.role}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
