import { Button, Card, Image } from 'antd';
import { Order, orderPaymentMethod, orderStatus } from 'common/types/order';
import { currencyFormatter } from 'common/utils/formatter';
import { getImageUrl } from 'common/utils/getImageUrl';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import DeleteOrderAlert from './delete-order-alert';
import FeedbackModal from '../modals/feedback-modal';
import ReviewModal from '../modals/review-modal';

interface OrderCardProps {
    order: Order;
    reload: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, reload }) => {
    const { id, status, createdAt, totalAmount, orderDetail, paymentMethod } =
        order;
    const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);

    const { push } = useRouter();

    return (
        <div className="my-4">
            <Card
                hoverable
                onClick={(e) => {
                    e.stopPropagation();
                    push(`/my-page/my-order/${id}`);
                }}
            >
                <div className="text-base">
                    <div className="flex items-center justify-between border-b-2  border-b-gray-200 pb-4">
                        <div>
                            <button type="button">Mã đơn hàng: {id}</button>
                        </div>
                        <div className="flex items-center gap-4 ">
                            <span>
                                Ngày đặt hàng:
                                <span className="text-primary ml-1">
                                    {moment(createdAt).format('YYYY-MM-DD')}
                                </span>
                            </span>
                            <span className=" text-gray-400">|</span>
                            <span>
                                Trạng thái đơn hàng:
                                <span className="text-primary ml-1">
                                    {
                                        orderStatus[
                                            status as keyof typeof orderStatus
                                        ]
                                    }
                                </span>
                            </span>
                        </div>
                    </div>
                    {orderDetail && (
                        <div className="">
                            <div className="flex-wrap border-b-2 border-b-gray-200 py-4">
                                <div className="flex h-full items-center">
                                    <Image
                                        className="pr-4"
                                        height={80}
                                        preview={false}
                                        src={getImageUrl(
                                            orderDetail[0]?.thumbnail
                                                ? orderDetail[0]?.thumbnail
                                                : ''
                                        )}
                                    />
                                    <div className="flex h-full w-full justify-between">
                                        <div className="flex-col gap-8">
                                            <p className="text-xl">
                                                {orderDetail[0]?.productName}
                                            </p>
                                            <p className="text-base text-gray-500">
                                                Phân loại hàng:{' '}
                                                {orderDetail[0]?.category},{' '}
                                                {orderDetail[0]?.size}
                                                ml
                                            </p>
                                            <p className="text-base ">
                                                x {orderDetail[0]?.quantity}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-2">
                                                <span
                                                    className={
                                                        orderDetail[0]
                                                            ?.discountPrice
                                                            ? 'text-gray-400 line-through'
                                                            : ''
                                                    }
                                                >
                                                    {orderDetail[0]
                                                        ?.originalPrice &&
                                                        currencyFormatter(
                                                            Number(
                                                                orderDetail[0]
                                                                    ?.originalPrice
                                                            )
                                                        )}
                                                </span>
                                                <span>
                                                    {orderDetail[0]
                                                        ?.discountPrice &&
                                                        currencyFormatter(
                                                            Number(
                                                                orderDetail[0]
                                                                    ?.discountPrice
                                                            )
                                                        )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {order.count !== undefined &&
                                    order.count !== null &&
                                    order.count > 0 && (
                                        <div className="mt-2 text-base">
                                            {orderDetail[0]?.productName} và{' '}
                                            {order.count} sản phẩm khác
                                        </div>
                                    )}
                            </div>
                            <div className="flex items-center">
                                <div
                                    className="flex gap-4"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    role="presentation"
                                >
                                    {order?.orderDetail &&
                                        order.count === 0 &&
                                        (order.status === 'DELIVERED' ? (
                                            <ReviewModal
                                                category={
                                                    order.orderDetail[0]
                                                        ?.category ?? ''
                                                }
                                                productId={
                                                    order?.orderDetail[0]
                                                        ?.productId ?? ''
                                                }
                                                productName={
                                                    order.orderDetail[0]
                                                        ?.productName ?? ''
                                                }
                                                size={
                                                    order.orderDetail[0]
                                                        ?.size ?? ''
                                                }
                                                thumnail={
                                                    order.orderDetail[0]
                                                        ?.thumbnail ?? ''
                                                }
                                            />
                                        ) : (
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
                                        ))}

                                    <FeedbackModal
                                        onClose={() =>
                                            setFeedbackModalVisible(false)
                                        }
                                        productId={
                                            orderDetail[0]?.productId ?? ''
                                        }
                                        productName={
                                            orderDetail[0]?.productName ?? ''
                                        }
                                        visible={isFeedbackModalVisible}
                                    />

                                    {order.status === 'DELIVERED' && (
                                        <Button
                                            onClick={() => {
                                                const queryString =
                                                    order.orderDetail
                                                        ?.map(
                                                            (e) =>
                                                                `${e.productId}:${e.quantity}`
                                                        )
                                                        .join(',');
                                                push(
                                                    `/my-page/cart-details?itemKeys=${queryString}`
                                                );
                                            }}
                                            size="large"
                                            style={{
                                                width: '100px',
                                            }}
                                            type="primary"
                                        >
                                            Mua lại
                                        </Button>
                                    )}

                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        role="presentation"
                                    >
                                        {order &&
                                            order.status === 'PENDING' && (
                                                <DeleteOrderAlert
                                                    orderId={order.id ?? ''}
                                                    productName={
                                                        order.orderDetail
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
                                                    reload={() => reload()}
                                                />
                                            )}
                                    </div>
                                </div>
                                <div className="w-full flex-col">
                                    <p className="mt-2 flex w-full justify-end ">
                                        Thành tiền:
                                        <span className="text-primary ml-1">
                                            {currencyFormatter(
                                                Number(totalAmount)
                                            )}
                                        </span>
                                    </p>
                                    <p className="mt-2 flex w-full justify-end">
                                        Hình thức thanh toán:{' '}
                                        <span className="text-primary ml-1">
                                            {
                                                orderPaymentMethod[
                                                    paymentMethod as keyof typeof orderPaymentMethod
                                                ]
                                            }
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
