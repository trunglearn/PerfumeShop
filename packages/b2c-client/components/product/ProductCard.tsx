import { useMutation } from '@tanstack/react-query';
import { Button, Card, Typography } from 'antd';
import * as request from 'common/utils/http-request';
import { useRouter } from 'next/router';
import React from 'react';
import { toast } from 'react-toastify';
import { currencyFormatter } from '~/../common/utils/formatter';
import { getImageUrl } from '~/../common/utils/getImageUrl';
import { useAuth } from '~/hooks/useAuth';
import { Product } from '~/types/product';
import styles from '../../styles/ProductCard.module.css';

import { useCartQuery } from '~/hooks/useCartQuery';
import useCartStore from '~/hooks/useCartStore';
import CommentModal from '../modals/comment-modal';

type ProductCardProps = Omit<Product, 'updatedAt'>;

const ProductCard: React.FC<ProductCardProps> = ({
    id,
    name,
    discount_price,
    original_price,
    quantity,
    thumbnail,
    briefInfo,
}) => {
    const auth = useAuth();
    const router = useRouter();

    const { reload } = useCartQuery();
    const { addProduct } = useCartStore();

    const addToCart = useMutation({
        mutationFn: async (data: { productId: string; quantity: number }) => {
            if (!auth || !(auth as { access_token: string }).access_token) {
                throw new Error('No access token available');
            }

            return request.post('/cart/add', data);
        },
        onSuccess: () => {
            toast.success('Sản phẩm được thêm vào giỏ hàng thành công!');
            setTimeout(() => {
                reload();
            }, 200);
        },
        onError: () => {
            toast.error('Không thể thêm sản phẩm vào giỏ hàng.');
        },
    });

    const handleBuy = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (quantity > 0) {
            const productData = { productId: id, quantity: 1 };

            // Check if user is authenticated
            if (auth && (auth as { access_token: string }).access_token) {
                addToCart.mutate(productData);
            } else {
                // Add to Zustand store instead of localStorage
                addProduct(productData);
            }
        } else {
            //
        }
    };

    const handleCardClick = () => {
        router.push(`/product/${id}`);
    };

    const handleOutStock = () => {};

    const imageUrl = thumbnail ? getImageUrl(thumbnail) : '/images/sp1.jpg';
    const showDiscountPrice =
        discount_price !== null && discount_price !== original_price;

    return (
        <Card
            className={styles.productCard}
            cover={
                <img
                    alt={name}
                    className={styles.productImage}
                    src={imageUrl}
                />
            }
            hoverable
            onClick={handleCardClick} // Thêm sự kiện onClick cho thẻ Card
        >
            <Card.Meta
                description={
                    <div className={styles.metaDescription}>{briefInfo}</div>
                }
                title={<div className={styles.metaTitle}>{name}</div>}
            />
            <Typography.Paragraph
                className={styles.originalPrice}
                style={{
                    visibility: showDiscountPrice ? 'visible' : 'hidden',
                }}
            >
                <del>{currencyFormatter(original_price)}</del>
            </Typography.Paragraph>
            <Typography.Paragraph className={styles.discountPrice}>
                {currencyFormatter(
                    showDiscountPrice ? discount_price : original_price
                )}
            </Typography.Paragraph>
            <div className={styles.buttonContainer}>
                {quantity > 0 ? (
                    <Button onClick={handleBuy} type="primary">
                        Mua
                    </Button>
                ) : (
                    <Button
                        className={styles.outStock}
                        disabled
                        onClick={handleOutStock}
                    >
                        Hết hàng
                    </Button>
                )}

                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    role="presentation"
                >
                    <CommentModal
                        discount_price={discount_price ?? 0}
                        original_price={original_price ?? 0}
                        productId={id ?? ''}
                        productName={name ?? ''}
                        thumnail={thumbnail ?? ''}
                    />
                </div>
            </div>
        </Card>
    );
};

export default ProductCard;
