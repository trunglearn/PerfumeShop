import React, { useEffect, useState } from 'react';
import { Layout, Spin } from 'antd';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { get } from 'common/utils/http-request';
import Sidebar from '../../components/blog/Sidebar';
import HeaderBar from '../../components/blog/HeaderBar';
import BlogContent from '../../components/blog/BlogContent';
import styles from '~/styles/blog/Blogs.module.css';

const { Content } = Layout;

type SearchParams = {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: string;
    categoryId?: string;
    search?: string;
};

const ListBlogPage: NextPage = () => {
    const router = useRouter();
    const { query: routerQuery } = router;

    const [blogs, setBlogs] = useState([]);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchBlogs = async (params: SearchParams) => {
        setIsLoading(true);
        try {
            const res = await get('post-search', { params });
            setTotalBlogs(res.data.total);
            setBlogs(res.data.data);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUrlAndFetchBlogs = (params: SearchParams) => {
        const updatedQuery: Record<string, string | number> = {
            page: params.page,
            pageSize: params.pageSize,
            sort: params.sortBy ?? '',
            sortOrder: params.sortOrder ?? '',
            category: params.categoryId ?? '',
            search: params.search ?? '',
        };

        // Remove empty string values from query
        Object.keys(updatedQuery).forEach(
            (key) =>
                (updatedQuery[key] === '' || updatedQuery[key] === undefined) &&
                delete updatedQuery[key]
        );

        router.push(
            {
                pathname: router.pathname,
                query: updatedQuery,
            },
            undefined,
            { shallow: true }
        );

        fetchBlogs(params);
    };

    useEffect(() => {
        const params: SearchParams = {
            page: Number(routerQuery.page) || 1,
            pageSize: Number(routerQuery.pageSize) || 10,
            sortBy: (routerQuery.sort as string) || 'updatedAt',
            sortOrder: (routerQuery.sortOrder as string) || 'desc',
            categoryId: routerQuery.category as string,
            search: routerQuery.search as string,
        };
        fetchBlogs(params);
    }, [router.query]);

    const handleSearch = (
        page = 1,
        sortParam?: string,
        sortOrderParam?: string,
        categoryParam?: string,
        searchParam?: string,
        pageSizeParam?: number
    ) => {
        const params: SearchParams = {
            page,
            pageSize: pageSizeParam ?? (Number(routerQuery.pageSize) || 10),
            sortBy: sortParam ?? (routerQuery.sort as string),
            sortOrder: sortOrderParam ?? (routerQuery.sortOrder as string),
            categoryId: categoryParam ?? (routerQuery.category as string),
            search: searchParam ?? (routerQuery.search as string),
        };

        updateUrlAndFetchBlogs(params);
    };

    const handleResetFilters = () => {
        const params: SearchParams = {
            page: 1,
            pageSize: 10,
        };

        updateUrlAndFetchBlogs(params);
    };

    return (
        <Spin spinning={isLoading}>
            <Layout className={styles.container}>
                <Sidebar
                    currentCategory={routerQuery.category as string}
                    handleResetFilters={handleResetFilters}
                    handleSearch={handleSearch}
                    setCategory={(cat) => {
                        handleSearch(
                            1,
                            routerQuery.sort as string,
                            routerQuery.sortOrder as string,
                            cat,
                            routerQuery.search as string
                        );
                    }}
                />
                <Layout className={styles.mainLayout}>
                    <HeaderBar
                        currentSort={routerQuery.sort as string}
                        currentSortOrder={routerQuery.sortOrder as string}
                        handleSearch={handleSearch}
                        setSort={(newSort) => {
                            handleSearch(
                                1,
                                newSort,
                                routerQuery.sortOrder as string,
                                routerQuery.category as string,
                                routerQuery.search as string
                            );
                        }}
                        setSortOrder={(newSortOrder) => {
                            handleSearch(
                                1,
                                routerQuery.sort as string,
                                newSortOrder,
                                routerQuery.category as string,
                                routerQuery.search as string
                            );
                        }}
                    />
                    <h1 className={styles.blogTitle}>Danh sách blog</h1>
                    <Content className={styles.content}>
                        <BlogContent
                            blogs={blogs}
                            currentPage={Number(routerQuery.page) || 1}
                            onPageChange={(page, newPageSize) =>
                                handleSearch(
                                    page,
                                    routerQuery.sort as string,
                                    routerQuery.sortOrder as string,
                                    routerQuery.category as string,
                                    routerQuery.search as string,
                                    newPageSize
                                )
                            }
                            pageSize={Number(routerQuery.pageSize) || 10}
                            total={totalBlogs}
                        />
                    </Content>
                </Layout>
            </Layout>
        </Spin>
    );
};

export default ListBlogPage;
