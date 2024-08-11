import { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import { TokenDecoded } from '../../../types/index';
import { getToken } from '../../../lib/utils';
import { db } from '../../../lib/db';
import { PAGE_SIZE } from '../../../constant';

export const getListComment = async (req: Request, res: Response) => {
    const { productId, currentPage, pageSize } = req.query;

    try {
        const pagination = {
            skip:
                (Number(currentPage ?? 1) - 1) * Number(pageSize ?? PAGE_SIZE),
            take: Number(pageSize ?? PAGE_SIZE),
        };

        const listComment = await db.comment.findMany({
            ...pagination,
            where: {
                productId: productId as string,
                isShow: true,
            },
            select: {
                id: true,
                description: true,
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
                userId: true,
                createdAt: true,
                productId: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return res.status(200).json({
            isOk: true,
            data: listComment,
            message: 'Get list comment successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const createComment = async (req: Request, res: Response) => {
    const { productId, description } = req.body;

    try {
        const accessToken = await getToken(req);
        const tokenDecoded = (await jwtDecode(accessToken)) as TokenDecoded;

        const comment = await db.comment.create({
            data: {
                productId: productId as string,
                description: description as string,
                userId: tokenDecoded.id,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: comment,
            message: 'Phản hồi sản phẩm thành công!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};
