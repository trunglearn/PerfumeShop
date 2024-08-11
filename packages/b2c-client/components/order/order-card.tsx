import { Button, Card, Image } from 'antd';
import { Order, orderPaymentMethod, orderStatus } from 'common/types/order';
import { currencyFormatter } from 'common/utils/formatter';
import { getImageUrl } from 'common/utils/getImageUrl';
import moment from 'moment';
import { useRouter } from 'next/router';
import React from 'react';
import { CopyButton } from 'common/components/copy-button';
import { useMutation } from '@tanstack/react-query';
import request from 'common/utils/http-request';
import Link from 'next/link';
import DeleteOrderAlert from './delete-order-alert';
// import FeedbackModal from '../modals/feedback-modal';
// import ReviewModal from '../modals/review-modal';

interface OrderCardProps {
    order: Order;
    reload: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, reload }) => {
    const { id, status, createdAt, totalAmount, orderDetail, paymentMethod } =
        order;
    // const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);

    const { push } = useRouter();

    const { mutate: addCart } = useMutation({
        mutationFn: async (dataAddCart: {
            productId: string;
            quantity: number;
        }) => {
            return request.post('/cart/add', dataAddCart);
        },
    });

    const handleBuyAgain = () => {
        orderDetail?.map((item) =>
            addCart({
                productId: item.productId ?? '',
                quantity: Number(item.quantity ?? 0),
            })
        );

        const queryString = order.orderDetail
            ?.map((e) => `${e.productId}:${e.quantity}`)
            .join(',');
        push(`/cart-details?itemKeys=${queryString}`);
    };

    return (
        <div className="my-4">
            <Card>
                <div className="text-base">
                    <div className="space-y-2 border-b-2 border-b-gray-200 pb-4">
                        <div className="flex justify-between">
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium">
                                        Mã đơn hàng:
                                    </span>{' '}
                                    {id}
                                    <CopyButton
                                        toastInfo="Sao chép mã đơn hàng thành công"
                                        value={id ?? ''}
                                    />
                                </div>
                                <div className="flex items-center gap-4 ">
                                    <span>
                                        <span className="font-medium">
                                            Ngày đặt hàng:
                                        </span>
                                        <span className="text-primary ml-1">
                                            {moment(createdAt).format(
                                                'DD-MM-YYYY'
                                            )}
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
                            <div>
                                <Link href={`/my-page/my-order/${id}`}>
                                    <Button>Chi tiết đơn hàng</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    {orderDetail && (
                        <div>
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
                                    {(order.status === 'DELIVERED' ||
                                        order.status === 'CANCELED') && (
                                        <Button
                                            onClick={handleBuyAgain}
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
                                        {(order &&
                                            order.status === 'PENDING') ||
                                            (order.status ===
                                                'PAYMENT_PENDING' && (
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
                                            ))}
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
