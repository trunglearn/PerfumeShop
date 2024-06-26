import { Button } from 'antd';
import Link from 'next/link';
import React from 'react';
import { NextPageWithLayout } from './_app';

const Page404: NextPageWithLayout = () => {
    return (
        <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-5">
            <div className="text-8xl font-extrabold text-slate-400">404</div>
            <div className="text-2xl font-medium">
                Trang bạn tìm kiếm không tồn tại.
            </div>
            <div>
                <Link href="/">
                    <Button size="large" type="primary">
                        Trở về trang chủ
                    </Button>
                </Link>
            </div>
        </div>
    );
};

Page404.getLayout = (page) => page;
Page404.title = '404';

export default Page404;
