'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    login: (userData: any, shouldRedirect?: boolean) => void;
    logout: () => void;
    isLoading: boolean;
    isModalOpen: boolean;
    modalMode: 'LOGIN' | 'REGISTER';
    openModal: (mode?: 'LOGIN' | 'REGISTER') => void;
    closeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (data: any, shouldRedirect: boolean = true) => {
        // data is JwtResponse { token, id, username, role }
        const { token, ...userData } = data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsModalOpen(false); // Close modal on successful login

        if (userData.role === 'ADMIN') {
            router.push('/admin');
        } else if (shouldRedirect) {
            router.push('/');
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    const openModal = (mode: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
        console.log("Opening modal in mode:", mode);
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, isModalOpen, modalMode, openModal, closeModal }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
