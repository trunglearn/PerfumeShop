import React from 'react';
import { getImageUrl } from 'common/utils/getImageUrl';
import Image from 'next/image';
import Link from 'next/link';
import type { LatestPost } from 'common/types/post';

type Props = {
    data: Partial<LatestPost>;
};

const PostFeaturedItem: React.FC<Props> = ({ data }) => {
    return (
        <Link className="cursor-pointer" href={`/blog/${data?.id}`}>
            <div>
                <Image
                    alt={data?.thumbnail ?? ''}
                    className="rounded-t-2xl"
                    height={270}
                    objectFit="cover"
                    src={getImageUrl(data?.thumbnail ?? '')}
                    style={{
                        height: 270,
                        objectFit: 'cover',
                    }}
                    width={430}
                />
            </div>
            <div className="space-y-5 p-8">
                <div className="text-2xl font-bold">{data?.title}</div>
                <div className="line-clamp-5 text-lg text-slate-500">
                    {data?.briefInfo}
                </div>
            </div>
        </Link>
    );
};

export default PostFeaturedItem;
