import { MenuOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useAuth } from '~/hooks/useAuth';
import useLoginModal from '~/hooks/useLoginModal';
import useRegisterModal from '~/hooks/useRegisterModal';
import Search from './search';
import CartIcon from './cart-icon';

const Header = () => {
    const auth = useAuth();
    const router = useRouter();
    const { onOpen: openLoginModal } = useLoginModal();
    const { onOpen: openRegisterModal } = useRegisterModal();

    const logOut = () => {
        Cookies.remove('accessTokenClient');
        setTimeout(() => {
            router.reload();
        }, 200);
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: <div>Thông tin</div>,
        },
        {
            key: 'myOrder',
            label: (
                <div
                    onClick={() => router.push('/my-page/my-order')}
                    role="presentation"
                >
                    Đơn mua
                </div>
            ),
        },
        {
            key: '4',
            label: (
                <div
                    className="text-rose-500"
                    onClick={logOut}
                    role="presentation"
                >
                    Đăng xuất
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="container flex h-[76px] w-full items-center justify-between">
                <Link href="/">
                    <div className="flex select-none flex-col items-center gap-0 uppercase">
                        <div className="text-lg leading-4 text-rose-600">
                            The
                        </div>
                        <div className="text-2xl font-bold">Perfume</div>
                    </div>
                </Link>
                <div>
                    <Search />
                </div>
                <div className="flex items-center gap-8">
                    <CartIcon />
                    {auth ? (
                        <div>
                            <Dropdown
                                menu={{ items }}
                                overlayStyle={{
                                    width: 250,
                                }}
                                placement="bottomRight"
                            >
                                <div className="flex cursor-pointer space-x-3 rounded-full border px-3 py-1">
                                    <Image
                                        alt="avatar"
                                        className="rounded-full"
                                        height={40}
                                        src="/images/placeholder.jpg"
                                        width={40}
                                    />
                                    <MenuOutlined />
                                </div>
                            </Dropdown>
                        </div>
                    ) : (
                        <div className="flex space-x-3">
                            <Button onClick={openLoginModal} type="primary">
                                Đăng nhập
                            </Button>
                            <Button onClick={openRegisterModal} type="default">
                                Đăng ký
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
