import React, { useMemo } from 'react';

import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
        key: 'dashboard',
        label: <Link href="/seller/dashboard">Dashboard</Link>,
    },
    {
        key: 'order',
        label: <Link href="/seller/order">Order</Link>,
    },
];

const SellerSidebar = () => {
    const router = useRouter();

    const activeKey = useMemo(() => {
        if (router.pathname.startsWith('/seller/order')) {
            return ['order'];
        }
        if (router.pathname.startsWith('/seller/dashboard')) {
            return ['dashboard'];
        }
        return undefined;
    }, [router.pathname]);

    return (
        <Menu
            items={items}
            mode="inline"
            selectedKeys={activeKey}
            style={{ width: 200, height: 'calc(100vh - 76px)' }}
        />
    );
};

export default SellerSidebar;
