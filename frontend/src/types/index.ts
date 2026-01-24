export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
    category: string;
}

export interface OrderItem {
    id: number;
    product: Product;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    totalAmount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    shippingAddress: string;
    paymentMethod: string;
    paymentStatus: string;
    items: OrderItem[];
    user: User;
}

export interface Review {
    id: number;
    rating: number;
    comment: string;
    isApproved: boolean;
}

export interface User {
    id: number;
    username: string;
    role: 'ADMIN' | 'USER';
}
