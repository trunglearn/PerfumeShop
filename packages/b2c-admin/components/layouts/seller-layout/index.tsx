import React from 'react';
import Header from '../user-menu';
import SellerSidebar from './seller-sidebar';

type Props = {
    children: React.ReactNode;
};

const SellerLayout = ({ children }: Props) => {
    return (
        <div className="min-w-[1280px]">
            <Header title="Seller" />
            <div className="flex h-full">
                <SellerSidebar />
                <div className="max-h-[calc(100vh_-_76px)] flex-1 overflow-auto p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SellerLayout;
