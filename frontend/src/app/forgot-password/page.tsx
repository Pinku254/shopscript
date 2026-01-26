'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Notification from '@/components/Notification';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Username Input, 2: Security Question & New Password
    const [username, setUsername] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Notification State
    const [notification, setNotification] = useState({
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
        isVisible: false
    });

    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type, isVisible: true });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    };

    const handleGetQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = (await api.post('/users/forgot-password/get-question', { username })) as any;
            setSecurityQuestion(res.securityQuestion);
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data || 'User not found or no security question set.');
            showNotification(err.response?.data || 'User not found.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            showNotification('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/forgot-password/reset-with-answer', {
                username,
                answer,
                newPassword
            });
            showNotification('Password reset successfully! Redirecting...', 'success');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data || 'Failed to reset password. Incorrect answer?');
            showNotification(err.response?.data || 'Reset failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative">
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={closeNotification}
            />

            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-foreground">
                        Forgot Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        {step === 1 ? 'Enter your username to retrieve your security question' : 'Answer your security question to reset password'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm text-center" role="alert">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form className="mt-8 space-y-6" onSubmit={handleGetQuestion}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-foreground">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="mt-1 appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Loading...' : 'Get Security Question'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                        <div className="space-y-4">
                            <div className="p-4 bg-secondary rounded-md border border-border">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                    Security Question
                                </label>
                                <p className="mt-1 text-lg font-medium text-foreground">
                                    {securityQuestion}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="answer" className="block text-sm font-medium text-foreground">
                                    Your Answer
                                </label>
                                <input
                                    id="answer"
                                    name="answer"
                                    type="text"
                                    required
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                    placeholder="Enter your security answer"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-foreground">
                                    New Password
                                </label>
                                <input
                                    id="new-password"
                                    name="new-password"
                                    type="password"
                                    required
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    required
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm font-medium text-primary hover:text-orange-500"
                            >
                                Check a different username
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-4 text-center">
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
