'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const router = useRouter(); // Import this at top: import { useRouter } from 'next/navigation';

    useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = await api.post('/users/login', { username, password });
            login(user); // Ensure this is also awaited or handles the promise correctly if it's async
        } catch (err: any) {
            console.error("Login Error:", err);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.data) {
                    setError(typeof err.response.data === 'string' ? err.response.data : err.response.data.message || 'Invalid credentials');
                } else {
                    setError(`Server error: ${err.response.status}`);
                }
            } else if (err.request) {
                // The request was made but no response was received
                setError('No response from server. Please ensure the backend is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(err.message || 'An error occurred during login. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        Sign in to your account
                    </h2>
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                        Or{' '}
                        <Link href="/register" className="font-medium text-orange-500 hover:text-orange-400">
                            register for a new account
                        </Link>
                    </div>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-input"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-input"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link href="/forgot-password" className="font-medium text-orange-600 hover:text-orange-500">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
