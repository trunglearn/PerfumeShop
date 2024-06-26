export type ProductFeatured = {
    id: string | null;
    thumbnail: string | null;
    name: string | null;
    description: string | null;
    original_price: number | null;
    discount_price: number | null;
};

export type Brand = {
    id?: string | null | null;
    name?: string | null;
};

export type Category = {
    id?: string | null;
    name?: string | null;
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
