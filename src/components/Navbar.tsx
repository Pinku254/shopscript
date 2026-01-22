'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import SearchBar from './SearchBar';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
                                ShopScript
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Home
                            </Link>
                            <Link href="/category/girls" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Girls
                            </Link>
                            <Link href="/category/boys" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Boys
                            </Link>
                            <Link href="/category/kids" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Kids
                            </Link>
                            {user?.role === 'ADMIN' && (
                                <Link href="/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
                        <SearchBar />
                    </div>

                    <div className="flex items-center space-x-4 ml-4">
                        {user ? (
                            <>
                                <span className="text-sm text-gray-500 hidden md:block">Hi, {user.username}</span>
                                <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-900">
                                    Logout
                                </button>
                                <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                                    Cart (0)
                                </button>
                            </>
                        ) : (
                            <div className="space-x-4">
                                <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                                    Login
                                </Link>
                                <Link href="/register" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
