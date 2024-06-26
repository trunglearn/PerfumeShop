import { Request, Response } from 'express';
import { db } from '../../../lib/db';

export const getListCategory = async (req: Request, res: Response) => {
    const { search } = req.query;

    try {
        const listCategory = await db.category.findMany({
            where: {
                name: {
                    contains: search ? String(search) : undefined,
                },
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return res.status(201).json({
            isOk: true,
            data: listCategory,
            message: 'Get list category successfully!',
            params: search,
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const category = await db.category.findUnique({
            where: {
                id,
            },
        });

        return res.status(201).json({
            isOk: true,
            data: category,
            message: 'Get category successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};
