/* eslint-disable max-lines */
import { Request, Response } from 'express';
import { db } from '../../../lib/db';
import { PAGE_SIZE } from '../../../constant';

type ProductFilter = {
    brandId?: string;
    categoryId?: string;
    rating?: number;
    isShow?: boolean;
};

type SortOrder = 'desc' | 'asc';

export const getListProductManage = async (req: Request, res: Response) => {
    const {
        search,
        pageSize,
        currentPage,
        brandId,
        categoryId,
        rating,
        isShow,
        orderName,
        order,
    } = req.query;

    const pagination = {
        skip: (Number(currentPage ?? 1) - 1) * Number(pageSize ?? PAGE_SIZE),
        take: Number(pageSize ?? PAGE_SIZE),
    };

    try {
        const whereClause: ProductFilter = {};

        let orderBy:
            | Record<string, SortOrder | Record<string, SortOrder>>
            | undefined;

        if (orderName && order) {
            if (orderName === 'category' || orderName === 'brand') {
                orderBy = {
                    [String(orderName)]: {
                        name: order as SortOrder,
                    },
                };
            } else {
                orderBy = {
                    [String(orderName)]: order as SortOrder,
                };
            }
        }
        if (brandId) {
            whereClause.brandId = String(brandId);
        }
        if (categoryId) {
            whereClause.categoryId = String(categoryId);
        }
        if (rating) {
            whereClause.rating = Number(rating);
        }
        if (isShow) {
            whereClause.isShow = isShow === 'true';
        }

        const select = {
            id: true,
            name: true,
            brand: {
                select: {
                    name: true,
                },
            },
            category: {
                select: { name: true },
            },
            createdAt: true,
            isShow: true,
            original_price: true,
            quantity: true,
            rating: true,
            size: true,
            sold_quantity: true,
            discount_price: true,
            thumbnail: true,
            description: true,
            isFeatured: true,
        };

        const total = await db.product.count({
            where: {
                name: {
                    contains: String(search || ''),
                },
                ...whereClause,
            },
        });

        const listProduct = await db.product.findMany({
            ...pagination,
            where: {
                name: {
                    contains: search ? String(search) : undefined,
                },
                ...whereClause,
            },
            orderBy: orderBy ?? {
                createdAt: 'desc',
            },
            select,
        });

        return res.status(200).json({
            isOk: true,
            data: listProduct,
            message: 'Get list product successfully!',
            pagination: {
                total,
            },
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const createProduct = async (req: Request, res: Response) => {
    const {
        name,
        brandId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        original_price,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        discount_price,
        quantity,
        description,
        size,
        categoryId,
        thumbnail,
        isShow,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        product_image,
        isFeatured,
    } = req.body;

    try {
        const product = await db.product.create({
            data: {
                name,
                brandId,
                original_price,
                discount_price,
                quantity,
                description,
                size,
                categoryId,
                thumbnail,
                isShow,
                isFeatured,
                product_image: {
                    createMany: {
                        data: product_image,
                    },
                },
            },
        });

        return res.status(201).json({
            isOk: true,
            data: product,
            message: 'Create new product successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        name,
        brandId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        original_price,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        discount_price,
        quantity,
        description,
        size,
        categoryId,
        thumbnail,
        isShow,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        product_image,
        isFeatured,
    } = req.body;

    try {
        await db.productImage.deleteMany({
            where: {
                productId: id,
            },
        });

        const product = await db.product.update({
            where: {
                id,
            },
            data: {
                name,
                brandId,
                original_price,
                discount_price,
                quantity,
                description,
                size,
                categoryId,
                thumbnail,
                isShow,
                isFeatured,
                product_image: {
                    createMany: {
                        data: product_image,
                    },
                },
            },
        });

        return res.status(200).json({
            isOk: true,
            data: product,
            message: 'Update new product successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const product = await db.product.findUnique({
            where: {
                id,
            },
            include: {
                product_image: {
                    select: {
                        id: true,
                        url: true,
                    },
                },
                brand: {
                    select: {
                        name: true,
                    },
                },
                category: {
                    select: {
                        name: true,
                    },
                },
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

export const deleteProductById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const product = await db.product.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: product,
            message: 'Delete product successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updateProductStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isShow } = req.body;

    try {
        const product = await db.product.update({
            where: {
                id,
            },
            data: {
                isShow,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: product,
            message: 'Change product status successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updateProductFeatured = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isFeatured } = req.body;

    try {
        const product = await db.product.update({
            where: {
                id,
            },
            data: {
                isFeatured,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: product,
            message: 'Change product featured successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};
