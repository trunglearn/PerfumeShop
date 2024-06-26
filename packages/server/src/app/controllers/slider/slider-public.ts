import { Request, Response } from 'express';
import { db } from '../../../lib/db';

export const getListSliderClient = async (req: Request, res: Response) => {
    try {
        const slider = await db.slider.findMany({
            where: {
                isShow: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
            select: {
                id: true,
                title: true,
                note: true,
                image: true,
                backlink: true,
                backgroundSliderColor: true,
                noteTextColor: true,
                titleTextColor: true,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: slider,
            message: 'Get list slider client successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};
