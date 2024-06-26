import { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import { ORDER_STATUS, Prisma } from '@prisma/client';
import { PAGE_SIZE } from '../../../constant';
import { db } from '../../../lib/db';
import { getToken } from '../../../lib/utils';
import { TokenDecoded } from '../../../types';

export const getListOrder = async (req: Request, res: Response) => {
    const { pageSize, currentPage, status, search } = req.query;

    const pagination = {
        skip: (Number(currentPage ?? 1) - 1) * Number(pageSize ?? PAGE_SIZE),
        take: Number(pageSize ?? PAGE_SIZE),
    };

    const accessToken = getToken(req);

    if (!accessToken) {
        return res.sendStatus(401);
    }

    const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;

    const whereClause: Prisma.OrderWhereInput = {
        userId: tokenDecoded.id,
        ...(status && { status: status as ORDER_STATUS }), // Search by status if provided
        AND: search
            ? [
                  {
                      OR: [
                          { id: { contains: search as string } }, // Search by order ID
                          {
                              orderDetail: {
                                  some: {
                                      productName: {
                                          contains: search as string,
                                      },
                                  },
                              },
                          },
                      ],
                  },
              ]
            : [],
    };

    try {
        const total = await db.order.count({
            where: whereClause,
        });

        let orders = await db.order.findMany({
            where: {
                ...whereClause,
            },
            select: {
                id: true,
                totalAmount: true,
                paymentMethod: true,
                status: true,
                createdAt: true,
                _count: {
                    select: { orderDetail: true },
                },
                orderDetail: {
                    orderBy: {
                        totalPrice: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            ...pagination,
        });

        orders = orders.map((order) => ({
            ...order,
            // eslint-disable-next-line no-underscore-dangle
            count: order._count.orderDetail - 1,
            _count: undefined,
        }));

        return res.status(201).json({
            isOk: true,
            data: orders,

            pagination: {
                total,
            },
            message: 'Get order successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getOrderDetail = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const orderDetail = await db.order.findUnique({
            where: {
                id,
            },
            include: {
                orderDetail: true,
            },
        });

        if (!orderDetail) {
            return res.status(403).json({
                message: 'Order information not founded!',
            });
        }

        return res.status(201).json({
            isOk: true,
            data: orderDetail,
            message: 'Get order detail successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const orderDeleted = await db.order.delete({
            where: {
                id,
            },
        });

        return res.status(201).json({
            isOk: true,
            data: orderDeleted,
            message: 'Huỷ đơn hàng thành công',
        });
    } catch (e) {
        return res.sendStatus(500);
    }
};

export const editOrderInformation = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, gender, email, phoneNumber, address } = req.body;

    try {
        const orderUpdated = await db.order.update({
            where: {
                id,
            },
            data: {
                address,
                email,
                gender,
                name,
                phoneNumber,
            },
        });

        return res.status(201).json({
            isOk: true,
            data: orderUpdated,
            message: 'Cập nhật thông tin nhận hàng thành công',
        });
    } catch (e) {
        return res.sendStatus(500);
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        quantity,
        originalPrice,
        discountPrice,
        totalPrice,
        thumbnail,
        brand,
        size,
        category,
        productId,
        productName,
    } = req.body;
    try {
        const orderExisted = await db.order.findUnique({
            where: {
                id,
            },
        });

        if (!orderExisted) {
            return res.status(403).json({
                message: 'Đơn hàng không tìm thấy!',
            });
        }

        await db.orderDetail.deleteMany({
            where: {
                orderId: id,
            },
        });

        const orderUpdated = await db.orderDetail.create({
            data: {
                orderId: id,
                quantity,
                originalPrice,
                discountPrice,
                totalPrice,
                thumbnail,
                brand,
                size,
                category,
                productId,
                productName,
            },
        });

        return res.status(201).json({
            isOk: true,
            data: orderUpdated,
            message: 'Cập nhật đơn hàng thành công',
        });
    } catch (e) {
        return res.sendStatus(500);
    }
};
