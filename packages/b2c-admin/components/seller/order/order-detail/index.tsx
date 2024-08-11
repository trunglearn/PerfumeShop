import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import * as request from 'common/utils/http-request';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QueryErrorType, QueryResponseGetOneType } from 'common/types';
import { Button, Image, Select, Spin } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { copy } from 'common/utils/copy';
import { toast } from 'react-toastify';
import moment from 'moment';
import { currencyFormatter } from 'common/utils/formatter';
import { useUserQueryStore } from 'common/store/useUserStore';
import { ORDER_STATUS } from 'common/constant';
import { getImageUrl } from 'common/utils/getImageUrl';
import { cn } from 'common/utils';
import { Order } from '~/types/order';
import OrderDetailItem from './order-detail-item';
import AssignSeller from '../assign-seller';
import { useAuthCms } from '~/hooks/useAuthCms';
import OrderActivity, { OrderActivityHandle } from './order-activity';
import SaleNoteForm from './sale-note-form';

const OrderDetail = () => {
    const auth = useAuthCms();
    const { user } = useUserQueryStore();
    const { query } = useRouter();

    const activityRef = useRef<OrderActivityHandle>(null);

    const { data, isFetching, error, refetch } = useQuery<
        QueryResponseGetOneType<Order>,
        QueryErrorType
    >({
        queryKey: ['order-detail-cms', query.id],
        queryFn: () =>
            request
                .get(`order/order-detail-cms/${query.id}`)
                .then((res) => res.data),
        enabled: !!query.id,
    });

    const { mutate } = useMutation({
        mutationFn: ({
            orderId,
            status,
        }: {
            orderId: string;
            status: string;
        }) =>
            request
                .put(`order/update-status/${orderId}`, { status })
                .then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res.message);
            activityRef.current?.reload();
            refetch();
        },
        onError: () => {
            toast.error('Something went wrong!');
        },
    });

    if (error && !error.response?.data?.isOk) {
        return <div>{error.response?.data?.message}</div>;
    }

    return (
        <Spin spinning={isFetching}>
            <div>
                <div className="border-t-2 border-t-black">
                    <OrderDetailItem title="ID">
                        <div className="flex items-center gap-x-4">
                            <p>{data?.data?.id}</p>
                            <div>
                                <Button
                                    icon={<CopyOutlined />}
                                    onClick={async () => {
                                        if (!data?.data?.id) {
                                            return;
                                        }
                                        await copy(data.data.id);
                                        toast.success('Copied Order ID.');
                                    }}
                                    type="text"
                                />
                            </div>
                        </div>
                    </OrderDetailItem>
                    <OrderDetailItem title="Customer full name">
                        {data?.data?.user?.name || data?.data?.name}
                    </OrderDetailItem>
                    <OrderDetailItem title="Email">
                        {data?.data?.user?.email || data?.data?.email}
                    </OrderDetailItem>
                    <OrderDetailItem title="Phone number">
                        {data?.data?.user?.phone || data?.data?.phone}
                    </OrderDetailItem>
                    <OrderDetailItem title="Order date">
                        {data?.data?.createdAt &&
                            moment(data.data.createdAt).format(
                                'HH:mm DD-MM-YYYY'
                            )}
                    </OrderDetailItem>
                    <OrderDetailItem title="Total cost">
                        {data?.data?.totalAmount &&
                            currencyFormatter(data.data.totalAmount)}
                    </OrderDetailItem>
                    <OrderDetailItem title="Status">
                        {(user && user.data?.id === data?.data?.seller?.id) ||
                        auth?.role === 'SELLERMANAGER' ? (
                            <Select
                                className="w-[160px]"
                                onChange={(selected) => {
                                    if (!data?.data?.id) {
                                        return;
                                    }
                                    mutate({
                                        orderId: data?.data?.id,
                                        status: selected,
                                    });
                                }}
                                optionFilterProp="label"
                                options={ORDER_STATUS}
                                placeholder="Select a status"
                                value={data?.data?.status}
                            />
                        ) : (
                            <div>{data?.data?.status}</div>
                        )}
                    </OrderDetailItem>
                    <OrderDetailItem title="Sale name">
                        <div className="py-2">
                            {data?.data?.id && (
                                <AssignSeller
                                    orderId={data?.data?.id}
                                    reload={() => {
                                        activityRef.current?.reload();
                                        refetch();
                                    }}
                                    seller={data?.data?.seller}
                                />
                            )}
                        </div>
                    </OrderDetailItem>
                    <OrderDetailItem title="Receiver information">
                        <div className="space-y-1 py-2">
                            <div>
                                <span className="font-medium">Full name:</span>{' '}
                                {data?.data?.name}
                            </div>
                            <div>
                                <span className="font-medium">Gender:</span>{' '}
                                {data?.data?.gender}
                            </div>
                            <div>
                                <span className="font-medium">Email:</span>{' '}
                                {data?.data?.email}
                            </div>
                            <div>
                                <span className="font-medium">Phone:</span>{' '}
                                {data?.data?.phone}
                            </div>
                            <div>
                                <span className="font-medium">Address:</span>{' '}
                                {data?.data?.address}
                            </div>
                        </div>
                    </OrderDetailItem>
                    <OrderDetailItem title="Customer note">
                        <div>{data?.data?.notes}</div>
                    </OrderDetailItem>
                    <OrderDetailItem title="Ordered Products">
                        <div className="space-y-2 py-2">
                            {data?.data?.orderDetail?.map((item) => (
                                <div className="flex gap-x-4" key={item.id}>
                                    <div>
                                        <Image
                                            alt=""
                                            className="!size-[100px] rounded-md object-cover"
                                            src={getImageUrl(item?.thumbnail)}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold">
                                            {item?.productName}
                                        </div>
                                        <div className="text-slate-400">
                                            {item?.category}
                                        </div>
                                        <div className="font-medium">
                                            x{item?.quantity}
                                        </div>
                                        <div className="flex gap-x-2">
                                            <div
                                                className={cn(
                                                    'font-medium',
                                                    item?.discountPrice &&
                                                        'text-sm text-slate-400 line-through'
                                                )}
                                            >
                                                {item?.originalPrice &&
                                                    currencyFormatter(
                                                        item.originalPrice
                                                    )}
                                            </div>
                                            {item?.discountPrice && (
                                                <div className="font-medium">
                                                    {item?.discountPrice &&
                                                        currencyFormatter(
                                                            item.discountPrice
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <span>Total: </span>
                                            <span className="text-lg font-semibold text-rose-500">
                                                {item?.totalPrice &&
                                                    currencyFormatter(
                                                        item.totalPrice
                                                    )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </OrderDetailItem>
                </div>
                <div className="mt-4">
                    <SaleNoteForm
                        orderId={data?.data?.id ?? ''}
                        reloadActivity={() => {
                            activityRef.current?.reload();
                        }}
                        reloadDetail={() => {
                            refetch();
                        }}
                        saleNote={data?.data?.saleNote}
                    />
                </div>
                <div className="mt-4">
                    <OrderActivity
                        orderId={data?.data?.id ?? ''}
                        ref={activityRef}
                    />
                </div>
            </div>
        </Spin>
    );
};

export default OrderDetail;
