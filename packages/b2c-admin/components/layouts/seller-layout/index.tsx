import React from 'react';
import Header from '../user-menu';

type Props = {
    children: React.ReactNode;
};

const SellerLayout = ({ children }: Props) => {
    return (
        <main>
            <Header title="Seller" />
            {children}
        </main>
    );
};

export default SellerLayout;
