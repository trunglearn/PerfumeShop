import { Request } from 'express';
import { db } from './db';

export const getToken = (req: Request) => {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
        const token: string = authorizationHeader.split(' ')[1];
        return token;
    }
    return null;
};

export const getSellerToAssignOrder = async () => {
    try {
        const sellerList = await db.user.findMany({
            where: {
                role: 'SELLER',
            },
            select: {
                id: true,
            },
        });

        const sellerOrderCount: Record<string, number> = {};

        await Promise.all(
            sellerList.map(async (seller) => {
                const pendingOrderCount = await db.order.count({
                    where: {
                        sellerId: seller.id,
                        status: {
                            in: ['PENDING', 'PAYMENT_PENDING'],
                        },
                    },
                });

                sellerOrderCount[seller.id] = pendingOrderCount;
            })
        );

        const selectedSellerId = sellerList.reduce(
            (selectedId, seller) => {
                const currentSellerCount = sellerOrderCount[seller.id];
                if (
                    currentSellerCount < sellerOrderCount[selectedId] ||
                    selectedId === null
                ) {
                    return seller.id;
                }
                return selectedId;
            },
            null as string | null
        );

        return selectedSellerId;
    } catch (error) {
        throw new Error('Unable to get seller to assign.');
    }
};
