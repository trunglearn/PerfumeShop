import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import styles from '../../styles/HeaderBar.module.css';

const { Header } = Layout;

type HeaderBarProps = {
    setSort: (sort: string) => void;
    setSortOrder: (sortOrder: string) => void;
    handleSearch: (
        page: number,
        sort?: string,
        sortOrder?: string,
        category?: string,
        searchTerm?: string,
        pageSize?: number
    ) => void;
    currentSort: string;
    currentSortOrder: string;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
    setSort,
    setSortOrder,
    handleSearch,
    currentSort,
    currentSortOrder,
}) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    useEffect(() => {
        const selected: string[] = [];
        if (currentSort === 'updatedAt' && currentSortOrder === 'desc') {
            selected.push('desc');
        } else if (currentSort === 'updatedAt' && currentSortOrder === 'asc') {
            selected.push('asc');
        }
        setSelectedItems(selected);
    }, [currentSort, currentSortOrder]);

    const handleSortChange = (sortOrder: string) => {
        if (selectedItems.includes(sortOrder)) {
            setSort('updatedAt');
            setSortOrder('desc');
            handleSearch(1, 'updatedAt', 'desc');
            setSelectedItems(['desc']);
        } else {
            setSort('updatedAt');
            setSortOrder(sortOrder);
            handleSearch(1, 'updatedAt', sortOrder);
            setSelectedItems([sortOrder]);
        }
    };

    return (
        <Header className={styles.header}>
            <div className={styles.sortSection}>
                <span className={styles.sortText}>Sắp xếp theo</span>
                <Menu className={styles.menu} mode="horizontal">
                    <Menu.Item
                        className={`${styles.menuItem} ${selectedItems.includes('desc') ? styles.active : ''}`}
                        key="desc"
                        onClick={() => handleSortChange('desc')}
                    >
                        Mới nhất
                    </Menu.Item>
                    <Menu.Item
                        className={`${styles.menuItem} ${selectedItems.includes('asc') ? styles.active : ''}`}
                        key="asc"
                        onClick={() => handleSortChange('asc')}
                    >
                        Cũ nhất
                    </Menu.Item>
                </Menu>
            </div>
        </Header>
    );
};

export default HeaderBar;
