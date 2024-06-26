import React from 'react';
import { Layout, Pagination } from 'antd';
import BlogCard from './BlogCard';
import styles from '../../styles/blog/BlogContent.module.css';

const { Content } = Layout;

type Blog = {
    id: string;
    title: string;
    briefInfo: string;
    thumbnail: string;
};

type BlogContentProps = {
    blogs: Blog[];
    currentPage: number;
    total: number;
    onPageChange: (page: number, pageSize?: number) => void;
    pageSize: number;
};

const BlogContent: React.FC<BlogContentProps> = ({
    blogs = [],
    currentPage,
    total,
    onPageChange,
    pageSize,
}) => {
    return (
        <Layout className={styles.layout}>
            <Content className={styles.content}>
                <div className={styles.blogGrid}>
                    {blogs.map((blog) => (
                        <div className={styles.gridItem} key={blog.id}>
                            <BlogCard {...blog} />
                        </div>
                    ))}
                </div>
                <div className="mt-5 flex justify-end">
                    {total > 0 && (
                        <Pagination
                            current={currentPage}
                            defaultCurrent={1}
                            hideOnSinglePage
                            onChange={onPageChange}
                            pageSize={pageSize}
                            pageSizeOptions={[pageSize]}
                            showSizeChanger={false}
                            total={total}
                        />
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default BlogContent;
