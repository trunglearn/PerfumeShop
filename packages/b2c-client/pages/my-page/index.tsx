import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from '~/components/my-page/Sidebar';
import ProfileForm from '~/components/my-page/ProfileForm';
import MyOrder from './my-order/index';

const { Sider, Content } = Layout;

const MyPage = () => {
    const [currentPage, setCurrentPage] = useState('1');

    const renderContent = () => {
        switch (currentPage) {
            case '1':
                return <ProfileForm />;
            case '3':
                return <MyOrder />;
            default:
                return <ProfileForm />;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider className="site-layout-background" width={300}>
                <Sidebar onMenuClick={setCurrentPage} />
            </Sider>
            <Layout style={{ padding: '24px' }}>
                <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MyPage;
