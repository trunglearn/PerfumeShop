import React from 'react';
import { Card } from 'antd';
import { useRouter } from 'next/router';
import { getImageUrl } from '~/../common/utils/getImageUrl';
import styles from '../../styles/blog/BlogCard.module.css';

type Blog = {
    id: string;
    title: string;
    briefInfo: string;
    thumbnail: string;
};

const BlogCard: React.FC<Blog> = ({ id, title, briefInfo, thumbnail }) => {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/blog/${id}`);
    };
    const imageUrl = thumbnail ? getImageUrl(thumbnail) : '/images/sp1.jpg';
    return (
        <Card
            className={styles.blogCard}
            cover={
                <img alt={title} className={styles.blogImage} src={imageUrl} />
            }
            hoverable
            onClick={handleCardClick}
        >
            <Card.Meta description={briefInfo} title={title} />
        </Card>
    );
};

export default BlogCard;
