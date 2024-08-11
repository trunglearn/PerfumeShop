/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unescaped-entities */
import {
    ClockCircleOutlined,
    CopyOutlined,
    DownOutlined,
    MailOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, Image, QRCode, Spin, Typography } from 'antd';
import {
    genderType,
    Order,
    orderPaymentMethod,
    orderStatus,
} from 'common/types/order';
import { ZLPayResponse } from 'common/types/payment';
import { currencyFormatter } from 'common/utils/formatter';
import { getImageUrl } from 'common/utils/getImageUrl';
import request from 'common/utils/http-request';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { copy } from 'common/utils/copy';
import { useAuth } from '~/hooks/useAuth';

const { Title, Paragraph, Text } = Typography;

const CartCompletion = () => {
    const router = useRouter();
    const [qrCode, setQRCode] = useState<string | undefined>();
    const [appTransId, setAppTransId] = useState<string | undefined>('');
    const [secondsToGo, setSecondsToGo] = useState(60);
    const auth = useAuth();

    const [visibleReceiverInformation, setVisibleReceiverInformation] =
        useState(true);
    const [visibleProductInformation, setVisibleProductInformation] =
        useState(true);
    const [visiblePaymentInformation, setVisiblePaymentInformation] =
        useState(true);

    const { data: orderDetail, isLoading: isLoadingOrder } = useQuery<Order>({
        queryKey: ['order-completion', router.query.orderId],
        queryFn: () =>
            request
                .get(`/order-completion/${router.query.orderId}`)
                .then((res) => res.data)
                .then((res) => res.data),
    });

    const { mutateAsync: ZLCreateOrder } = useMutation({
        mutationFn: (data: { orderId: string; amount: number }) =>
            request
                .post('/zalo-pay/create-order', data)
                .then((res) => res.data)
                .then((res) => res.data),
    });

    const { mutateAsync: ZLCheckStatusOrder } = useMutation({
        mutationFn: (order: { appTransId: string }) =>
            request
                .post('/zalo-pay/check-status-order', order)
                .then((res) => res.data)
                .then((res) => res.data),
    });

    const { mutateAsync: updateStatusOrderAfterPayment } = useMutation({
        mutationFn: (order: { id: string }) => {
            return request.put(
                `/order/update-status-after-payment/${order.id}`
            );
        },
    });

    const { data: isAcceptDetail, isLoading: isLoadingCheckAcceptDetail } =
        useQuery<{
            isOk: boolean;
        }>({
            queryKey: ['check-accept-order-detail', auth],
            queryFn: () =>
                request
                    .get(`/check-accept-order-detail/${router.query.orderId}`)
                    .then((res) => res.data),
            enabled: !!auth,
        });

    useEffect(() => {
        (async () => {
            if (
                orderDetail &&
                orderDetail.paymentMethod === 'BANK_TRANSFER' &&
                orderDetail.status === 'PAYMENT_PENDING'
            ) {
                const res: ZLPayResponse = await ZLCreateOrder({
                    orderId: orderDetail.id ?? '',
                    amount: Number(orderDetail.totalAmount) ?? 0,
                });

                setQRCode(res?.orderUrl);
                setAppTransId(res?.appTransId);
            }
        })();
    }, [orderDetail]);

    useEffect(() => {
        const checkPaymentStatus = setInterval(async () => {
            if (
                orderDetail?.paymentMethod === 'BANK_TRANSFER' &&
                orderDetail.status === 'PAYMENT_PENDING' &&
                secondsToGo > 0
            ) {
                // interval query order ZLP status
                const res = await ZLCheckStatusOrder({
                    appTransId: appTransId ?? '',
                });

                const returnCode = res?.data?.return_code;
                if (returnCode === 1) {
                    await updateStatusOrderAfterPayment({
                        id: orderDetail?.id ?? '',
                    });
                    toast.success('Thanh toán thành công');
                    router.push('/my-page/my-order/');
                }
            }
        }, 1000);

        return () => {
            clearInterval(checkPaymentStatus);
        };
    });

    useEffect(() => {
        const timer = setInterval(() => {
            if (secondsToGo > 0) {
                setSecondsToGo(secondsToGo - 1);
            }
            if (secondsToGo === 0) {
                clearInterval(timer);
            }
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    });

    return (
        <Spin spinning={isLoadingOrder || isLoadingCheckAcceptDetail}>
            <div className="w-full text-base">
                <div className="flex  w-full justify-center">
                    <div className="flex w-[1000px] min-w-[500px] max-w-[1000px] flex-col items-center space-y-4">
                        <div className="w-full space-y-2 text-center">
                            <p className=" space-x-2 text-[#f43f5e]">
                                <ClockCircleOutlined />
                                <span>Cảm ơn bạn đã mua hàng!</span>
                            </p>
                            <p className="text-[#f43f5e]">
                                Đơn hàng của bạn đang được xử lí
                            </p>
                            <p>
                                <span>Mã đơn hàng: {orderDetail?.id} </span>
                                <span>
                                    <Button
                                        icon={<CopyOutlined />}
                                        onClick={() => {
                                            if (orderDetail?.id) {
                                                copy(orderDetail?.id);
                                                toast.success(
                                                    'Sao chép mã đơn hàng thành công.'
                                                );
                                            }
                                        }}
                                        type="text"
                                    />
                                </span>
                            </p>
                            <p>
                                Trạng thái đơn hàng:{' '}
                                {
                                    orderStatus[
                                        orderDetail?.status as keyof typeof orderStatus
                                    ]
                                }
                            </p>
                            <p>
                                Đặt hàng vào{' '}
                                {moment(orderDetail?.createdAt).format(
                                    'YYYY-MM-DD'
                                )}
                            </p>
                        </div>
                        <div className="flex w-full items-center space-x-4">
                            <div className="flex w-full border-spacing-2 items-center justify-center space-x-4 rounded-lg border border-solid px-6 py-3">
                                <MailOutlined className="text-[#f43f5e]" />
                                <span>
                                    Thông báo về yêu cầu đặt hàng của bạn đã
                                    được gửi tới: {orderDetail?.email}
                                </span>
                            </div>
                        </div>
                        {isAcceptDetail && (
                            <div className="flex items-center">
                                <Button
                                    onClick={() =>
                                        router.push(
                                            `my-page/my-order/${orderDetail?.id}`
                                        )
                                    }
                                    size="large"
                                >
                                    Chi tiết đơn hàng
                                </Button>
                            </div>
                        )}

                        {/* Thông tin thanh toán */}
                        <div className="w-full border-spacing-2 flex-col items-center justify-center rounded-lg  border border-solid p-4 pt-0">
                            <div
                                className="flex cursor-pointer items-center justify-between pt-4 font-bold"
                                onClick={() => {
                                    setVisiblePaymentInformation(
                                        !visiblePaymentInformation
                                    );
                                }}
                                role="presentation"
                            >
                                <h3>Thông tin thanh toán</h3>
                                <div className="pr-2 transition-transform duration-500 ease-in-out">
                                    <DownOutlined
                                        className={` transform transition-transform duration-300 ease-in-out ${visiblePaymentInformation && 'rotate-180'}`}
                                    />
                                </div>
                            </div>
                            <div
                                className={`transform transition-all duration-300 ease-in-out ${
                                    visiblePaymentInformation
                                        ? 'max-h-screen opacity-100'
                                        : 'max-h-0 opacity-0'
                                } overflow-hidden`}
                            >
                                <p>
                                    Phương thức thanh toán:{' '}
                                    {
                                        orderPaymentMethod[
                                            orderDetail?.paymentMethod as keyof typeof orderPaymentMethod
                                        ]
                                    }
                                </p>
                                {orderDetail?.paymentMethod ===
                                    'BANK_TRANSFER' &&
                                    orderDetail?.status !==
                                        'PAYMENT_PENDING' && (
                                        <p>Đã thanh toán</p>
                                    )}

                                <div className=" flex w-full flex-col items-center space-y-2 pt-2">
                                    {orderDetail?.paymentMethod ===
                                        'BANK_TRANSFER' &&
                                        orderDetail.status ===
                                            'PAYMENT_PENDING' && (
                                            <>
                                                <Title
                                                    className="flex items-center gap-2 text-3xl"
                                                    level={4}
                                                    type="secondary"
                                                >
                                                    Thanh toán với
                                                    <img
                                                        alt=""
                                                        className="h-10"
                                                        id="zlp-logo-image"
                                                        src="/images/logozlp.png"
                                                    />{' '}
                                                </Title>
                                                <Paragraph className="flex space-x-2 text-base">
                                                    <Spin />
                                                    <div className="flex space-x-1">
                                                        <span>
                                                            Thời gian quét mã QR
                                                            để thanh toán
                                                        </span>
                                                        <Text type="danger">
                                                            {Math.floor(
                                                                secondsToGo / 60
                                                            )}
                                                        </Text>{' '}
                                                        <span>phút</span>
                                                        <Text type="danger">
                                                            {secondsToGo % 60}
                                                        </Text>{' '}
                                                        <span>giây</span>
                                                    </div>
                                                </Paragraph>
                                                {secondsToGo > 0 ? (
                                                    <>
                                                        <QRCode
                                                            size={200}
                                                            value={qrCode ?? ''}
                                                        />
                                                        <ul className="space-y-2 text-base">
                                                            <Text
                                                                className="-ml-8 text-base"
                                                                strong
                                                            >
                                                                Cách thức thanh
                                                                toán:{' '}
                                                            </Text>
                                                            <li>
                                                                <p>
                                                                    Bước 1: Mở
                                                                    ứng dung{' '}
                                                                    <Text
                                                                        className="text-[#f43f5e]"
                                                                        strong
                                                                    >
                                                                        ZaloPay
                                                                    </Text>
                                                                </p>
                                                            </li>
                                                            <li>
                                                                <p className="flex w-full">
                                                                    Bước 2: Chọn{' '}
                                                                    <Text
                                                                        className="text-[#f43f5e]"
                                                                        strong
                                                                    >
                                                                        "Thanh
                                                                        Toán"
                                                                    </Text>
                                                                    <img
                                                                        alt=""
                                                                        className="checkout-image"
                                                                        src="/images/qr-scan-zlp.png"
                                                                    />
                                                                    và quét mã
                                                                </p>
                                                            </li>
                                                            <li>
                                                                <p>
                                                                    Bước 3:{' '}
                                                                    <Text
                                                                        className="text-[#f43f5e]"
                                                                        strong
                                                                    >
                                                                        Xác nhận
                                                                        thanh
                                                                        toán
                                                                    </Text>{' '}
                                                                    trên ứng
                                                                    dụng Zalo
                                                                </p>
                                                            </li>
                                                        </ul>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p>
                                                            Thời gian giao dịch
                                                            hết hiệu lực.
                                                        </p>
                                                        <Button
                                                            onClick={() =>
                                                                setSecondsToGo(
                                                                    60
                                                                )
                                                            }
                                                            type="primary"
                                                        >
                                                            Tạo giao dịch mới
                                                        </Button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                </div>
                            </div>
                        </div>
                        {/* Thông tin nhận hàng */}
                        <div className="w-full border-spacing-2 flex-col items-center justify-center rounded-lg  border border-solid p-4 pt-0">
                            <div
                                className="flex cursor-pointer items-center justify-between pt-4 font-bold"
                                onClick={() => {
                                    setVisibleReceiverInformation(
                                        !visibleReceiverInformation
                                    );
                                }}
                                role="presentation"
                            >
                                <h3>Thông tin nhận hàng</h3>
                                <div className="pr-2 transition-transform duration-500 ease-in-out">
                                    <DownOutlined
                                        className={` transform transition-transform duration-300 ease-in-out ${visibleReceiverInformation && 'rotate-180'}`}
                                    />
                                </div>
                            </div>
                            <div
                                className={`transform transition-all duration-300 ease-in-out ${
                                    visibleReceiverInformation
                                        ? 'max-h-screen opacity-100'
                                        : 'max-h-0 opacity-0'
                                } overflow-hidden`}
                            >
                                <div
                                    className="grid  grid-cols-2 items-center space-y-2 pt-2"
                                    role="menu"
                                >
                                    <span>Người nhận:</span>
                                    <span className="ml-1">
                                        {orderDetail?.name}
                                    </span>
                                    <span>Giới tính:</span>
                                    <span className="ml-1">
                                        {
                                            genderType[
                                                orderDetail?.gender as keyof typeof genderType
                                            ]
                                        }
                                    </span>
                                    <span>Email:</span>
                                    <span className="ml-1">
                                        {orderDetail?.email}
                                    </span>
                                    <span>Số điện thoại:</span>
                                    <span className="ml-1">
                                        {orderDetail?.phone}
                                    </span>
                                    <span>Địa chỉ:</span>
                                    <span className="ml-1">
                                        {orderDetail?.address}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Chi tiết đơn hàng */}
                        <div className="w-full rounded-lg border border-solid p-4 pt-0">
                            <div
                                className="flex cursor-pointer items-center justify-between pt-4 font-bold"
                                onClick={() => {
                                    setVisibleProductInformation(
                                        !visibleProductInformation
                                    );
                                }}
                                role="presentation"
                            >
                                <h3>Thông tin sản phẩm</h3>
                                <div className="pr-2 transition-transform duration-500 ease-in-out">
                                    <DownOutlined
                                        className={` transform transition-transform duration-300 ease-in-out ${visibleProductInformation && 'rotate-180'}`}
                                    />
                                </div>
                            </div>
                            <div
                                className={`transform transition-all duration-300 ease-in-out ${
                                    visibleProductInformation
                                        ? 'max-h-screen opacity-100'
                                        : 'max-h-0 opacity-0'
                                } overflow-hidden`}
                            >
                                {orderDetail?.orderDetail?.map((detail) => (
                                    <Card
                                        bordered={false}
                                        className="my-2"
                                        hoverable
                                        key={detail.id}
                                        onClick={() =>
                                            router.push(
                                                `/product/${detail.productId}`
                                            )
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
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Thành tiền */}
                            <div className="flex items-center justify-end text-center">
                                <span className="text-primary text-2xl">
                                    {currencyFormatter(
                                        Number(orderDetail?.totalAmount)
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Spin>
    );
};

export default CartCompletion;
