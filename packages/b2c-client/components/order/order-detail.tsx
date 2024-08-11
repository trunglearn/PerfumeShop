import { CopyOutlined, LeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Image, Spin } from 'antd';
import {
    genderType,
    Order,
    orderPaymentMethod,
    orderStatus,
} from 'common/types/order';
import { currencyFormatter } from 'common/utils/formatter';
import { getImageUrl } from 'common/utils/getImageUrl';
import request from 'common/utils/http-request';
import moment from 'moment';
import { useRouter } from 'next/router';

import { copy } from 'common/utils/copy';
import { toast } from 'react-toastify';
import DeleteOrderAlert from './delete-order-alert';
import EditOrderModal from './edit-order-modal';
import FeedBackModal from '../modals/feedback-modal';

const OrderDetail = () => {
    const { query: routerQuery, back, push } = useRouter();

    const {
        data: orderDetail,
        isLoading: isLoadingOrder,
        refetch,
    } = useQuery<Order>({
        queryKey: ['order-detail', routerQuery.id],
        queryFn: () =>
            request
                .get(`/order-detail/${routerQuery.id}`)
                .then((res) => res.data)
                .then((res) => res.data),
    });

    return (
        <div>
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
                                    icon={<LeftOutlined />}
                                >
                                    <span>Trở lại</span>
                                </Button>
                            </div>
                            <div className="flex items-center gap-4 ">
                                <span>
                                    Mã đơn hàng:
                                    <span className=" ml-1">
                                        {orderDetail?.id}
                                    </span>
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
                        <div className=" flex items-center justify-between bg-rose-50 p-4">
                            <div>
                                <span>
                                    Ngày đặt hàng:
                                    <span className="text-primary ml-1 text-lg">
                                        {moment(orderDetail?.createdAt).format(
                                            'DD-MM-YYYY'
                                        )}
                                    </span>
                                </span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {(orderDetail?.status === 'PENDING' ||
                                    orderDetail?.status === 'PAYMENT_PENDING' ||
                                    orderDetail?.status === 'PAID') && (
                                    <div>
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
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thông tin nhận hàng */}
                        <div className="space-y-4 border-b pb-4">
                            <span className="flex items-center text-lg font-semibold text-slate-500">
                                Thông tin nhận hàng
                            </span>
                            <div className="col-span-3 flex justify-between gap-4">
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
                                            {orderDetail?.phone}
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
                                    {(orderDetail?.status === 'PENDING' ||
                                        orderDetail?.status ===
                                            'PAYMENT_PENDING' ||
                                        orderDetail?.status === 'PAID') && (
                                        <EditOrderModal
                                            address={orderDetail?.address ?? ''}
                                            email={orderDetail?.email ?? ''}
                                            gender={orderDetail?.gender ?? ''}
                                            name={orderDetail?.name ?? ''}
                                            orderId={orderDetail?.id ?? ''}
                                            phone={orderDetail?.phone ?? ''}
                                            reload={() => refetch()}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sản phẩm  */}
                        <div className="flex flex-col gap-4">
                            {orderDetail?.orderDetail?.map((detail) => (
                                <div
                                    className="cursor-pointer rounded-lg border p-2 text-slate-600"
                                    onClick={() => {
                                        push(`/product/${detail.productId}`);
                                    }}
                                    role="presentation"
                                >
                                    <div className="flex h-full items-center">
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
                                                <p className="text-base">
                                                    x {detail?.quantity}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center gap-8">
                                                <div className="flex gap-2 text-base text-lg">
                                                    <p
                                                        className={
                                                            detail?.discountPrice
                                                                ? 'text-base text-gray-400 line-through'
                                                                : ''
                                                        }
                                                    >
                                                        {detail?.originalPrice &&
                                                            currencyFormatter(
                                                                Number(
                                                                    detail?.originalPrice
                                                                )
                                                            )}
                                                    </p>

                                                    {detail?.discountPrice && (
                                                        <p>
                                                            {currencyFormatter(
                                                                Number(
                                                                    detail?.discountPrice
                                                                )
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                                <div
                                                    className="flex flex-col gap-4"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    role="presentation"
                                                >
                                                    {orderDetail.status ===
                                                        'DELIVERED' &&
                                                    !detail.feedbackId ? (
                                                        <FeedBackModal
                                                            category={
                                                                detail.category ??
                                                                ''
                                                            }
                                                            orderDetailId={
                                                                detail.id ?? ''
                                                            }
                                                            productId={
                                                                detail?.productId ??
                                                                ''
                                                            }
                                                            productName={
                                                                detail.productName ??
                                                                ''
                                                            }
                                                            reload={refetch}
                                                            size={
                                                                detail.size?.toString() ??
                                                                ''
                                                            }
                                                            thumnail={
                                                                detail.thumbnail ??
                                                                ''
                                                            }
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Thành tiền */}
                        <div className="flex flex-col items-end pb-4">
                            <div className="text-end">
                                <div>
                                    <span>Thành tiền: </span>
                                    <span className="text-primary text-lg">
                                        {currencyFormatter(
                                            Number(orderDetail?.totalAmount)
                                        )}
                                    </span>
                                </div>
                                <p>
                                    <span>Phương thức thanh toán: </span>
                                    <span className="text-primary">
                                        {
                                            orderPaymentMethod[
                                                orderDetail?.paymentMethod as keyof typeof orderPaymentMethod
                                            ]
                                        }
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
        </div>
    );
};

export default OrderDetail;
