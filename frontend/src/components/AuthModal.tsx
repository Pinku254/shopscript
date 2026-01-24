'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AuthModal() {
    const { isModalOpen, modalMode, openModal, closeModal, login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('USER'); // For register

    // Reset state when modal opens or mode changes
    useEffect(() => {
        if (isModalOpen) {
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            setLoading(false);
            setRole('USER');
        }
    }, [isModalOpen, modalMode]);

    if (!isModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);


        if (modalMode === 'REGISTER' && password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            if (modalMode === 'LOGIN') {
                const user = await api.post('/users/login', { username, password });
                login(user, false); // Pass false to prevent redirect, or true if you want to go to home. 
                // User flow: Click product -> Modal -> Login -> Modal closes -> User still on page -> Click product again -> Works.
                // Actually, if we pass false, we stay on the current page. The modal closes. 
                // The user can then click the product card again and it will work immediately.
            } else {
                const user = await api.post('/users/register', { username, password, role });
                login(user, false);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.data) {
                setError(typeof err.response.data === 'string' ? err.response.data : err.response.data.message || 'Authentication failed. Please check your credentials.');
            } else {
                setError('Authentication failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
                onClick={closeModal}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 opacity-100">

                {/* Close button */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {modalMode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {modalMode === 'LOGIN'
                                ? 'Sign in to access exclusive deals and product details.'
                                : 'Join us to shop the latest trends.'}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username-modal" className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                id="username-modal"
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password-modal" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="password-modal"
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                        </div>

                        {modalMode === 'REGISTER' && (
                            <div>
                                <label htmlFor="confirmPassword-modal" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input
                                    id="confirmPassword-modal"
                                    type="password"
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                />
                            </div>
                        )}



                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Processing...' : (modalMode === 'LOGIN' ? 'Sign In' : 'Register')}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        {modalMode === 'LOGIN' ? (
                            <p className="text-gray-600">
                                You have not registered?{' '}
                                <button
                                    onClick={() => openModal('REGISTER')}
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Register
                                </button>
                            </p>
                        ) : (
                            <p className="text-gray-600">
                                Already registered?{' '}
                                <button
                                    onClick={() => openModal('LOGIN')}
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Login
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
