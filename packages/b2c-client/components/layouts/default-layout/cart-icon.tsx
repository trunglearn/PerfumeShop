import { ShoppingCartOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import React from 'react';
import { Badge } from 'antd';
import { useAuth } from '~/hooks/useAuth';
import CartPopover from './cart-popover';
import { useCartQuery } from '~/hooks/useCartQuery';
import useCartStore from '~/hooks/useCartStore';

const CartIcon = () => {
    const router = useRouter();
    const auth = useAuth();

    const { data: cartQueryData } = useCartQuery();

    const { data: cartStoreData } = useCartStore();

    return (
        <div>
            <CartPopover
                data={auth ? cartQueryData?.data : []}
                total={
                    auth
                        ? cartQueryData?.pagination?.total
                        : cartStoreData?.length
                }
            >
                <Badge
                    count={
                        auth
                            ? cartQueryData?.pagination?.total
                            : cartStoreData?.length
                    }
                >
                    <ShoppingCartOutlined
                        className="cursor-pointer text-3xl text-slate-500"
                        onClick={() => router.push('/cart-details')}
                    />
                </Badge>
            </CartPopover>
        </div>
    );
};

export default CartIcon;
