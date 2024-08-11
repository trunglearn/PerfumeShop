import React, { useState } from 'react';
import { Menu } from 'antd';
import PropTypes from 'prop-types';
import { IdcardOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import ChangePasswordPopup from './ChangePasswordPopup';
import styles from '~/styles/my-page/Sidebar.module.css';

const { SubMenu } = Menu;

interface SidebarProps {
    onMenuClick: (key: string) => void;
}

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
            {/* <div className={styles.profileInfo}>
                <UserOutlined className={styles.profileIcon} />
                <div className={styles.profileText}>
                    <span className={styles.profileName}>User Profile</span>
                </div>
            </div> */}
            <Menu
                defaultOpenKeys={['sub1']}
                defaultSelectedKeys={['1']}
                mode="inline"
                onClick={handleMenuClick}
                style={{ height: '100%', borderRight: 0 }}
            >
                <SubMenu icon={<UserOutlined />} key="sub1" title="My Account">
                    <Menu.Item icon={<IdcardOutlined />} key="1">
                        My information
                    </Menu.Item>
                    <Menu.Item icon={<LockOutlined />} key="2">
                        Change Password
                    </Menu.Item>
                </SubMenu>
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
