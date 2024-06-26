import React from 'react';
import CartDetails from '~/components/cart-details';
import LatestProductList from '~/components/common/latest-product';

const CartDetailsPage = () => {
    return (
        <div className="mt-20 flex px-10">
            <div className="sticky top-10 hidden h-[90vh] w-[350px] min-w-[350px] xl:block">
                <LatestProductList />
            </div>
            <div className="flex-1">
                <CartDetails />
            </div>
        </div>
    );
};

export default CartDetailsPage;
