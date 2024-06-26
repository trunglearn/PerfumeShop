import React from 'react';
import { Layout, Pagination } from 'antd';
import ProductCard from './ProductCard';
import styles from '../../styles/ProductContent.module.css';
import { Product } from '~/types/product';

const { Content } = Layout;

type ProductContentProps = {
    products: Product[];
    currentPage: number;
    total: number;
    onPageChange: (page: number, pageSize?: number) => void;
    pageSize: number;
};

const ProductContent: React.FC<ProductContentProps> = ({
    products = [],
    currentPage,
    total,
    onPageChange,
    pageSize,
}) => {
    return (
        <Layout className={styles.layout}>
            <Content className={styles.content}>
                <div className={styles.productGrid}>
                    {products.map((product) => (
                        <div className={styles.gridItem} key={product.id}>
                            <ProductCard {...product} />
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

export default ProductContent;
