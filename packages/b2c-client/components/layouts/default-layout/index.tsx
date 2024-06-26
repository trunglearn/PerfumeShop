import React from 'react';
import Header from '~/components/layouts/default-layout/header';
import MainSider from './main-sider';
import Footer from '../footer';

type Props = {
    children: React.ReactNode;
};

export const DefaultLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="min-w-[1200px]">
            <div className="border-b-2">
                <Header />
                <MainSider />
            </div>
            <div>{children}</div>
            <div className="mt-10">
                <Footer />
            </div>
        </div>
    );
};
