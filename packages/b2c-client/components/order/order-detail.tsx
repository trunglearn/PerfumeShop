/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-lines */
import { LeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Image, Layout, Spin } from 'antd';
import {
    genderType,
    Order,
    orderPaymentMethod,
    orderStatus,
} from 'common/types/order';
import { currencyFormatter } from 'common/utils/formatter';
import { getImageUrl } from 'common/utils/getImageUrl';
import request, { get } from 'common/utils/http-request';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Sider from 'antd/es/layout/Sider';
import { PAGE_SIZE_CLIENT_PRODUCT } from 'common/constant';
import styles from '~/styles/Products.module.css';
import EditOrderModal from './edit-order-modal';
import DeleteOrderAlert from './delete-order-alert';
import FeedbackModal from '../modals/feedback-modal';
import ReviewModal from '../modals/review-modal';
import Sidebar from '../product/Sidebar';

type SearchParams = {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: string;
    categoryId?: string;
    search?: string;
    brandId?: string;
};

const OrderDetail = () => {
    const { query: routerQuery, back, push, pathname } = useRouter();

    const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);

    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {
        data: orderDetail,
        isLoading: isLoadingOrder,
        refetch,
    } = useQuery<Order>({
        queryKey: ['order-detail'],
        queryFn: () =>
            request
                .get(`/order-detail/${routerQuery.id}`)
                .then((res) => res.data)
                .then((res) => res.data),
    });

    return (
        <Layout className={styles.container}>
            <Spin spinning={isLoadingOrder}>
                <div className="flex w-full justify-center">
                    <div className="m-4 flex w-[1000px] flex-col gap-6 rounded-lg bg-white px-4 text-base">
                        <div className="flex w-full justify-between border-b-2 border-solid border-slate-200 py-4 text-lg">
                            <div
                                className="flex cursor-pointer items-center gap-2 "
                                onClick={() => back()}
                                role="presentation"
                            >
                                <Button
                                    className="flex items-center"
                                    type="link"
                                >
                                    <LeftOutlined style={{ scale: '1.5' }} />
                                    <span>Trở lại</span>
                                </Button>
                            </div>
                            <div className="flex items-center gap-4 ">
                                <span>
                                    Mã đơn hàng:
                                    <span className=" ml-1">
                                        {orderDetail?.id}
                                    </span>
                                </span>
                                <span className=" text-gray-400">|</span>
                                <span>
                                    Trạng thái đơn hàng:
                                    <span className="text-primary ml-1">
                                        {
                                            orderStatus[
                                                orderDetail?.status as keyof typeof orderStatus
                                            ]
                                        }
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div className=" flex items-center justify-between rounded-lg bg-orange-100 p-4">
                            <div>
                                <span className="text-lg">
                                    Ngày đặt hàng:
                                    <span className="text-primary ml-1">
                                        {moment(orderDetail?.createdAt).format(
                                            'YYYY-MM-DD'
                                        )}
                                    </span>
                                </span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {orderDetail?.status === 'PENDING' && (
                                    <>
                                        <Button
                                            onClick={() => {
                                                const queryString =
                                                    orderDetail.orderDetail
                                                        ?.map(
                                                            (e) =>
                                                                `${e.productId}:${e.quantity}`
                                                        )
                                                        .join(',');
                                                push(
                                                    `/my-page/cart-details?itemKeys=${queryString}&orderId=${orderDetail.id}`
                                                );
                                            }}
                                            size="large"
                                            style={{
                                                width: '200px',
                                            }}
                                            type="primary"
                                        >
                                            Chỉnh sửa đơn hàng
                                        </Button>
                                        {orderDetail &&
                                            orderDetail.orderDetail && (
                                                <DeleteOrderAlert
                                                    orderId={
                                                        orderDetail.id ?? ''
                                                    }
                                                    productName={
                                                        orderDetail?.orderDetail
                                                            ?.map(
                                                                (e) =>
                                                                    e.productName
                                                            )
                                                            .filter(
                                                                (name) =>
                                                                    name !==
                                                                    null
                                                            ) as string[]
                                                    }
                                                    reload={() => {}}
                                                    width={200}
                                                />
                                            )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Thông tin nhận hàng */}
                        <div className="flex items-center justify-center gap-20 ">
                            <span className="text-xl font-bold">
                                Thông tin nhận hàng
                            </span>
                            <div className="flex border-l-2 border-solid border-slate-500 px-8 text-lg">
                                <div>
                                    <p>
                                        Người nhận:{' '}
                                        <span className=" ml-1">
                                            {orderDetail?.name}
                                        </span>
                                    </p>
                                    <p>
                                        Giới tính:{' '}
                                        <span className=" ml-1">
                                            {
                                                genderType[
                                                    orderDetail?.gender as keyof typeof genderType
                                                ]
                                            }
                                        </span>
                                    </p>
                                    <p>
                                        Email:{' '}
                                        <span className=" ml-1">
                                            {orderDetail?.email}
                                        </span>
                                    </p>
                                    <p>
                                        Số điện thoại:{' '}
                                        <span className=" ml-1">
                                            {orderDetail?.phoneNumber}
                                        </span>
                                    </p>
                                    <p>
                                        Địa chỉ:{' '}
                                        <span className=" ml-1">
                                            {orderDetail?.address}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    {orderDetail?.status === 'PENDING' && (
                                        <EditOrderModal
                                            address={orderDetail?.address ?? ''}
                                            email={orderDetail?.email ?? ''}
                                            gender={orderDetail?.gender ?? ''}
                                            name={orderDetail?.name ?? ''}
                                            orderId={orderDetail?.id ?? ''}
                                            phoneNumber={
                                                orderDetail?.phoneNumber ?? ''
                                            }
                                            reload={() => refetch()}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sản phẩm  */}
                        <div className="">
                            {orderDetail?.orderDetail?.map((detail) => (
                                <Card
                                    className="my-2"
                                    hoverable
                                    key={detail.id}
                                    onClick={() =>
                                        push(`/product/${detail.id}`)
                                    }
                                >
                                    <div className=" flex h-full items-center">
                                        <Image
                                            className="pr-4"
                                            height={80}
                                            preview={false}
                                            src={getImageUrl(
                                                detail.thumbnail
                                                    ? detail.thumbnail
                                                    : ''
                                            )}
                                        />
                                        <div className="flex h-full w-full justify-between">
                                            <div className="flex-col gap-8">
                                                <p className="text-xl">
                                                    {detail.productName}
                                                </p>
                                                <p className="text-base text-gray-500">
                                                    Phân loại hàng:{' '}
                                                    {detail?.category},{' '}
                                                    {detail?.size}
                                                    ml
                                                </p>
                                                <p className="text-base ">
                                                    x {detail?.quantity}
                                                </p>
                                            </div>
                                            <div className="flex  items-center justify-center gap-8">
                                                <div className="flex gap-2 text-base">
                                                    <span
                                                        className={
                                                            detail?.discountPrice
                                                                ? 'text-gray-400 line-through'
                                                                : ''
                                                        }
                                                    >
                                                        {detail?.originalPrice &&
                                                            currencyFormatter(
                                                                Number(
                                                                    detail?.originalPrice
                                                                )
                                                            )}
                                                    </span>
                                                    <span>
                                                        {detail?.discountPrice &&
                                                            currencyFormatter(
                                                                Number(
                                                                    detail?.discountPrice
                                                                )
                                                            )}
                                                    </span>
                                                </div>
                                                <div
                                                    className="flex flex-col gap-4"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    role="presentation"
                                                >
                                                    {orderDetail.status ===
                                                    'DELIVERED' ? (
                                                        <ReviewModal
                                                            category={
                                                                detail.category ??
                                                                ''
                                                            }
                                                            productId={
                                                                detail?.productId ??
                                                                ''
                                                            }
                                                            productName={
                                                                detail.productName ??
                                                                ''
                                                            }
                                                            size={
                                                                detail.size ??
                                                                ''
                                                            }
                                                            thumnail={
                                                                detail.thumbnail ??
                                                                ''
                                                            }
                                                        />
                                                    ) : (
                                                        <>
                                                            <Button
                                                                onClick={() =>
                                                                    setFeedbackModalVisible(
                                                                        true
                                                                    )
                                                                }
                                                                size="large"
                                                                type="primary"
                                                            >
                                                                Phản hồi
                                                            </Button>

                                                            <FeedbackModal
                                                                onClose={() =>
                                                                    setFeedbackModalVisible(
                                                                        false
                                                                    )
                                                                }
                                                                productId={
                                                                    detail.productId ??
                                                                    ''
                                                                }
                                                                productName={
                                                                    detail.productName ??
                                                                    ''
                                                                }
                                                                visible={
                                                                    isFeedbackModalVisible
                                                                }
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Thành tiền */}
                        <div className="flex flex-col items-end pb-4">
                            <div className="grid grid-cols-2 justify-items-end gap-x-2">
                                <span>Thành tiền:</span>
                                <span className="text-primary text-lg">
                                    {currencyFormatter(
                                        Number(orderDetail?.totalAmount)
                                    )}
                                </span>
                                <span>Phương thức thanh toán:</span>
                                <span className="">
                                    {
                                        orderPaymentMethod[
                                            orderDetail?.paymentMethod as keyof typeof orderPaymentMethod
                                        ]
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
        </Layout>
    );
};

export default OrderDetail;
