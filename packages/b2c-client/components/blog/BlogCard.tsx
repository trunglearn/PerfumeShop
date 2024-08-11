import React from 'react';
import { useRouter } from 'next/router';
import { getImageUrl } from '~/../common/utils/getImageUrl';
import Image from 'next/image';

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
        <div
            className="w-[300px] cursor-pointer rounded-lg border hover:shadow-md"
            onClick={handleCardClick}
            role="presentation"
        >
            <div>
                <Image
                    alt={title}
                    className="rounded-t-lg"
                    height={200}
                    src={imageUrl}
                    style={{
                        height: 200,
                        width: 300,
                        objectFit: 'cover',
                    }}
                    width={300}
                />
            </div>
            <div className="space-y-4 p-4">
                <div className="text-xl font-semibold">{title}</div>
                <div className="line-clamp-4">{briefInfo}</div>
            </div>
        </div>
    );
};

export default BlogCard;
