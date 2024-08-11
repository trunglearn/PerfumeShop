import React, { useState } from 'react';
import type { MenuProps } from 'antd';
import { Dropdown, Skeleton } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { getImageUrl } from 'common/utils/getImageUrl';
import { useUserQueryStore } from 'common/store/useUserStore';
import Avatar from 'common/components/avatar';
import EditProfilePopup from '../my-page/EditProfilePopup';
import ChangePasswordPopup from '~/components/my-page/ChangePasswordPopup';

type Props = {
    title: string;
};

const Header: React.FC<Props> = ({ title }) => {
    const router = useRouter();

    const { user, isFetching } = useUserQueryStore();
    const [isProfilePopupVisible, setIsProfilePopupVisible] = useState(false);
    const [isChangePasswordPopupVisible, setIsChangePasswordPopupVisible] =
        useState(false);
    const logOut = () => {
        Cookies.remove('cmsUser');
        setTimeout(() => {
            router.reload();
        }, 200);
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <div
                    onClick={() => setIsProfilePopupVisible(true)}
                    role="presentation"
                >
                    User Profile
                </div>
            ),
        },
        {
            key: '2',
            label: (
                <div
                    onClick={() => setIsChangePasswordPopupVisible(true)}
                    role="presentation"
                >
                    Change Password
                </div>
            ),
        },
        {
            key: '3',
            label: (
                <div
                    className="text-rose-500"
                    onClick={logOut}
                    role="presentation"
                >
                    Log out
                </div>
            ),
        },
    ];

    return (
        <div className="flex h-[76px] w-full items-center justify-between px-5 shadow-md">
            <div
                className="cursor-pointer text-2xl font-bold uppercase"
                onClick={() => router.push('/')}
                role="presentation"
            >
                {title}
            </div>
            <div>
                <Dropdown
                    menu={{ items }}
                    overlayStyle={{
                        width: 200,
                    }}
                    placement="bottomLeft"
                >
                    <div
                        className="flex cursor-pointer space-x-3 rounded-full border px-3 py-1.5"
                        onClick={() => router.push('/my-page')}
                        role="presentation"
                    >
                        {isFetching ? (
                            <Skeleton.Avatar active className="" />
                        ) : (
                            <Avatar
                                height={40}
                                src={getImageUrl(user?.data?.image ?? '')}
                                width={40}
                            />
                        )}
                        <MenuOutlined />
                    </div>
                </Dropdown>
                {user && (
                    <EditProfilePopup
                        onClose={() => setIsProfilePopupVisible(false)}
                        visible={isProfilePopupVisible}
                    />
                )}
                {user && (
                    <ChangePasswordPopup
                        onClose={() => setIsChangePasswordPopupVisible(false)}
                        visible={isChangePasswordPopupVisible}
                    />
                )}
            </div>
        </div>
    );
};

export default Header;
