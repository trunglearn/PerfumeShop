import React from 'react';
import CartContact from '~/components/cart-contact';
import LatestProductList from '~/components/common/latest-product';

const CartContactPage = () => {
    return (
        <div className="mt-20 flex px-10">
            <div className="sticky top-10 hidden h-[90vh] w-[350px] min-w-[350px] xl:block">
                <LatestProductList />
            </div>
            <div className="flex-1">
                <CartContact />
            </div>
        </div>
    );
};

export default CartContactPage;
