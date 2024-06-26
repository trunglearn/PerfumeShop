import { Request, Response } from 'express';
import { db } from '../../../lib/db';
import { PAGE_SIZE } from '../../../constant';

type SortOrder = 'asc' | 'desc';

export const getListCategoryManage = async (req: Request, res: Response) => {
    const { search, pageSize, currentPage, sortBy, sortOrder } = req.query;

    const prismaQuery = {
        skip: (Number(currentPage ?? 1) - 1) * Number(pageSize ?? PAGE_SIZE),
        take: Number(pageSize ?? PAGE_SIZE),
        where: {
            name: {
                contains: search ? String(search) : undefined,
            },
        },
    };

    try {
        const total = await db.category.count({
            where: {
                name: {
                    contains: search ? String(search) : undefined,
                },
            },
        });

        const listCategory = await db.category.findMany({
            ...prismaQuery,
            orderBy: {
                [String(sortBy)]: sortOrder as SortOrder,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: listCategory,
            message: 'Get list category successfully!',
            pagination: {
                total,
            },
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const createCategory = async (req: Request, res: Response) => {
    const { name } = req.body;

    try {
        const category = await db.category.create({
            data: {
                name,
            },
        });

        return res.status(201).json({
            isOk: true,
            data: category,
            message: 'Create new category successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const category = await db.category.update({
            where: {
                id,
            },
            data: {
                name,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: category,
            message: 'Update category successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const category = await db.category.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: category,
            message: 'Delete category successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};
