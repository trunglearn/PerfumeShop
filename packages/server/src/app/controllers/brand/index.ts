import { Request, Response } from 'express';
import { db } from '../../../lib/db';

export const getListBrand = async (req: Request, res: Response) => {
    const { search } = req.query;

    try {
        const listBrand = await db.brand.findMany({
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
            data: listBrand,
            message: 'Get list brand successfully!',
            params: search,
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getBrandById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const brand = await db.brand.findUnique({
            where: {
                id,
            },
        });

        return res.status(201).json({
            isOk: true,
            data: brand,
            message: 'Get brand successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};
