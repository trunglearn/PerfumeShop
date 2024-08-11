import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { SortOrder } from '../../../types';
import { db } from '../../../lib/db';
import { PAGE_SIZE, SALT } from '../../../constant';

type UserStatus = 'NEWLY_REGISTER' | 'NEWLY_BOUGHT' | 'BANNED';

export const getCustomerCms = async (req: Request, res: Response) => {
    const { currentPage, pageSize, search, order, orderName, status } =
        req.query;

    try {
        let orderBy:
            | Record<string, SortOrder | Record<string, SortOrder>>
            | undefined;

        if (orderName && order) {
            orderBy = {
                [String(orderName)]: order as SortOrder,
            };
        }

        const whereClause: Prisma.UserWhereInput = {
            role: 'USER',
            isVerified: true,
            status: (status as UserStatus) || undefined,
            OR: [
                {
                    name: {
                        contains: String(search || ''),
                    },
                },
                {
                    email: {
                        contains: String(search || ''),
                    },
                },
                {
                    phone: {
                        contains: String(search || ''),
                    },
                },
            ],
        };

        const total = await db.user.count({
            where: {
                ...whereClause,
            },
        });

        const orderList = await db.user.findMany({
            skip:
                (Number(currentPage ?? 1) - 1) * Number(pageSize ?? PAGE_SIZE),
            take: Number(pageSize ?? PAGE_SIZE),
            where: { ...whereClause },
            select: {
                id: true,
                name: true,
                email: true,
                address: true,
                phone: true,
                dob: true,
                gender: true,
                image: true,
                status: true,
            },
            orderBy: orderBy ?? { createdAt: 'desc' },
        });

        return res.status(200).json({
            isOk: true,
            data: orderList,
            pagination: { total },
            message: 'Get order list successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getCustomerById = async (req: Request, res: Response) => {
    const { customerId } = req.params;
    try {
        const customer = await db.user.findUnique({
            where: {
                id: customerId,
            },
            select: {
                id: true,
                email: true,
                address: true,
                gender: true,
                name: true,
                status: true,
                phone: true,
            },
        });
        return res.status(200).json({
            isOk: true,
            data: customer,
            message: 'Get customer successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const createNewCustomer = async (req: Request, res: Response) => {
    const { password, ...rest } = req.body;
    try {
        const customer = await db.user.create({
            data: {
                role: 'USER',
                isVerified: true,
                hashedPassword: hashSync(password, SALT),
                ...rest,
            },
        });
        return res.status(201).json({
            isOk: true,
            data: customer,
            message: 'Create customer successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    const { customerId } = req.params;
    try {
        const customer = await db.user.update({
            where: {
                id: customerId,
            },
            data: {
                ...req.body,
            },
        });
        return res.status(200).json({
            isOk: true,
            data: customer,
            message: 'Update customer successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};
