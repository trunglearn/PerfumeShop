import { TokenDecoded } from 'types';
import { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import { SortOrder } from '../../../types/index';
import { getToken } from '../../../lib/utils';
import { db } from '../../../lib/db';
import { PAGE_SIZE } from '../../../constant';
import { getNextDate } from '../../../lib/getNextDate';

type OrderStatus =
    | 'PAYMENT_PENDING'
    | 'PAID'
    | 'PENDING'
    | 'CONFIRMED'
    | 'DELIVERING'
    | 'DELIVERED'
    | 'CANCELED';

export const getListOrderCms = async (req: Request, res: Response) => {
    const {
        currentPage,
        pageSize,
        order,
        orderName,
        orderId,
        customer,
        startDate,
        endDate,
        assignee,
        meMode,
        status,
    } = req.query;

    try {
        const accessToken = getToken(req);
        const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;

        let orderBy:
            | Record<string, SortOrder | Record<string, SortOrder>>
            | undefined;

        if (orderName && order) {
            orderBy = {
                [String(orderName)]: order as SortOrder,
            };
        }

        const whereClause = {
            id: {
                contains: orderId as string,
            },

            name: {
                contains: customer as string,
            },

            sellerId: assignee as string,
            createdAt: {
                gte: startDate ? new Date(startDate as string) : undefined,
                lt: endDate ? getNextDate(endDate as string) : undefined,
            },
            status: status ? (status as OrderStatus) : undefined,
        };

        if (meMode === 'true') {
            whereClause.sellerId = tokenDecoded?.id;
        }

        const total = await db.order.count({
            where: { ...whereClause },
        });

        const orderList = await db.order.findMany({
            skip:
                (Number(currentPage ?? 1) - 1) * Number(pageSize ?? PAGE_SIZE),
            take: Number(pageSize ?? PAGE_SIZE),
            where: { ...whereClause },
            select: {
                id: true,
                name: true,
                totalAmount: true,
                status: true,
                paymentMethod: true,
                createdAt: true,
                seller: {
                    select: {
                        id: true,
                        role: true,
                        name: true,
                        image: true,
                        email: true,
                        phone: true,
                    },
                },
                orderDetail: {
                    take: 1,
                },
                _count: true,
            },
            orderBy: orderBy ?? { createdAt: 'desc' },
        });

        return res.status(200).json({
            isOk: true,
            data: orderList,
            pagination: {
                total,
            },
            message: 'Get order list successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getOrderDetailCms = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const orderDetail = await db.order.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                createdAt: true,
                name: true,
                orderDetail: {
                    select: {
                        id: true,
                        productId: true,
                        productName: true,
                        thumbnail: true,
                        quantity: true,
                        originalPrice: true,
                        discountPrice: true,
                        size: true,
                        category: true,
                        totalPrice: true,
                    },
                },
                totalAmount: true,
                status: true,
                notes: true,
                seller: true,
                phone: true,
                gender: true,
                address: true,
                email: true,
                saleNote: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        address: true,
                        phone: true,
                        dob: true,
                        gender: true,
                    },
                },
            },
        });

        if (!orderDetail) {
            return res.status(400).json({
                isOk: false,
                message: 'Order not found!',
            });
        }

        return res.status(200).json({
            isOk: true,
            data: orderDetail,
            message: 'Get order detail successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updateAssignee = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { assigneeId } = req.body;

    try {
        const accessToken = getToken(req);

        const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;

        const manager = await db.user.findFirst({
            where: {
                id: tokenDecoded.id,
            },
        });

        const order = await db.order.update({
            where: {
                id,
            },
            data: {
                sellerId: assigneeId,
            },
        });

        const seller = await db.user.findFirst({
            where: { id: assigneeId },
        });

        await db.auditLog.create({
            data: {
                userId: manager.id,
                action: 'UPDATE',
                orderId: order.id,
                title: `assigned to: ${seller.name}`,
                userImage: manager.image ?? '',
                userName: manager.name ?? '',
                userEmail: manager.email,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: order,
            message: 'Update assignee successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const accessToken = getToken(req);

        const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;

        const seller = await db.user.findFirst({
            where: {
                id: tokenDecoded.id,
            },
        });

        const prevOrder = await db.order.findFirst({
            where: { id },
        });

        const order = await db.order.update({
            where: {
                id,
            },
            data: {
                status,
            },
            include: {
                orderDetail: true,
            },
        });

        if (status === 'CANCELED') {
            order.orderDetail.map(async (detail) => {
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
        }

        await db.auditLog.create({
            data: {
                userId: seller.id,
                action: 'UPDATE',
                orderId: order.id,
                title: `changed status from ${prevOrder.status} to ${order.status}`,
                userImage: seller.image ?? '',
                userName: seller.name ?? '',
                userEmail: seller.email,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: order,
            message: 'Update order status successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updateSaleNote = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { saleNote } = req.body;

    try {
        const accessToken = getToken(req);

        const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;

        const seller = await db.user.findFirst({
            where: {
                id: tokenDecoded.id,
            },
        });

        const prevOrder = await db.order.findFirst({
            where: { id },
        });

        const order = await db.order.update({
            where: {
                id,
            },
            data: {
                saleNote,
            },
        });

        if (!prevOrder.saleNote) {
            await db.auditLog.create({
                data: {
                    userId: seller.id,
                    action: 'CREATE',
                    orderId: order.id,
                    title: 'created sale note',
                    userImage: seller.image ?? '',
                    userName: seller.name ?? '',
                    userEmail: seller.email,
                },
            });
        } else {
            await db.auditLog.create({
                data: {
                    userId: seller.id,
                    action: 'UPDATE',
                    orderId: order.id,
                    title: 'updated sale note',
                    userImage: seller.image ?? '',
                    userName: seller.name ?? '',
                    userEmail: seller.email,
                },
            });
        }

        return res.status(200).json({
            isOk: true,
            data: order,
            message: 'Update order sale note status successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getOrderAuditLog = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const auditLog = await db.auditLog.findMany({
            where: {
                orderId: id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return res.status(200).json({
            isOk: true,
            data: auditLog,
            message: 'Get order audit log successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};
