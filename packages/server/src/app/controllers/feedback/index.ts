import { PAGE_SIZE } from 'common/constant';
import { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import { TokenDecoded } from 'types';

import { getToken } from '../../../lib/utils';
import { db } from '../../../lib/db';

type CreateFeedbackData = {
    productId: string;
    description?: string;
    rating?: number | null;
};

type FeedbackItem = {
    id: string;
    description?: string;
    userId: string;
    productId: string;
    rating: number | null;
    createdAt: Date;
    updatedAt: Date;
};

export const addFeedback = async (req: Request, res: Response) => {
    const { productId, description, rating }: CreateFeedbackData = req.body;
    // const accessToken = req.headers.authorization?.split(' ')[1];

    // if (!accessToken) {
    //     return res.status(401).json({ message: 'No access token provided' });
    // }

    const accessToken = getToken(req);

    if (!accessToken) {
        return res.sendStatus(401);
    }

    const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;
    try {
        // const decodedToken = jwtDecode<TokenDecoded>(accessToken);
        // const userId = decodedToken.id;

        // Thêm feedback mới
        const newFeedback: FeedbackItem = await db.feedback.create({
            data: {
                userId: tokenDecoded.id,
                productId,
                description,
                rating: rating ?? null, // Đặt giá trị mặc định là null nếu không có rating
            },
        });

        return res.status(201).json({
            isOk: true,
            data: newFeedback,
            message: 'Feedback added successfully!',
        });
    } catch (error) {
        return res
            .status(500)
            .json({ error: 'Internal Server Error', details: error });
    }
};

export const getFeedback = async (req: Request, res: Response) => {
    const { productId, rate, currentPage } = req.query;

    const pagination = {
        skip: (Number(currentPage ?? 1) - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
    };

    try {
        const total = await db.feedback.count({
            where: {
                productId: productId ? String(productId) : undefined,
                rating: rate ? Number(rate) : undefined,
            },
        });
        const listFeedback = await db.feedback.findMany({
            ...pagination,
            where: {
                productId: productId ? String(productId) : undefined,
                rating: rate ? Number(rate) : undefined,
            },
            select: {
                id: true,
                rating: true,
                description: true,
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
                image: {
                    select: {
                        id: true,
                        url: true,
                    },
                },
                userId: true,
                createdAt: true,
                productId: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return res.status(200).json({
            isOk: true,
            data: listFeedback,
            message: 'Get list feedback successfully!',
            pagination: {
                total,
            },
        });
    } catch (error) {
        return res
            .status(500)
            .json({ error: 'Internal Server Error', details: error });
    }
};
