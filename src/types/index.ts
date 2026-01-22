export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
}

export interface Order {
    id: number;
    totalAmount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
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
