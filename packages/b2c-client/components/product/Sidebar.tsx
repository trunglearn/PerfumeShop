import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Input, Layout, Menu } from 'antd';
import { useRouter } from 'next/router';
import LatestProductCard from './LatestProductCard';
import styles from '../../styles/Sidebar.module.css';

const { Sider } = Layout;
const { Search } = Input;

type SidebarProps = {
    categories: {
        id: string;
        name: string;
    }[];
    brands: {
        id: string;
        name: string;
    }[];
    latestProducts: {
        id: string;
        name: string;
        discount_price: number;
        original_price: number;
        thumbnail: string;
    }[];
    setCategory: (category: string) => void;
    setBrand: (brand: string[]) => void;
    handleResetFilters: () => void;
    handleSearch: (
        page: number,
        sort?: string,
        sortOrder?: string,
        category?: string,
        searchTerm?: string,
        pageSize?: number,
        brand?: string[]
    ) => void;
    currentSort?: string;
    currentSortOrder?: string;
    currentCategory?: string;
    currentBrand?: string[];
};

const Sidebar: React.FC<SidebarProps> = ({
    categories = [],
    brands = [],
    latestProducts = [],
    setCategory,
    setBrand,
    handleResetFilters,
    handleSearch,
    currentSort,
    currentSortOrder,
    currentCategory,
    currentBrand,
}) => {
    const [expandedCategories, setExpandedCategories] = useState(false);
    const [expandedBrands, setExpandedBrands] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<
        string | undefined
    >(currentCategory);
    const [selectedBrands, setSelectedBrands] = useState<string[]>(
        currentBrand || []
    );

    const router = useRouter();

    useEffect(() => {
        setSelectedCategory(currentCategory);
    }, [currentCategory]);

    useEffect(() => {
        setSelectedBrands(currentBrand || []);
    }, [currentBrand]);

    const handleCategoryChange = (category: string) => {
        if (selectedCategory === category) {
            setCategory('');
            setSelectedCategory('');
            handleSearch(
                1,
                currentSort,
                currentSortOrder,
                '',
                undefined,
                undefined,
                selectedBrands
            );
        } else {
            setCategory(category);
            setSelectedCategory(category);
            handleSearch(
                1,
                currentSort,
                currentSortOrder,
                category,
                undefined,
                undefined,
                selectedBrands
            );
        }
    };

    const handleBrandChange = (brand: string) => {
        let updatedSelectedBrands;
        if (selectedBrands.includes(brand)) {
            updatedSelectedBrands = selectedBrands.filter((b) => b !== brand);
        } else {
            updatedSelectedBrands = [...selectedBrands, brand];
        }
        setBrand(updatedSelectedBrands);
        setSelectedBrands(updatedSelectedBrands);
        handleSearch(
            1,
            currentSort,
            currentSortOrder,
            selectedCategory,
            undefined,
            undefined,
            updatedSelectedBrands
        );
    };

    const onSearch = (value: string) => {
        handleSearch(
            1,
            currentSort,
            currentSortOrder,
            selectedCategory,
            value,
            undefined,
            selectedBrands
        );
    };

    const visibleCategories = expandedCategories
        ? categories
        : categories.slice(0, 3);
    const visibleBrands = expandedBrands ? brands : brands.slice(0, 3);

    const handleContactClick = () => {
        router.push('/contact');
    };

    return (
        <Sider className={styles.sidebar} width={300}>
            <div className={styles.searchSection}>
                <Search
                    enterButton
                    onSearch={onSearch}
                    placeholder="Nhập tên sản phẩm để tìm kiếm..."
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
                    selectedKeys={[selectedCategory || '']}
                    style={{ borderRight: 0 }}
                >
                    {visibleCategories.map((category) => (
                        <Menu.Item
                            className={styles.selectedItem}
                            key={category.id}
                            onClick={() => handleCategoryChange(category.id)}
                        >
                            {category.name}
                        </Menu.Item>
                    ))}
                    {categories.length > 3 && (
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
            <div className={styles.menuSection}>
                <div className={styles.menuTitle}>
                    <span className={styles.menuTitleText}>Thương Hiệu</span>
                </div>
                <div className={styles.checkboxGroup}>
                    {visibleBrands.map((brand) => (
                        <Checkbox
                            checked={selectedBrands.includes(brand.id)}
                            className={styles.checkbox}
                            key={brand.id}
                            onChange={() => handleBrandChange(brand.id)}
                        >
                            {brand.name}
                        </Checkbox>
                    ))}
                    {brands.length > 3 && (
                        <div key="toggle">
                            <Button
                                className={styles.toggleButton}
                                onClick={() =>
                                    setExpandedBrands(!expandedBrands)
                                }
                                type="link"
                            >
                                {expandedBrands ? 'Rút gọn' : 'Thêm'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <Button
                className={styles.resetButton}
                onClick={handleResetFilters}
                type="link"
            >
                Xóa bộ lọc
            </Button>
            <div className={styles.divider} />
            <div className={styles.latestProductsSection}>
                <div className={styles.menuTitle}>
                    <span className={styles.menuTitleText}>
                        Sản phẩm mới nhất
                    </span>
                </div>
                {latestProducts.map((product) => (
                    <LatestProductCard
                        discount_price={product.discount_price}
                        id={product.id}
                        key={product.id}
                        name={product.name}
                        original_price={product.original_price}
                        thumbnail={product.thumbnail}
                    />
                ))}
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
                            onClick={handleContactClick}
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
    currentSort: '',
    currentSortOrder: '',
    currentCategory: '',
    currentBrand: [],
};

export default Sidebar;
