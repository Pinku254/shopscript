'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [securityQuestion, setSecurityQuestion] = useState('What is your favorite pet?');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const router = useRouter();

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
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const user = await api.post('/users/register', { username, password, role, securityQuestion, securityAnswer });
            login(user);
        } catch (err) {
            setError('Registration failed. Username might be taken.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        Create a new account
                    </h2>
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                        Or{' '}
                        <Link href="/login" className="font-medium text-orange-500 hover:text-orange-400">
                            sign in to existing account
                        </Link>
                    </div>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-input"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-input"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="securityQuestion" className="sr-only">Security Question</label>
                            <select
                                id="securityQuestion"
                                className="block w-full px-3 py-2 border border-input text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input"
                                value={securityQuestion}
                                onChange={(e) => setSecurityQuestion(e.target.value)}
                            >
                                <option value="What is your favorite pet?">What is your favorite pet?</option>
                                <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                                <option value="What was your first car?">What was your first car?</option>
                                <option value="What city were you born in?">What city were you born in?</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="securityAnswer" className="sr-only">Security Answer</label>
                            <input
                                id="securityAnswer"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-input"
                                placeholder="Security Answer"
                                value={securityAnswer}
                                onChange={(e) => setSecurityAnswer(e.target.value)}
                            />
                        </div>

                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
