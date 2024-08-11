import { Request, Response } from 'express';
import { db } from '../../../lib/db';
import { TAKE_HOT_SEARCH_CLIENT_DEFAULT } from '../../../constant';

export const getListProductSelect = async (req: Request, res: Response) => {
    try {
        const listProduct = await db.product.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return res.status(200).json({
            isOk: true,
            data: listProduct,
            message: 'Get list product successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getListProductFeatured = async (req: Request, res: Response) => {
    try {
        const listProduct = await db.product.findMany({
            where: {
                isShow: true,
                isFeatured: true,
            },
            select: {
                id: true,
                name: true,
                thumbnail: true,
                description: true,
                original_price: true,
                discount_price: true,
                briefInfo: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return res.status(200).json({
            isOk: true,
            data: listProduct,
            message: 'Get list product featured successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

type ProductConditions = {
    categoryId?: string;
    name?: {
        contains: string;
    };
    brandId?: {
        in: string[];
    };
    isShow?: boolean;
};

export const searchProducts = async (req: Request, res: Response) => {
    const { categoryId, search, sortBy, sortOrder, brandIds } = req.query;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize
        ? parseInt(req.query.pageSize as string, 10)
        : 4;

    try {
        // Build search conditions
        const conditions: ProductConditions = { isShow: true };
        if (categoryId) {
            conditions.categoryId = String(categoryId);
        }
        if (search) {
            conditions.name = {
                contains: String(search),
            };
        }
        if (brandIds) {
            const brandIdsArray = Array.isArray(brandIds)
                ? (brandIds as string[])
                : [String(brandIds)];
            conditions.brandId = { in: brandIdsArray };
        }

        // Fetch products without sorting
        const products = await db.product.findMany({
            where: conditions,
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                name: true,
                discount_price: true,
                original_price: true,
                quantity: true,
                description: true,
                thumbnail: true,
                updatedAt: true,
                briefInfo: true,
            },
        });

        // Manual sorting
        if (sortBy) {
            if (sortBy === 'discount_price') {
                products.sort((a, b) => {
                    const priceA = a.discount_price ?? a.original_price;
                    const priceB = b.discount_price ?? b.original_price;
                    return sortOrder === 'desc'
                        ? priceB - priceA
                        : priceA - priceB;
                });
            } else if (sortBy === 'name' || sortBy === 'updatedAt') {
                products.sort((a, b) => {
                    if (sortOrder === 'desc') {
                        return a[sortBy] < b[sortBy] ? 1 : -1;
                    }
                    return a[sortBy] > b[sortBy] ? 1 : -1;
                });
            }
        }

        // Count total products matching search conditions
        const totalProducts = await db.product.count({
            where: conditions,
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / pageSize);

        return res.status(200).json({
            isOk: true,
            data: products,
            total: totalProducts,
            currentPage: page,
            totalPages,
            message: 'Search products successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getLatestProducts = async (req: Request, res: Response) => {
    const { limit } = req.query;
    const productLimit = limit ? parseInt(limit as string, 10) : 4; // Default to 4 if no limit is provided

    try {
        const latestProducts = await db.product.findMany({
            where: {
                isShow: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
            take: productLimit,
            select: {
                id: true,
                name: true,
                discount_price: true,
                original_price: true,
                description: true,
                thumbnail: true,
                updatedAt: true,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: latestProducts,
            message: 'Get latest products successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getListHotSearchProduct = async (req: Request, res: Response) => {
    const { search } = req.query;

    try {
        const listProduct = await db.product.findMany({
            where: {
                name: {
                    contains: search ? String(search) : undefined,
                },
                isShow: true,
            },
            select: {
                id: true,
                name: true,
                thumbnail: true,
                original_price: true,
                discount_price: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
            take: TAKE_HOT_SEARCH_CLIENT_DEFAULT,
        });

        return res.status(200).json({
            isOk: true,
            data: listProduct,
            message: 'Get list product successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getProductPublicInfoById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const product = await db.product.findUnique({
            where: {
                id,
                isShow: true,
            },
            select: {
                id: true,
                brand: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                original_price: true,
                discount_price: true,
                rating: true,
                product_image: {
                    select: {
                        id: true,
                        url: true,
                    },
                },
                name: true,
                quantity: true,
                size: true,
                sold_quantity: true,
                description: true,
                thumbnail: true,
            },
        });

        if (!product) {
            return res.status(400).json({
                isOk: false,
                data: null,
                message: 'This product does not exist!',
            });
        }

        return res.status(200).json({
            isOk: true,
            data: product,
            message: 'Get product successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getListProductCart = async (req: Request, res: Response) => {
    const { listProductId } = req.query;

    if (!Array.isArray(listProductId) || listProductId.length === 0) {
        return res.status(200).json({
            isOk: true,
            data: [],
        });
    }

    try {
        const products = await db.product.findMany({
            where: {
                id: {
                    in: listProductId as string[],
                },
            },
            include: {
                category: true,
                brand: true,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: products,
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getListProduct = async (req: Request, res: Response) => {
    try {
        const listProduct = await db.product.findMany({});

        return res.status(200).json({
            isOk: true,
            data: listProduct,
            message: 'Get list product successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};
