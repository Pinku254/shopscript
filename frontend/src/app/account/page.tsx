'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Order } from '@/types';

export default function AccountPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                // Using user.id if available, otherwise 1 as fallback/demo if context is incomplete
                const userId = user.id || 1;
                const data = (await api.get(`/orders/user/${userId}`)) as unknown as Order[];
                setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="bg-background min-h-screen text-foreground transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Tabs */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                            <div className="p-6 border-b border-border bg-gradient-to-br from-primary/10 to-transparent">
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold uppercase">
                                        {user.username.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h2 className="text-lg font-bold truncate text-foreground">{user.username}</h2>
                                        <p className="text-xs text-muted-foreground uppercase">{user.role}</p>
                                    </div>
                                </div>
                            </div>
                            <nav className="p-2 space-y-1">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    <span>Overview</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <span>My Orders</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Settings</span>
                                </button>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                                        <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
                                        <div className="mt-2 text-3xl font-bold text-foreground">{orders.length}</div>
                                    </div>
                                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                                        <div className="text-sm font-medium text-muted-foreground">Active Orders</div>
                                        <div className="mt-2 text-3xl font-bold text-primary">
                                            {orders.filter(o => ['PENDING', 'APPROVED'].includes(o.status)).length}
                                        </div>
                                    </div>
                                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                                        <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
                                        <div className="mt-2 text-3xl font-bold text-foreground">
                                            ₹{orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(0)}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                                    <h2 className="text-lg font-bold text-foreground mb-4">Recent Activity</h2>
                                    {orders.length > 0 ? (
                                        <div className="space-y-4">
                                            {orders.slice(0, 3).map(order => (
                                                <div key={order.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-foreground">Order #{order.id}</p>
                                                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            ))}
                                            <button onClick={() => setActiveTab('orders')} className="text-sm text-primary hover:underline">View all orders &rarr;</button>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No recent activity.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ORDERS TAB */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
                                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                                    {loading ? (
                                        <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
                                    ) : orders.length > 0 ? (
                                        <ul className="divide-y divide-border">
                                            {orders.map((order) => (
                                                <li key={order.id} className="p-6">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-foreground">Order #{order.id}</h3>
                                                            <p className="text-sm text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="mt-2 md:mt-0 text-right">
                                                            <p className="text-xl font-bold text-foreground">₹{order.totalAmount}</p>
                                                            <p className={`text-sm font-semibold ${order.status === 'DELIVERED' ? 'text-green-600' :
                                                                order.status === 'CANCELLED' ? 'text-red-600' :
                                                                    'text-yellow-600'
                                                                }`}>{order.status}</p>
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-border pt-4">
                                                        <h4 className="text-sm font-medium text-foreground mb-2">Items</h4>
                                                        <ul className="space-y-2">
                                                            {order.items?.map((item) => (
                                                                <li key={item.id} className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">{item.product?.name} (x{item.quantity}){item.selectedSize ? ` - Size: ${item.selectedSize}` : ''}</span>
                                                                    <span className="text-foreground font-medium">₹{item.price * item.quantity}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                                                        <span className="font-medium text-foreground">Shipping to:</span> {order.shippingAddress?.split('\n')[0]}...
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-12 text-center">
                                            <div className="inline-block p-4 rounded-full bg-secondary mb-4">
                                                <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-foreground">No orders yet</h3>
                                            <p className="text-muted-foreground mt-1">Start shopping to see your orders here.</p>
                                            <Link href="/" className="mt-4 inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                                                Browse Products
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SETTINGS TAB */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
                                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                                    <div className="p-6 border-b border-border">
                                        <h3 className="text-lg font-medium text-foreground">Profile Information</h3>
                                        <p className="text-sm text-muted-foreground">View your account details</p>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
                                                <div className="p-3 bg-secondary rounded-lg text-foreground font-medium border border-border">
                                                    {user.username}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1">Account Role</label>
                                                <div className="p-3 bg-secondary rounded-lg text-foreground font-medium border border-border">
                                                    {user.role}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1">User ID</label>
                                                <div className="p-3 bg-secondary rounded-lg text-foreground font-medium border border-border">
                                                    {user.id}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden opacity-75">
                                    <div className="p-6 border-b border-border">
                                        <h3 className="text-lg font-medium text-foreground">Security</h3>
                                        <p className="text-sm text-muted-foreground">Manage your password (coming soon)</p>
                                    </div>
                                    <div className="p-6">
                                        <button disabled className="bg-secondary text-muted-foreground px-4 py-2 rounded-lg font-medium cursor-not-allowed">
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
