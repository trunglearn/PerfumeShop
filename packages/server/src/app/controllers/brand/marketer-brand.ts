import { Request, Response } from 'express';
import { db } from '../../../lib/db';
import { PAGE_SIZE } from '../../../constant';

type SortOrder = 'asc' | 'desc';

export const getListBrandManage = async (req: Request, res: Response) => {
    const { search, pageSize, currentPage, sortBy, sortOrder } = req.query;

    const prismaQuery = {
        skip: (Number(currentPage) - 1) * Number(pageSize || PAGE_SIZE),
        take: Number(pageSize) ?? PAGE_SIZE,
        where: {
            name: {
                contains: search ? String(search) : undefined,
            },
        },
    };

    try {
        const total = await db.brand.count({
            where: {
                name: {
                    contains: search ? String(search) : undefined,
                },
            },
        });

        let listBrand;

        switch (sortBy) {
            case 'name':
                listBrand = await db.brand.findMany({
                    ...prismaQuery,
                    orderBy: {
                        name: sortOrder ? (sortOrder as SortOrder) : 'desc',
                    },
                });
                break;
            case 'createAt':
                listBrand = await db.brand.findMany({
                    ...prismaQuery,
                    orderBy: {
                        createdAt: sortOrder
                            ? (sortOrder as SortOrder)
                            : 'desc',
                    },
                });
                break;
            case 'updateAt':
                listBrand = await db.brand.findMany({
                    ...prismaQuery,
                    orderBy: {
                        updatedAt: sortOrder
                            ? (sortOrder as SortOrder)
                            : 'desc',
                    },
                });
                break;
            default:
                listBrand = await db.brand.findMany({
                    ...prismaQuery,
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
        }

        return res.status(200).json({
            isOk: true,
            data: listBrand,
            message: 'Get list brand successfully!',
            pagination: {
                total,
            },
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const createBrand = async (req: Request, res: Response) => {
    const { name } = req.body;

    try {
        const brand = await db.brand.create({
            data: {
                name,
            },
        });

        return res.status(201).json({
            isOk: true,
            data: brand,
            message: 'Create new brand successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updateBrand = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const brand = await db.brand.update({
            where: {
                id,
            },
            data: {
                name,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: brand,
            message: 'Update brand successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const deleteBrand = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const brand = await db.brand.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: brand,
            message: 'Delete brand successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};
