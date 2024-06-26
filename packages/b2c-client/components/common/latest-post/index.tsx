import { useQuery } from '@tanstack/react-query';
import React from 'react';
import * as request from 'common/utils/http-request';
import type { QueryResponseType } from 'common/types';
import type { LatestPost } from 'common/types/post';
import FeaturedPostItem from './latest-post-item';

const ListLatestPost = () => {
    const { data } = useQuery<QueryResponseType<LatestPost>>({
        queryKey: ['latest-product'],
        queryFn: () => request.get('/post-latest').then((res) => res.data),
    });
    return (
        <div className="customScroll h-full w-full space-y-4 px-4">
            <div className="sticky top-0 z-20 bg-white py-2 text-xl font-bold">
                Bài viết mới
            </div>
            <div className=" flex flex-col gap-5 py-2">
                {data?.data?.map((item) => (
                    <FeaturedPostItem data={item} key={item.id} />
                ))}
            </div>
        </div>
    );
};

export default ListLatestPost;
