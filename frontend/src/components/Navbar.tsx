'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const { user, logout: authLogout } = useAuth();
    const { itemsCount, clearCart } = useCart();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        clearCart();
        authLogout();
        setIsMobileMenuOpen(false);
    };

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <nav className="bg-card border-b border-border sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-2xl font-bold text-foreground tracking-tight">
                                ShopScript
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/" className="border-transparent text-muted-foreground hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                Home
                            </Link>
                            <Link href="/category/men" className="border-transparent text-muted-foreground hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                Men
                            </Link>
                            <Link href="/category/women" className="border-transparent text-muted-foreground hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                Women
                            </Link>
                            <Link href="/category/kids" className="border-transparent text-muted-foreground hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                Kids
                            </Link>
                            {user?.role === 'ADMIN' && (
                                <Link href="/admin" className="border-transparent text-primary hover:text-primary/80 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center px-2 lg:ml-6 lg:justify-end space-x-4">
                        <SearchBar />
                        <ThemeToggle />
                    </div>

                    <div className="hidden sm:flex items-center space-x-4 ml-4">
                        {user && (
                            <Link href="/checkout" className="relative group">
                                <span className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Cart {itemsCount > 0 && `(${itemsCount})`}
                                </span>
                            </Link>
                        )}

                        {user ? (
                            <>
                                <Link href="/account" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block">
                                    My Account ({user.username})
                                </Link>
                                <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="space-x-4 flex items-center">
                                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Login
                                </Link>
                                <Link href="/register" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <div className="mr-2">
                            <ThemeToggle />
                        </div>
                        {user && (
                            <Link href="/checkout" className="mr-2 relative group p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {itemsCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">{itemsCount}</span>
                                )}
                            </Link>
                        )}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden bg-card border-b border-border">
                    <div className="pt-2 pb-3 space-y-1 px-2">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted">Home</Link>
                        <Link href="/category/men" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted">Men</Link>
                        <Link href="/category/women" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted">Women</Link>
                        <Link href="/category/kids" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted">Kids</Link>
                        {user?.role === 'ADMIN' && (
                            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-muted">Admin</Link>
                        )}
                    </div>
                    <div className="px-4 py-2">
                        <SearchBar />
                    </div>
                    <div className="pt-4 pb-4 border-t border-border">
                        {user ? (
                            <div className="px-4 space-y-3">
                                <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-foreground hover:text-primary">
                                    My Account ({user.username})
                                </Link>
                                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="px-4 space-y-2">
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-muted-foreground hover:bg-muted">
                                    Login
                                </Link>
                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-orange-700">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
