import React, { useState } from 'react';
import { Button, Card, Typography } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import * as request from 'common/utils/http-request';
import { getImageUrl } from '~/../common/utils/getImageUrl';
import { currencyFormatter } from '~/../common/utils/formatter';
import styles from '../../styles/ProductCard.module.css';
import useLoginModal from '~/hooks/useLoginModal';
import { useAuth } from '~/hooks/useAuth';
import { Product } from '~/types/product';

import FeedbackModal from '../modals/feedback-modal';
import { useCartQuery } from '~/hooks/useCartQuery';
import useCartStore from '~/hooks/useCartStore';

type ProductCardProps = Omit<Product, 'updatedAt'>;

const ProductCard: React.FC<ProductCardProps> = ({
    id,
    name,
    discount_price,
    original_price,
    description,
    thumbnail,
}) => {
    const { onOpen } = useLoginModal();
    const auth = useAuth();
    const router = useRouter();
    const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);

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
            toast.success('Product added to cart successfully!');
            setTimeout(() => {
                reload();
            }, 200);
        },
        onError: () => {
            toast.error('Failed to add product to cart.');
        },
    });

    const handleBuy = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const productData = { productId: id, quantity: 1 };

        // Check if user is authenticated
        if (auth && (auth as { access_token: string }).access_token) {
            addToCart.mutate(productData);
        } else {
            // Add to Zustand store instead of localStorage
            addProduct(productData);
        }
    };

    const handleFeedback = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!auth) {
            onOpen();
        } else {
            setFeedbackModalVisible(true);
        }
    };

    const handleCardClick = () => {
        router.push(`/product/${id}`);
    };

    const imageUrl = thumbnail ? getImageUrl(thumbnail) : '/images/sp1.jpg';
    const showDiscountPrice =
        discount_price !== null && discount_price !== original_price;

    return (
        <>
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
                        <div className={styles.metaDescription}>
                            {description}
                        </div>
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
                    <Button onClick={handleBuy} type="primary">
                        Mua
                    </Button>
                    <Button
                        className={styles.feedbackButton}
                        onClick={handleFeedback}
                        type="default"
                    >
                        Phản hồi
                    </Button>
                </div>
            </Card>
            <FeedbackModal
                onClose={() => setFeedbackModalVisible(false)}
                productId={id}
                productName={name}
                visible={isFeedbackModalVisible}
            />
        </>
    );
};

export default ProductCard;
