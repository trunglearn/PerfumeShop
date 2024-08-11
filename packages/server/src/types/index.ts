export type TokenDecoded = {
    id: string;
    email: string;
    name: string;
    iat: number;
    exp: number;
};

export type SortOrder = 'desc' | 'asc';
