import { Request, Response } from 'express';
import { db } from '../../../lib/db';
import { TAKE_LATEST_CLIENT_DEFAULT } from '../../../constant';

export const getListPost = async (req: Request, res: Response) => {
    const { search } = req.query;

    try {
        const listPost = await db.post.findMany({
            where: {
                title: {
                    contains: String(search ?? ''),
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                category: {
                    select: {
                        name: true,
                    },
                },
                thumbnail: true,
                isShow: true,
            },
            orderBy: {
                title: 'asc',
            },
        });

        return res.status(201).json({
            isOk: true,
            data: listPost,
            message: 'Get list post successfully!',
            params: search,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const getPostById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const post = await db.post.findUnique({
            where: {
                id,
            },
            include: {
                user: {
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

        return res.status(201).json({
            isOk: true,
            data: post,
            message: 'Get post successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getListLatestPost = async (req: Request, res: Response) => {
    try {
        const listPost = await db.post.findMany({
            take: TAKE_LATEST_CLIENT_DEFAULT,
            where: {
                isShow: true,
            },
            select: {
                id: true,
                title: true,
                briefInfo: true,
                thumbnail: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return res.status(201).json({
            isOk: true,
            data: listPost,
            message: 'Get list post successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const getListFeaturedPost = async (req: Request, res: Response) => {
    try {
        const listPost = await db.post.findMany({
            where: {
                isShow: true,
                isFeatured: true,
            },
            select: {
                id: true,
                title: true,
                briefInfo: true,
                thumbnail: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return res.status(201).json({
            isOk: true,
            data: listPost,
            message: 'Get list post successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

type PostConditions = {
    categoryId?: string;
    title?: {
        contains: string;
    };
    isShow?: boolean;
};

type SortCondition = {
    [key: string]: 'asc' | 'desc';
};

export const searchPosts = async (req: Request, res: Response) => {
    const { categoryId, search, sortBy, sortOrder } = req.query;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize
        ? parseInt(req.query.pageSize as string, 10)
        : 4;

    try {
        // Xây dựng điều kiện tìm kiếm
        const conditions: PostConditions = { isShow: true };
        if (categoryId) {
            conditions.categoryId = String(categoryId);
        }
        if (search) {
            conditions.title = {
                contains: String(search),
            };
        }

        // Xây dựng điều kiện sắp xếp
        const validSortFields = ['updatedAt'];
        const orderBy: SortCondition[] = [];
        if (sortBy && validSortFields.includes(sortBy as string)) {
            const sortCondition: SortCondition = {};
            sortCondition[sortBy as string] =
                sortOrder === 'desc' ? 'desc' : 'asc';
            orderBy.push(sortCondition);
        }

        // Tính toán phân trang
        const skip = (page - 1) * pageSize;

        // Đếm tổng số bài đăng thỏa mãn điều kiện tìm kiếm
        const totalPosts = await db.post.count({
            where: conditions,
        });

        // Truy vấn cơ sở dữ liệu với các điều kiện và phân trang
        const posts = await db.post.findMany({
            where: conditions,
            orderBy: orderBy.length ? orderBy : undefined,
            skip,
            take: pageSize,
            select: {
                id: true,
                title: true,
                briefInfo: true,
                thumbnail: true,
                updatedAt: true,
            },
        });

        // Tính tổng số trang
        const totalPages = Math.ceil(totalPosts / pageSize);

        return res.status(200).json({
            isOk: true,
            data: posts,
            total: totalPosts,
            currentPage: page,
            totalPages,
            message: 'Search posts successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const getPublicPostById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const post = await db.post.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                title: true,
                description: true,
                briefInfo: true,
                thumbnail: true,
                isShow: true,
                createdAt: true,
                updatedAt: true,
                user: {
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

        if (!post) {
            return res.status(404).json({
                isOk: false,
                message: 'Post not found!',
            });
        }

        if (!post.isShow) {
            return res.status(403).json({
                isOk: false,
                message: 'Post is not publicly available!',
            });
        }

        return res.status(200).json({
            isOk: true,
            data: post,
            message: 'Get post successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};
