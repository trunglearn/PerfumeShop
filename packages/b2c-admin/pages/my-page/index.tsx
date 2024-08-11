import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from '~/components/my-page/Sidebar';
import ProfileForm from '~/components/my-page/ProfileForm';
import Header from '~/components/header';

const { Sider, Content } = Layout;

const MyPage = () => {
    const [currentPage, setCurrentPage] = useState('1');

    const renderContent = () => {
        switch (currentPage) {
            case '1':
                return <ProfileForm />;
            default:
                return <ProfileForm />;
        }
    };

    return (
        <div>
            <Header title="User profile" />
            <Layout style={{ minHeight: '100vh' }}>
                <Sider className="site-layout-background" width={300}>
                    <Sidebar onMenuClick={setCurrentPage} />
                </Sider>
                <Layout>
                    <Content style={{ margin: 0, minHeight: 280 }}>
                        {renderContent()}
                    </Content>
                </Layout>
            </Layout>
        </div>
    );
};

export default MyPage;
