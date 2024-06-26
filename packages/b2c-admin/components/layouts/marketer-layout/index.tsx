import React from 'react';
import Header from '../user-menu';
import MarketerSidebar from './marketer-sidebar';

type Props = {
    children: React.ReactNode;
};

const MarketerLayout = ({ children }: Props) => {
    return (
        <div className="h-full min-w-[1280px]">
            <Header title="Marketer" />
            <main className="flex h-full">
                <MarketerSidebar />
                <section className="max-h-[calc(100vh_-_76px)] flex-1 overflow-auto p-4">
                    {children}
                </section>
            </main>
        </div>
    );
};

export default MarketerLayout;
