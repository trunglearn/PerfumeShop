import React, { useRef, useState } from 'react';
import * as request from 'common/utils/http-request';
import { useQuery } from '@tanstack/react-query';
import type { LatestPost } from 'common/types/post';
import type { QueryResponseType } from 'common/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as TypeSwiper } from 'swiper';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { cn } from 'common/utils';
import { Button } from 'antd';
import Link from 'next/link';
import PostFeaturedItem from './post-featured-item';

const PostFeatured = () => {
    const swiperRef = useRef<TypeSwiper>();

    const [swiperBegin, setSwiperBegin] = useState<boolean>(true);
    const [swiperEnd, setSwiperEnd] = useState<boolean>(false);

    const { data } = useQuery<QueryResponseType<Partial<LatestPost>>>({
        queryKey: ['post-featured'],
        queryFn: () => request.get('post-featured').then((res) => res.data),
    });

    const onSlideChange = (swiper: TypeSwiper) => {
        setSwiperBegin(swiper.isBeginning);
        setSwiperEnd(
            swiper.isEnd ||
                (swiper?.slides?.length ?? 0) - 3 <= (swiper?.activeIndex ?? 0)
        );
    };
    return (
        <div>
            <div className="space-y-10">
                <div className="flex justify-between">
                    <p className="text-2xl font-bold uppercase">
                        Bài viết nổi bật
                    </p>
                    <Link href="/blog">
                        <Button>Tất cả bài viết</Button>
                    </Link>
                </div>
                <div className="relative">
                    <Swiper
                        className="mySwiper"
                        modules={[Navigation]}
                        onSlideChange={onSlideChange}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        slidesPerView="auto"
                        spaceBetween={30}
                    >
                        {data?.data?.map((item) => (
                            <SwiperSlide
                                className="!h-[500px] !w-[430px] rounded-2xl border shadow-md"
                                key={item.id}
                            >
                                <PostFeaturedItem data={item} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div
                        className={cn(
                            'absolute left-0 top-[45%] z-10 h-10 w-10 cursor-pointer border-2 bg-white p-2 hover:bg-slate-800 hover:text-white',
                            swiperBegin &&
                                'cursor-not-allowed bg-slate-200 text-slate-400 hover:bg-slate-200 hover:text-slate-400'
                        )}
                        onClick={() => swiperRef.current?.slidePrev()}
                        role="presentation"
                    >
                        <LeftOutlined />
                    </div>
                    <div
                        className={cn(
                            'absolute right-0 top-[45%] z-10 h-10 w-10 cursor-pointer border-2 bg-white p-2 hover:bg-slate-800 hover:text-white',
                            swiperEnd &&
                                'cursor-not-allowed bg-slate-200 text-slate-400 hover:bg-slate-200 hover:text-slate-400'
                        )}
                        onClick={() => swiperRef.current?.slideNext()}
                        role="presentation"
                    >
                        <RightOutlined />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostFeatured;
