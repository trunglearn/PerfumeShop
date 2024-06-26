import { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import { TokenDecoded } from '../../../types';
import { getToken } from '../../../lib/utils';
import { PAGE_SIZE } from '../../../constant';
import { db } from '../../../lib/db';

type PostFilter = {
    title?: string;
    isShow?: boolean;
    categoryId?: string;
    userId?: string;
    isFeatured?: boolean;
};

type SortOrder = 'desc' | 'asc';

export const getListPostManage = async (req: Request, res: Response) => {
    const {
        search,
        pageSize,
        currentPage,
        categoryId,
        userId,
        title,
        isShow,
        isFeatured,
        orderName,
        order,
    } = req.query;

    const pagination = {
        skip: (Number(currentPage ?? 1) - 1) * Number(pageSize ?? PAGE_SIZE),
        take: Number(pageSize ?? PAGE_SIZE),
    };

    try {
        const whereClause: PostFilter = {};

        let orderBy:
            | Record<string, SortOrder | Record<string, SortOrder>>
            | undefined;

        if (orderName && order) {
            if (orderName === 'category' || orderName === 'user') {
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

        if (categoryId) {
            whereClause.categoryId = String(categoryId);
        }
        if (title) {
            whereClause.title = String(title);
        }
        if (userId) {
            whereClause.userId = String(userId);
        }
        if (isShow) {
            whereClause.isShow = isShow === 'true';
        }
        if (isFeatured) {
            whereClause.isFeatured = isFeatured === 'true';
        }

        const select = {
            id: true,
            title: true,
            category: {
                select: {
                    name: true,
                },
            },
            user: {
                select: {
                    name: true,
                },
            },
            createdAt: true,
            updatedAt: true,
            isShow: true,
            thumbnail: true,
            description: true,
            isFeatured: true,
        };

        const total = await db.post.count({
            where: {
                title: {
                    contains: String(search || ''),
                },
                ...whereClause,
            },
        });

        const listPost = await db.post.findMany({
            ...pagination,
            where: {
                title: {
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
            data: listPost,
            message: 'Get list post successfully!',
            pagination: {
                total,
            },
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const createPost = async (req: Request, res: Response) => {
    const {
        title,
        description,
        categoryId,
        thumbnail,
        isShow,
        briefInfo,
        isFeatured,
    } = req.body;
    const accessToken = await getToken(req);
    const tokenDecoded = (await jwtDecode(accessToken)) as TokenDecoded;
    try {
        const post = await db.post.create({
            data: {
                title,
                description,
                categoryId,
                thumbnail,
                isShow,
                isFeatured,
                briefInfo,
                userId: tokenDecoded.id,
            },
        });

        return res.status(201).json({
            isOk: true,
            data: post,
            message: 'Create new post successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const updatePost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        title,
        description,
        categoryId,
        thumbnail,
        isShow,
        briefInfo,
        isFeatured,
    } = req.body;

    try {
        const post = await db.post.update({
            where: {
                id,
            },
            data: {
                title,
                description,
                categoryId,
                thumbnail,
                isShow,
                isFeatured,
                briefInfo,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: post,
            message: 'Update post successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const deletePost = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const post = await db.post.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: post,
            message: 'Delete post successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updatePostStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isShow } = req.body;

    try {
        const post = await db.post.update({
            where: {
                id,
            },
            data: {
                isShow,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: post,
            message: 'Change post status successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updatePostFeatured = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isFeatured } = req.body;

    try {
        const post = await db.post.update({
            where: {
                id,
            },
            data: {
                isFeatured,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: post,
            message: 'Change post featured successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getListMaketer = async (req: Request, res: Response) => {
    try {
        const listMaketers = await db.user.findMany({
            where: {
                role: 'MARKETER',
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
            data: listMaketers,
            message: 'Get list marketers successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};
