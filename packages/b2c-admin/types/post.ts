export type Post = {
    id?: string | null;
    title?: string | null;
    description?: string | null;
    briefInfo?: string | null;
    userId?: string | null;
    thumbnail?: string | null;
    isShow?: boolean | null;
    isFeatured?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    category?: string | null;
    user?: User | null;
};

export type ResponsePostById = {
    isOk?: boolean | null;
    data?: Post | null;
    message?: string | null;
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
