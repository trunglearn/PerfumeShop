/* eslint-disable react/no-danger */
import React, { useEffect, useState } from 'react';
import { Layout, Spin } from 'antd';
import { useRouter } from 'next/router';
import { get } from 'common/utils/http-request';
import Sidebar from '../../components/blog/Sidebar';
import styles from '~/styles/blog/BlogDetail.module.css';

const { Content } = Layout;

type Blog = {
    id: string;
    title: string;
    description: string;
    briefInfo: string;
    thumbnail: string;
    updatedAt: string;
    createdAt: string;
    user: {
        name: string;
    };
    category: {
        name: string;
    };
};

const BlogDetailPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;

    const [blog, setBlog] = useState<Blog | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (id) {
            get(`post-public/${id}`)
                .then((res) => {
                    setBlog(res.data.data);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [id]);

    if (isLoading) {
        return <Spin spinning={isLoading} />;
    }

    return (
        <Layout className={styles.container}>
            <Sidebar isDetailPage />
            <Layout className={styles.mainLayout}>
                <Content className={styles.content}>
                    <h1 className={styles.blogTitle}>{blog?.title}</h1>
                    <div className={styles.meta}>
                        <span className={styles.author}>
                            Tác giả: {blog?.user.name}
                        </span>
                        <span className={styles.date}>
                            Ngày đăng:{' '}
                            {blog?.createdAt
                                ? new Date(blog.createdAt).toLocaleDateString()
                                : ''}
                        </span>
                        <span className={styles.category}>
                            Danh mục: {blog?.category.name}
                        </span>
                    </div>
                    <div
                        className={styles.postContent}
                        dangerouslySetInnerHTML={{
                            __html: blog?.description || '',
                        }}
                    />
                </Content>
            </Layout>
        </Layout>
    );
};

export default BlogDetailPage;
/* eslint-enable react/no-danger */
