import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as request from 'common/utils/http-request';
import { QueryResponseType } from 'common/types';
import { Slider } from 'common/types/slider';
import { Spin } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import { cn } from 'common/utils';
import { Autoplay, Controller, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as TypeSwiper } from 'swiper';
import { ArrowLeftSquare, ArrowRightSquare } from 'common/icons';
import { useRouter } from 'next/router';

const MainBanner = () => {
    const router = useRouter();

    const { data, isLoading } = useQuery<QueryResponseType<Slider>>({
        queryKey: ['slider'],
        queryFn: () => request.get('slider').then((res) => res.data),
    });

    const [currentSlice, setCurrentSlice] = useState<number>(1);
    const [activeLeft, setActiveLeft] = useState<boolean>(false);
    const [activeRight, setActiveRight] = useState<boolean>(false);

    const swiper1Ref = useRef<TypeSwiper>();
    const swiper2Ref = useRef<TypeSwiper>();

    useEffect(() => {
        if (data?.data && data?.data?.length > 0) {
            if (swiper1Ref.current) {
                swiper1Ref.current.controller.control = swiper2Ref.current;
            }
            if (swiper2Ref.current) {
                swiper2Ref.current.controller.control = swiper1Ref.current;
            }
        }
    }, [data?.data]);

    const redirectBackLink = (link: string) => {
        if (link) {
            if (link?.startsWith('https://') || link?.startsWith('http://')) {
                window.open(link, '_blank', 'noopener');
            } else router.push(link);
        }
    };

    if (data?.data?.length === 0) {
        return null;
    }

    return (
        <Spin spinning={isLoading}>
            <div
                className={cn(
                    'relative flex justify-center',
                    data?.data && data?.data.length > 0
                        ? 'min-h-[600px]'
                        : 'min-h-[200px]'
                )}
                onMouseLeave={() => {
                    swiper1Ref.current?.autoplay?.start();
                    swiper2Ref.current?.autoplay?.start();
                }}
                onMouseMove={() => {
                    swiper1Ref.current?.autoplay?.stop();
                    swiper2Ref.current?.autoplay?.stop();
                }}
            >
                <Swiper
                    autoplay={{
                        delay: 6000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    className="!w-full !pb-6"
                    loop
                    modules={[Pagination, Controller, Navigation]}
                    onSlideChange={(e) => {
                        setCurrentSlice(
                            Number(e.realIndex) ? Number(e.realIndex) + 1 : 1
                        );
                    }}
                    onSwiper={(swiper) => {
                        swiper1Ref.current = swiper;
                    }}
                    slidesPerView={1}
                    speed={1000}
                    style={{ minWidth: 1340 }}
                >
                    {data?.data?.map((item) => (
                        <SwiperSlide
                            key={item?.id}
                            onClick={() => {
                                redirectBackLink(item?.backlink ?? '/');
                            }}
                        >
                            <div
                                className="relative flex cursor-pointer justify-center"
                                style={{
                                    height: 'calc((982px + (100vw - 1200px) / 2) * 0.5224)',
                                    maxHeight: 700,
                                }}
                            >
                                <div
                                    className="relative h-[calc(100%-20%)] max-h-[540px]"
                                    id="background-banner"
                                    role="presentation"
                                    style={{
                                        width: '100%',
                                        backgroundColor:
                                            item?.backgroundSliderColor ??
                                            '#028267',
                                    }}
                                >
                                    <div className="absolute right-[0] z-10 h-full shadow-[-10px_10px_15px_#1111112A]">
                                        <div className="z-8 relative">
                                            <div
                                                className="w-[100vw] !max-w-[1340px]"
                                                style={{
                                                    height: 'calc((982px + (100vw - 1200px) / 2) * 0.5224)',
                                                    maxHeight: 700,
                                                }}
                                            >
                                                <Image
                                                    alt={item.title ?? ''}
                                                    className="shadow-lg"
                                                    layout="fill"
                                                    objectFit="cover"
                                                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item.image}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="absolute z-10 grid h-fit w-full max-w-[1200px]">
                    <Swiper
                        autoplay={{
                            delay: 6000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        className="!relative !h-full !w-full"
                        loop
                        modules={[Controller, Navigation, Autoplay]}
                        onSwiper={(swiper) => {
                            swiper2Ref.current = swiper;
                        }}
                        speed={1000}
                    >
                        {data?.data?.map((item) => (
                            <SwiperSlide
                                key={item.id}
                                onClick={() => {
                                    redirectBackLink(item?.backlink ?? '/');
                                }}
                            >
                                <div className="animation-fade-in cursor-pointer">
                                    <div
                                        className="flex h-[540px] w-full items-center"
                                        role="presentation"
                                    >
                                        <div>
                                            <div
                                                className="block max-w-[800px] text-[42px] font-bold uppercase leading-[45px]"
                                                style={{
                                                    color:
                                                        item?.titleTextColor ??
                                                        '#FFFFFF',
                                                }}
                                            >
                                                {item?.title}
                                            </div>
                                            <div
                                                className="block text-[36px] font-bold leading-[45px]"
                                                style={{
                                                    color:
                                                        item?.noteTextColor ??
                                                        '#FFFFFF',
                                                }}
                                            >
                                                {item?.note}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
                <div className="absolute bottom-[24px] left-[calc((100%-1200px)/2)] z-50 flex items-center text-white">
                    <div className="mr-[50px] flex space-x-[8px]">
                        <div
                            className="z-[10] h-[32px] w-[32px] cursor-pointer rounded-full border border-[#00454D] bg-[#00454D] hover:border-[#101010] hover:bg-[#101010] hover:bg-opacity-80"
                            onClick={() => swiper1Ref.current?.slidePrev()}
                            onKeyDown={() => swiper1Ref.current?.slidePrev()}
                            onMouseEnter={() => setActiveLeft(true)}
                            onMouseLeave={() => setActiveLeft(false)}
                            role="presentation"
                        >
                            <ArrowLeftSquare
                                background="none"
                                height="30px"
                                iconColor={activeLeft ? '#fff' : '#fff'}
                                width="30px"
                            />
                        </div>

                        <div
                            className="z-[10] h-[32px] w-[32px] cursor-pointer rounded-full border border-[#00454D] bg-[#00454D] hover:border-[#101010] hover:bg-[#101010] hover:bg-opacity-80"
                            onClick={() => swiper1Ref.current?.slideNext()}
                            onKeyDown={() => swiper1Ref.current?.slideNext()}
                            onMouseEnter={() => setActiveRight(true)}
                            onMouseLeave={() => setActiveRight(false)}
                            role="presentation"
                        >
                            <ArrowRightSquare
                                background="none"
                                height="30px"
                                iconColor={activeRight ? '#fff' : '#fff'}
                                width="30px"
                            />
                        </div>
                    </div>
                    <div className="space-x-1.5 text-lg leading-[19px] text-black">
                        <span>{currentSlice}</span>
                        <span>/</span>
                        <span>{data?.data?.length}</span>
                    </div>
                </div>
            </div>
        </Spin>
    );
};

export default MainBanner;
