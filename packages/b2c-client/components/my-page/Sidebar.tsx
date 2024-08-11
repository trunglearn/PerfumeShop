import React, { useState } from 'react';
import { Menu } from 'antd';
import PropTypes from 'prop-types';
import {
    IdcardOutlined,
    LockOutlined,
    ShoppingCartOutlined,
    UserOutlined,
} from '@ant-design/icons';
import ChangePasswordPopup from './ChangePasswordPopup';
import styles from '~/styles/my-page/Sidebar.module.css';

const { SubMenu } = Menu;

type SidebarProps = {
    onMenuClick: (key: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onMenuClick }) => {
    const [isChangePasswordVisible, setChangePasswordVisible] = useState(false);

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === '2') {
            setChangePasswordVisible(true);
        } else {
            onMenuClick(key);
        }
    };

    return (
        <div className={styles.sidebarContainer}>
            <div className={styles.profileInfo}>
                <UserOutlined className={styles.profileIcon} />
                <div className={styles.profileText}>
                    <span className={styles.profileName}>
                        Thông tin người dùng
                    </span>
                </div>
            </div>
            <Menu
                defaultOpenKeys={['sub1']}
                defaultSelectedKeys={['1']}
                mode="inline"
                onClick={handleMenuClick}
                style={{ height: '100%', borderRight: 0 }}
            >
                <SubMenu
                    icon={<UserOutlined />}
                    key="sub1"
                    title="Tài Khoản Của Tôi"
                >
                    <Menu.Item icon={<IdcardOutlined />} key="1">
                        Hồ Sơ
                    </Menu.Item>
                    <Menu.Item icon={<LockOutlined />} key="2">
                        Đổi Mật Khẩu
                    </Menu.Item>
                </SubMenu>
                <Menu.Item icon={<ShoppingCartOutlined />} key="3">
                    Đơn Mua
                </Menu.Item>
            </Menu>
            <ChangePasswordPopup
                onClose={() => setChangePasswordVisible(false)}
                visible={isChangePasswordVisible}
            />
        </div>
    );
};

Sidebar.propTypes = {
    onMenuClick: PropTypes.func.isRequired,
};

export default Sidebar;
