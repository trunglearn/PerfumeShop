import { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import { TokenDecoded } from 'types';
import { getToken } from '../../../lib/utils';
import { db } from '../../../lib/db';

type CreateCartData = {
    productId: string;
    quantity: number;
};

type CartItem = {
    id: string;
    quantity: number;
    userId: string;
    productId: string;
    createdAt: Date;
    updatedAt: Date;
};

export const getListCart = async (req: Request, res: Response) => {
    const accessToken = getToken(req);
    const tokenDecoded = (await jwtDecode(accessToken)) as TokenDecoded;

    try {
        const listCart = await db.cart.findMany({
            where: {
                userId: tokenDecoded.id,
            },
            select: {
                id: true,
                userId: true,
                quantity: true,
                product: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return res.status(200).json({
            isOk: true,
            data: listCart,
            message: 'Get list cart successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const getContactUser = async (req: Request, res: Response) => {
    const accessToken = getToken(req);
    const tokenDecoded = (await jwtDecode(accessToken)) as TokenDecoded;

    try {
        const user = await db.user.findUnique({
            where: {
                id: tokenDecoded.id,
            },
        });
        return res.status(200).json({
            isOk: true,
            data: user,
            message: 'Get user  successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};
export const addToCart = async (req: Request, res: Response) => {
    const { productId, quantity }: CreateCartData = req.body;
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    try {
        const decodedToken = jwtDecode<TokenDecoded>(accessToken);
        const userId = decodedToken.id;

        // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
        const existingCartItem = await db.cart.findFirst({
            where: {
                userId,
                productId,
            },
        });

        if (existingCartItem) {
            // Nếu sản phẩm đã tồn tại, cập nhật số lượng
            const updatedCartItem: CartItem = await db.cart.update({
                where: {
                    id: existingCartItem.id,
                },
                data: {
                    quantity: existingCartItem.quantity + quantity,
                },
            });

            return res.status(200).json({
                isOk: true,
                data: updatedCartItem,
                message: 'Product quantity updated in cart successfully!',
            });
        }

        // Nếu sản phẩm chưa tồn tại, thêm sản phẩm mới vào giỏ hàng
        const newCartItem: CartItem = await db.cart.create({
            data: {
                userId,
                productId,
                quantity,
            },
        });

        return res.status(201).json({
            isOk: true,
            data: newCartItem,
            message: 'Product added to cart successfully!',
        });
    } catch (error) {
        return res
            .status(500)
            .json({ error: 'Internal Server Error', details: error });
    }
};

export const deleteCartProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const cart = await db.cart.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: cart,
            message: 'Delete cart product successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updateQuantity = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        const cart = await db.cart.update({
            where: {
                id,
            },
            data: {
                quantity,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: cart,
            message: 'Change quantity successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const getListCartLatest = async (req: Request, res: Response) => {
    const accessToken = getToken(req);
    const tokenDecoded = (await jwtDecode(accessToken)) as TokenDecoded;

    try {
        const total = await db.cart.count({
            where: {
                userId: tokenDecoded.id,
            },
        });
        const listCart = await db.cart.findMany({
            take: 5,
            where: {
                userId: tokenDecoded.id,
            },
            select: {
                id: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        thumbnail: true,
                        original_price: true,
                        discount_price: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return res.status(200).json({
            isOk: true,
            data: listCart,
            pagination: {
                total,
            },
            message: 'Get list cart successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};
