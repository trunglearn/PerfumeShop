import React, { useEffect, useState } from 'react';
import { Button, Input, Layout, Menu, Spin } from 'antd';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { get } from 'common/utils/http-request';
import { POST_CATEGORY } from 'common/constant';
import { getBlogCategoryName } from 'common/utils/getBlogCategoryName';
import LatestBlogCard from './LatestBlogCard';
import styles from '../../styles/Sidebar.module.css';

const { Sider } = Layout;
const { Search } = Input;

type LatestPost = {
    id: string;
    title: string;
    thumbnail: string;
};

type SidebarProps = {
    setCategory?: (category: string) => void;
    handleResetFilters?: () => void;
    handleSearch?: (
        page: number,
        sort?: string,
        sortOrder?: string,
        category?: string,
        searchTerm?: string,
        pageSize?: number
    ) => void;
    currentCategory?: string;
    isDetailPage?: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({
    setCategory,
    handleResetFilters,
    handleSearch,
    currentCategory,
    isDetailPage = false,
}) => {
    const [expandedCategories, setExpandedCategories] = useState(false);
    const [showAllBlogs, setShowAllBlogs] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<
        | {
              id: string;
              value: string;
          }
        | undefined
    >(POST_CATEGORY.find((cat) => cat.id === currentCategory));
    const [searchValue, setSearchValue] = useState<string>('');

    const { data: latestPosts = [], isLoading: latestPostsLoading } = useQuery<
        LatestPost[]
    >({
        queryKey: ['latestPosts'],
        queryFn: () => get('post-latest').then((res) => res.data.data),
    });

    const router = useRouter();

    useEffect(() => {
        setSelectedCategory(
            POST_CATEGORY.find((cat) => cat.id === currentCategory)
        );
    }, [currentCategory]);

    useEffect(() => {
        if (router.query.search) {
            setSearchValue(router.query.search as string);
        }
    }, [router.query.search]);

    const handleCategoryChange = (category: { id: string; value: string }) => {
        if (selectedCategory?.id === category.id) {
            if (setCategory) {
                setCategory('');
            }
            setSelectedCategory(undefined);
            if (handleSearch) {
                handleSearch(1, undefined, undefined, '');
            }
        } else {
            if (setCategory) {
                setCategory(category.id);
            }
            setSelectedCategory(category);
            if (isDetailPage) {
                router.push({
                    pathname: '/blog',
                    query: { category: category.id },
                });
            } else if (handleSearch) {
                handleSearch(1, undefined, undefined, category.id);
            }
        }
    };

    const onSearch = (value: string) => {
        if (isDetailPage) {
            router.push({
                pathname: '/blog',
                query: { page: 1, pageSize: 12, search: value },
            });
        } else if (handleSearch) {
            handleSearch(
                1,
                undefined,
                undefined,
                selectedCategory?.id || '',
                value
            );
        }
    };

    const handleResetFiltersInternal = () => {
        setSearchValue('');
        if (handleResetFilters) {
            handleResetFilters();
        }
    };

    const visibleCategories = expandedCategories
        ? POST_CATEGORY
        : POST_CATEGORY.slice(0, 3);

    if (latestPostsLoading) {
        return <Spin spinning />;
    }

    return (
        <Sider className={styles.sidebar} width={300}>
            <div className={styles.searchSection}>
                <Search
                    enterButton
                    onChange={(e) => setSearchValue(e.target.value)}
                    onSearch={onSearch}
                    placeholder="Nhập tên blog để tìm kiếm..."
                    value={searchValue}
                />
            </div>
            <div className={styles.menuSection}>
                <div className={styles.menuTitle}>
                    <span className={styles.menuTitleText}>
                        Tất Cả Danh Mục
                    </span>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedCategory?.id || '']}
                    style={{ borderRight: 0 }}
                >
                    {visibleCategories.map((category) => (
                        <Menu.Item
                            className={styles.selectedItem}
                            key={category.id}
                            onClick={() => handleCategoryChange(category)}
                        >
                            {getBlogCategoryName(category?.value, 'vi')}
                        </Menu.Item>
                    ))}
                    {POST_CATEGORY.length > 3 && (
                        <Menu.Item className={styles.selectedItem} key="toggle">
                            <Button
                                className={styles.toggleButton}
                                onClick={() =>
                                    setExpandedCategories(!expandedCategories)
                                }
                                type="link"
                            >
                                {expandedCategories ? 'Rút gọn' : 'Thêm'}
                            </Button>
                        </Menu.Item>
                    )}
                </Menu>
            </div>
            {!isDetailPage && (
                <>
                    <Button
                        className={styles.resetButton}
                        onClick={handleResetFiltersInternal}
                        type="link"
                    >
                        Xóa bộ lọc
                    </Button>
                    <div className={styles.divider} />
                </>
            )}
            <div className={styles.latestBlogsSection}>
                <div className={styles.menuTitle}>
                    <span className={styles.menuTitleText}>Blog mới nhất</span>
                </div>
                {latestPosts
                    .slice(0, showAllBlogs ? latestPosts.length : 4)
                    .map((blog) => (
                        <LatestBlogCard key={blog.id} {...blog} />
                    ))}
                <Button
                    className={styles.toggleButton}
                    onClick={() => setShowAllBlogs(!showAllBlogs)}
                    type="link"
                >
                    {showAllBlogs ? 'Rút gọn' : 'Xem thêm'}
                </Button>
            </div>
            <div className={styles.contactsSection}>
                <div className={styles.menuTitle}>
                    <span className={styles.menuTitleText}>Liên hệ</span>
                </div>
                <ul className={styles.contactList}>
                    <li>Email: perfumeshop1830@gmail.com</li>
                    <li>Điện thoại: (123) 456-7890</li>
                    <li>
                        Địa chỉ: 123 Đường Nước Hoa, Thành phố Hương, PC 12345
                    </li>
                    <li>
                        <button
                            className={styles.contactDetailButton}
                            onClick={() => router.push('/contact')}
                            type="button"
                        >
                            Thông tin chi tiết
                        </button>
                    </li>
                </ul>
            </div>
        </Sider>
    );
};

Sidebar.defaultProps = {
    setCategory: () => {},
    handleResetFilters: () => {},
    handleSearch: () => {},
    currentCategory: '',
    isDetailPage: false,
};

export default Sidebar;
