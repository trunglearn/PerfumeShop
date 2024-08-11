import { User } from 'common/types/customer';

export type Order = {
    id: string;
    createdAt: Date;
    name: string;
    orderDetail: OrderDetail[];
    totalAmount: number;
    status: string;
    notes: null;
    seller: Seller;
    phone: string;
    gender: string;
    address: string;
    email: string;
    user: User | null;
    saleNote: string;
};

export type OrderDetail = {
    id: string;
    productId: string;
    productName: string;
    thumbnail: string;
    quantity: number;
    originalPrice: number;
    discountPrice: null;
    size: number;
    category: string;
    totalPrice: number;
};

export type Seller = {
    id: string;
    name: string;
    email: string;
    image: string;
    hashedPassword: string;
    role: string;
    gender: null;
    dob: null;
    phone: string;
    address: null;
    isVerified: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
};
