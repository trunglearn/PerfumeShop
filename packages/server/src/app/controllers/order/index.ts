/* eslint-disable max-lines */
import { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import { ORDER_STATUS, OrderDetail, Prisma } from '@prisma/client';
import { sendBill } from '../../../lib/send-mail';
import { PAGE_SIZE } from '../../../constant';
import { db } from '../../../lib/db';
import { getSellerToAssignOrder, getToken } from '../../../lib/utils';
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
                isOk: false,
                message: 'Đơn hàng không tồn tại!',
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

export const checkAcceptRedirectDetail = async (
    req: Request,
    res: Response
) => {
    const { id } = req.params;
    const accessToken = getToken(req);

    if (!accessToken) {
        return res.sendStatus(401);
    }

    const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;

    try {
        const orderDetail = await db.order.findUnique({
            where: {
                id,
            },
            include: {
                orderDetail: true,
            },
        });

        if (orderDetail.userId !== tokenDecoded.id) {
            return res.status(403).json({
                isOk: false,
                message: 'Unauthorized to access this order!',
            });
        }

        if (!orderDetail) {
            return res.status(403).json({
                isOk: false,
                message: 'Đơn hàng không tồn tại!',
            });
        }

        return res.status(201).json({
            isOk: true,
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getOrderCompletion = async (req: Request, res: Response) => {
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
                message: 'Đơn hàng không tồn tại!',
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

    const accessToken = getToken(req);

    if (!accessToken) {
        return res.sendStatus(401);
    }

    const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;

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
                message: 'Đơn hàng không tồn tại!',
            });
        }

        if (orderDetail.userId !== tokenDecoded.id) {
            return res.status(403).json({
                isOk: false,
                message: 'Unauthorized to access this order!',
            });
        }

        const orderDeleted = await db.order.update({
            where: {
                id,
            },
            data: {
                status: 'CANCELED',
            },
        });

        orderDetail.orderDetail.map(async (detail) => {
            await db.product.update({
                where: {
                    id: detail.productId,
                },
                data: {
                    quantity: {
                        increment: detail.quantity,
                    },
                    sold_quantity: {
                        decrement: detail.quantity,
                    },
                },
            });
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
    const { name, gender, email, phone, address } = req.body;

    const accessToken = getToken(req);

    if (!accessToken) {
        return res.sendStatus(401);
    }

    const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;

    const orderExisted = await db.order.findUnique({
        where: {
            id,
        },
        select: {
            userId: true,
        },
    });

    if (tokenDecoded.id !== orderExisted.userId) {
        return res.status(403).json({
            message: 'Bạn không có quyền!',
        });
    }

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
                phone,
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

        const accessToken = getToken(req);

        if (!accessToken) {
            return res.sendStatus(401);
        }

        const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;

        if (!orderExisted) {
            return res.status(403).json({
                message: 'Đơn hàng không tìm thấy!',
            });
        }

        if (tokenDecoded.id !== orderExisted.userId) {
            return res.status(403).json({
                message: 'Bạn không có quyền!',
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

export const createOrderForUser = async (req: Request, res: Response) => {
    const {
        address,
        name,
        gender,
        email,
        phone,
        notes,
        paymentMethod,
        orderDetails,
    } = req.body;

    const accessToken = getToken(req);

    if (!accessToken) {
        return res.sendStatus(401);
    }

    const tokenDecoded = (await jwtDecode(accessToken)) as TokenDecoded;

    try {
        const sellerId = await getSellerToAssignOrder();

        const newOrder = await db.order.create({
            data: {
                userId: tokenDecoded.id,
                address,
                name,
                gender,
                email,
                phone,
                status:
                    paymentMethod === 'BANK_TRANSFER'
                        ? 'PAYMENT_PENDING'
                        : 'PENDING',
                totalAmount: orderDetails.reduce(
                    (acc: number, product: OrderDetail) =>
                        acc + product.totalPrice,
                    0
                ),
                notes,
                paymentMethod,
                sellerId,
                orderDetail: {
                    create: orderDetails.map((product: OrderDetail) => ({
                        quantity: product.quantity,
                        originalPrice: product.originalPrice,
                        discountPrice: product.discountPrice,
                        totalPrice: product.totalPrice,
                        thumbnail: product.thumbnail,
                        brand: product.brand,
                        size: product.size,
                        category: product.category,
                        productId: product.productId,
                        productName: product.productName,
                    })),
                },
            },
            include: {
                orderDetail: true,
            },
        });

        await sendBill(newOrder);

        // Cập nhật số lượng sản phẩm còn lại
        // eslint-disable-next-line no-restricted-syntax
        for (const product of orderDetails) {
            // eslint-disable-next-line no-await-in-loop
            await db.product.update({
                where: { id: product.productId },
                data: {
                    sold_quantity: { increment: product.quantity },
                    quantity: { decrement: product.quantity },
                },
            });
        }

        await db.user.update({
            where: { id: tokenDecoded.id },
            data: {
                status: 'NEWLY_BOUGHT',
            },
        });

        // Xoá bỏ sản phẩm trong cart
        await db.cart.deleteMany({
            where: {
                userId: tokenDecoded.id,
                productId: {
                    in: orderDetails.map((p: OrderDetail) => p.productId),
                },
            },
        });

        return res.status(201).json({
            isOk: true,
            data: newOrder,
            message: 'Tạo đơn hàng thành công!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const createOrderForGuest = async (req: Request, res: Response) => {
    const {
        address,
        name,
        gender,
        email,
        phone,
        notes,
        paymentMethod,
        orderDetails,
    } = req.body;

    try {
        const sellerId = await getSellerToAssignOrder();

        const newOrder = await db.order.create({
            data: {
                address,
                name,
                gender,
                email,
                phone,
                status:
                    paymentMethod === 'BANK_TRANSFER'
                        ? 'PAYMENT_PENDING'
                        : 'PENDING',
                totalAmount: orderDetails.reduce(
                    (acc: number, product: OrderDetail) =>
                        acc + product.totalPrice,
                    0
                ),
                notes,
                paymentMethod,
                sellerId,
                orderDetail: {
                    create: orderDetails.map((product: OrderDetail) => ({
                        quantity: product.quantity,
                        originalPrice: product.originalPrice,
                        discountPrice: product.discountPrice,
                        totalPrice: product.totalPrice,
                        thumbnail: product.thumbnail,
                        brand: product.brand,
                        size: product.size,
                        category: product.category,
                        productId: product.productId,
                        productName: product.productName,
                    })),
                },
            },
            include: {
                orderDetail: true,
            },
        });

        await sendBill(newOrder);

        // Cập nhật số lượng sản phẩm còn lại
        // eslint-disable-next-line no-restricted-syntax
        for (const product of orderDetails) {
            // eslint-disable-next-line no-await-in-loop
            await db.product.update({
                where: { id: product.productId },
                data: {
                    sold_quantity: { increment: product.quantity },
                    quantity: { decrement: product.quantity },
                },
            });
        }

        return res.status(201).json({
            isOk: true,
            data: newOrder,
            message: 'Tạo đơn hàng thành công!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const updateOrderStatusAfterPayment = async (
    req: Request,
    res: Response
) => {
    const { id } = req.params;

    try {
        await db.order.update({
            where: {
                id: String(id),
            },
            data: {
                status: 'PAID',
            },
        });

        return res.status(201).json({
            isOk: true,
            message: 'Cập nhật trạng thái đơn hàng thành công!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};
