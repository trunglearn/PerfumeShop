export type Cart = {
    id?: string | null;
    userId?: string | null;
    productId?: string | null;
    quantity?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    user?: User | null;
    product?: Product | null;
};

export type User = {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    gender?: string | null;
    dob?: string | null;
    phone?: string | null;
    status?: string | null;
    address?: string | null;
};

export type Brand = {
    id?: string | null | null;
    name?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export type Category = {
    id?: string | null;
    name?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export type ProductImage = {
    id?: string | null;
    url?: string | null;
};

export type Product = {
    id?: string | null;
    name?: string | null;
    brandId?: string | null;
    categoryId?: string | null;
    original_price?: number | null;
    discount_price?: number | null;
    quantity?: number | null;
    sold_quantity?: number | null;
    description?: string | null;
    size?: number | null;
    category?: Category | null;
    thumbnail?: string | null;
    rating?: number | null;
    isShow?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    brand?: Brand | null;
    product_image?: ProductImage[] | null;
};

export type ResponseProductById = {
    isOk?: boolean | null;
    data?: Product | null;
    message?: string | null;
};
