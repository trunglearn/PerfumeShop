import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as TypeSwiper } from 'swiper';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { ProductImage } from 'common/types/product';
import Image from 'next/image';
import { getImageUrl } from 'common/utils/getImageUrl';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { cn } from 'common/utils';
import styles from './ProductImageSlider.module.scss';

type Props = {
    listImage: ProductImage[];
};

type ChangeSlideButtonProps = {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
};

const ChangeSlideButton: React.FC<ChangeSlideButtonProps> = ({
    children,
    className,
    onClick,
}) => {
    return (
        <div
            className={cn(
                'absolute z-10 flex h-[28px] w-[28px] cursor-pointer select-none items-center justify-center border bg-slate-700 text-white',
                className
            )}
            onClick={onClick}
            role="presentation"
        >
            {children}
        </div>
    );
};

const ProductImageSlider: React.FC<Props> = ({ listImage }) => {
    const [thumbsSwiper, setThumbsSwiper] = useState<TypeSwiper>();

    const swiperMainRef = useRef<TypeSwiper>();

    return (
        <div className="w-[450px]">
            <div className="relative rounded-xl border">
                <Swiper
                    loop
                    modules={[FreeMode, Navigation, Thumbs]}
                    onSwiper={(swiper) => {
                        swiperMainRef.current = swiper;
                    }}
                    spaceBetween={10}
                    thumbs={{ swiper: thumbsSwiper }}
                >
                    {listImage?.map((item) => (
                        <SwiperSlide key={item.id}>
                            <Image
                                alt={item?.url ?? ''}
                                className="rounded-xl object-cover"
                                height={450}
                                src={getImageUrl(item?.url ?? '')}
                                style={{
                                    width: 450,
                                    height: 450,
                                }}
                                width={450}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                <ChangeSlideButton
                    className="left-0 top-[45%]"
                    onClick={() => {
                        swiperMainRef.current?.slidePrev();
                    }}
                >
                    <LeftOutlined />
                </ChangeSlideButton>
                <ChangeSlideButton
                    className="right-0 top-[45%]"
                    onClick={() => {
                        swiperMainRef.current?.slideNext();
                    }}
                >
                    <RightOutlined />
                </ChangeSlideButton>
            </div>
            <div className="mt-10">
                <Swiper
                    className={cn(styles.mySwiper)}
                    freeMode
                    modules={[FreeMode, Navigation, Thumbs]}
                    onSwiper={setThumbsSwiper}
                    slidesPerView="auto"
                    spaceBetween={10}
                    watchSlidesProgress
                >
                    {listImage?.map((item) => (
                        <SwiperSlide
                            className="!h-[82px] !w-[82px] rounded-md opacity-40"
                            key={item.id}
                        >
                            <Image
                                alt={item?.url ?? ''}
                                className="cursor-pointer rounded-md border object-cover"
                                height={82}
                                src={getImageUrl(item?.url ?? '')}
                                style={{
                                    width: 82,
                                    height: 82,
                                }}
                                width={82}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

ChangeSlideButton.defaultProps = {
    className: undefined,
    onClick: undefined,
};

export default ProductImageSlider;
