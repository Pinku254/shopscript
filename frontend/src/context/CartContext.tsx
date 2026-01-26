'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { useAuth } from './AuthContext';

export interface CartItem {
    product: Product;
    quantity: number;
    price: number; // The price at which it was added (includes size override)
    selectedSize?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number, size?: string, overridePrice?: number) => void;
    removeFromCart: (productId: number, size?: string) => void;
    clearCart: () => void;
    cartTotal: number;
    itemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const { user } = useAuth();
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart when user changes
    useEffect(() => {
        setIsLoaded(false); // Reset loaded state
        if (user && user.id) {
            const key = `shopscript_cart_${user.id}`;
            const storedCart = localStorage.getItem(key);
            if (storedCart) {
                try {
                    setCartItems(JSON.parse(storedCart));
                } catch (e) {
                    console.error('Failed to parse cart from local storage', e);
                    setCartItems([]);
                }
            } else {
                setCartItems([]);
            }
            setIsLoaded(true); // Mark as loaded for this user
        } else {
            setCartItems([]); // Clear cart for guest/logout
        }
    }, [user]);

    // Save cart when items change, BUT only if loaded and user exists
    useEffect(() => {
        if (user && user.id && isLoaded) {
            const key = `shopscript_cart_${user.id}`;
            localStorage.setItem(key, JSON.stringify(cartItems));
        }
    }, [cartItems, user, isLoaded]);

    const addToCart = (product: Product, quantity = 1, size?: string, overridePrice?: number) => {
        if (!user) return;

        const effectivePrice = overridePrice !== undefined ? overridePrice : product.price;

        setCartItems(prev => {
            const existing = prev.find(item => item.product.id === product.id && item.selectedSize === size);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id && item.selectedSize === size
                        ? { ...item, quantity: item.quantity + quantity, price: effectivePrice }
                        : item
                );
            }
            return [...prev, { product, quantity, selectedSize: size, price: effectivePrice }];
        });
    };

    const removeFromCart = (productId: number, size?: string) => {
        setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.selectedSize === size)));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const itemsCount = cartItems.length;

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal, itemsCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
