import React from 'react';
import { useRouter } from 'next/router';
import { currencyFormatter } from '~/../common/utils/formatter';
import { getImageUrl } from '~/../common/utils/getImageUrl';
import styles from '../../styles/LatestProductCard.module.css';

type LatestProductCardProps = {
    id: string;
    name: string;
    original_price: number;
    discount_price: number | null;
    thumbnail: string;
};

const LatestProductCard: React.FC<LatestProductCardProps> = ({
    id,
    name,
    original_price,
    discount_price,
    thumbnail,
}) => {
    const router = useRouter();
    const imageUrl = thumbnail ? getImageUrl(thumbnail) : '/images/sp1.jpg';

    const handleCardClick = () => {
        router.push(`/product/${id}`);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            handleCardClick();
        }
    };
    const finalDiscountPrice =
        discount_price !== null && discount_price !== original_price;
    return (
        <div
            className={styles.latestProductCard}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
        >
            <div className={styles.productImageContainer}>
                <img
                    alt={name}
                    className={styles.productImage}
                    src={imageUrl}
                />
            </div>
            <div className={styles.productInfo}>
                <span className={styles.productName}>{name}</span>
                <span
                    className={styles.originalPrice}
                    style={{
                        visibility: finalDiscountPrice ? 'visible' : 'hidden',
                    }}
                >
                    <del>{currencyFormatter(original_price)}</del>
                </span>
                <span className={styles.discountPrice}>
                    {currencyFormatter(
                        finalDiscountPrice ? discount_price : original_price
                    )}
                </span>
            </div>
        </div>
    );
};

export default LatestProductCard;
