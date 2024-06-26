import { ORDER_STATUS } from '@prisma/client';

export type OrderDetail = {
    id: string | null;
    quantity: number | null;
    originalPrice: number | null;
    discountPrice: number | null;
    totalPrice: number | null;

    thumbnail: string | null;
    brand: string | null;
    size: string | null;
    category: string | null;

    productId: string | null;
    productName: string | null;

    orderId: string | null;
};

export type Order = {
    id: string | null;
    status: ORDER_STATUS;
    totalAmount: string | null;
    paymentMethod: string | null;
    address: string | null;
    name: string | null;
    gender: string | null;
    email: string | null;
    phoneNumber: string | null;
    notes: string | null;
    createdAt: string | null;
    orderDetail: OrderDetail[] | null;
    count: number | null;
};

export const orderStatus = {
    PENDING: 'Đang xử lí',
    CONFIRMED: 'Đã xác nhận',
    DELIVERING: 'Đang vận chuyển',
    DELIVERED: 'Giao hàng thành công',
    CANCELED: 'Đã huỷ',
};

export const orderPaymentMethod = {
    BANK_TRANSFER: 'Chuyển khoản',
    CASH_ON_DELIVERY: 'Thanh toán khi nhận hàng',
};

export const genderType = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
};
