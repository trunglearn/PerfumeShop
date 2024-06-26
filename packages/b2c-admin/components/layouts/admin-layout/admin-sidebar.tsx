import React from 'react';

import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import Link from 'next/link';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
        key: 'dashboard',
        label: <Link href="/marketer/dashboard">Dashboard</Link>,
    },
    {
        key: 'user',
        label: <Link href="/admin/user">User</Link>,
    },
    {
        key: 'revenue',
        label: <Link href="/marketer/slider">Revenue</Link>,
    },
    {
        key: 'order',
        label: <Link href="/marketer/customer">Order</Link>,
    },
    {
        key: 'feedback',
        label: <Link href="/marketer/feedback">Feedback</Link>,
    },
];

const AdminSidebar = () => {
    return (
        <Menu
            items={items}
            mode="inline"
            style={{ width: 256, height: 'calc(100vh - 76px)' }}
        />
    );
};

export default AdminSidebar;
