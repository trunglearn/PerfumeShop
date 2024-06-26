import React from 'react';
import { useRouter } from 'next/router';
import { getImageUrl } from '~/../common/utils/getImageUrl';
import styles from '../../styles/blog/LatestBlogCard.module.css';

type LatestBlogCardProps = {
    id: string;
    title: string;
    thumbnail: string;
};

const LatestBlogCard: React.FC<LatestBlogCardProps> = ({
    id,
    title,
    thumbnail,
}) => {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/blog/${id}`);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            handleCardClick();
        }
    };
    const imageUrl = thumbnail ? getImageUrl(thumbnail) : '/images/sp1.jpg';
    return (
        <div
            className={styles.latestBlogCard}
            onClick={handleCardClick}
            onKeyPress={handleKeyPress}
            role="button"
            tabIndex={0}
        >
            <div className={styles.blogImageContainer}>
                <img alt={title} className={styles.blogImage} src={imageUrl} />
            </div>
            <div className={styles.blogInfo}>
                <span className={styles.blogTitle}>{title}</span>
            </div>
        </div>
    );
};

export default LatestBlogCard;
