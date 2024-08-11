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
