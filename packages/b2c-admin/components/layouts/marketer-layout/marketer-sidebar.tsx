import React, { useMemo } from 'react';

import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
        key: 'dashboard',
        label: <Link href="/marketer/dashboard">Dashboard</Link>,
    },
    {
        key: 'product',
        label: 'Product',
        children: [
            {
                key: 'productList',
                label: <Link href="/marketer/product">List Product</Link>,
            },
            {
                key: 'brand',
                label: <Link href="/marketer/product/brand">Brand</Link>,
            },
            {
                key: 'category',
                label: <Link href="/marketer/product/category">Category</Link>,
            },
        ],
    },
    {
        key: 'post',
        label: <Link href="/marketer/post">Post</Link>,
    },
    {
        key: 'slider',
        label: <Link href="/marketer/slider">Slider</Link>,
    },
    {
        key: 'customer',
        label: <Link href="/marketer/customer">Customer</Link>,
    },
    {
        key: 'feedback',
        label: <Link href="/marketer/feedback">Feedback</Link>,
    },
];

const MarketerSidebar = () => {
    const router = useRouter();

    const activeKey = useMemo(() => {
        if (router.pathname.startsWith('/marketer/product/brand')) {
            return ['brand'];
        }
        if (router.pathname.startsWith('/marketer/product/category')) {
            return ['category'];
        }
        if (router.pathname.startsWith('/marketer/product')) {
            return ['productList'];
        }
        if (router.pathname.startsWith('/marketer/post')) {
            return ['post'];
        }
        if (router.pathname.startsWith('/marketer/slider')) {
            return ['slider'];
        }
        if (router.pathname.startsWith('/marketer/customer')) {
            return ['customer'];
        }
        if (router.pathname.startsWith('/marketer/feedback')) {
            return ['feedback'];
        }
        if (router.pathname.startsWith('/marketer/dashboard')) {
            return ['dashboard'];
        }
        return undefined;
    }, [router.pathname]);

    const openKey = useMemo(() => {
        if (router.pathname.startsWith('/marketer/product')) {
            return ['product'];
        }
        return undefined;
    }, [router.pathname]);

    return (
        <Menu
            defaultOpenKeys={openKey}
            items={items}
            mode="inline"
            selectedKeys={activeKey}
            style={{ width: 200, height: 'calc(100vh - 76px)' }}
        />
    );
};

export default MarketerSidebar;
