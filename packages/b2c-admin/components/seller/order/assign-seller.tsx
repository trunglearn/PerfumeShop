import {
    CaretDownOutlined,
    CaretUpOutlined,
    SearchOutlined,
    UserAddOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import Avatar from 'common/components/avatar';
import { User } from 'common/types/customer';
import { getImageUrl } from 'common/utils/getImageUrl';
import React, { ElementRef, useEffect, useRef, useState } from 'react';
import * as request from 'common/utils/http-request';
import { QueryResponseType } from 'common/types';
import { cn } from 'common/utils';
import { Input } from 'antd';
import { useDebounceValue } from 'usehooks-ts';
import { toast } from 'react-toastify';
import { useAuthCms } from '~/hooks/useAuthCms';
import { Seller } from '~/types/order';

type Props = {
    seller?: User | Seller | null;
    orderId: string | null;
    reload?: () => void;
};

const AssignSeller: React.FC<Props> = ({ seller, orderId, reload }) => {
    const auth = useAuthCms();

    const wrapperRef = useRef<ElementRef<'div'>>(null);

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [search, setSearch] = useState<string>();

    const [debouncedValue, setDebouncedValue] = useDebounceValue(search, 500);

    const { data } = useQuery<QueryResponseType<User>>({
        queryKey: ['seller-select', debouncedValue],
        queryFn: () =>
            request
                .get('/seller-select', {
                    params: {
                        search: debouncedValue,
                    },
                })
                .then((res) => res.data),
    });

    const { mutate } = useMutation({
        mutationFn: (assigneeId: string) =>
            request
                .put(`/order/update-assignee/${orderId}`, { assigneeId })
                .then((res) => res.data),
        onSuccess: (res) => {
            setIsOpen(false);
            toast.success(res.message);
            reload?.();
        },
        onError: () => {
            toast.error('Something went wrong!');
        },
    });

    useEffect(() => {
        setDebouncedValue(search);
    }, [search]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClickOutSide = (e: any) => {
        if (!wrapperRef.current?.contains(e.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutSide);

        return () => {
            document.removeEventListener('click', handleClickOutSide);
        };
    }, [wrapperRef, auth]);

    return (
        <div
            className={cn(
                'relative min-w-[150px] rounded-md border',
                auth?.role === 'SELLERMANAGER'
                    ? 'cursor-pointer select-none'
                    : null
            )}
            ref={wrapperRef}
            role="presentation"
        >
            <div
                className="p-2"
                onClick={() => {
                    if (auth && auth?.role === 'SELLERMANAGER') {
                        setIsOpen((prev) => !prev);
                    }
                }}
                role="presentation"
            >
                {seller ? (
                    <div className="flex items-center space-x-2">
                        <div>
                            <Avatar
                                height={30}
                                src={getImageUrl(seller?.image)}
                                width={30}
                            />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">{seller?.name}</p>
                            <p className="text-slate-500">{seller?.email}</p>
                        </div>
                        {auth?.role === 'SELLERMANAGER' && (
                            <div>
                                {isOpen ? (
                                    <CaretUpOutlined />
                                ) : (
                                    <CaretDownOutlined />
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex h-[30px] items-center gap-1 text-slate-400">
                        <UserAddOutlined />
                        <span>Select an Assignee</span>
                    </div>
                )}
            </div>
            {isOpen && (
                <div className="absolute top-16 z-30 w-full select-none rounded-md border bg-white">
                    <div className="p-2">
                        <Input
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                            placeholder="Enter seller name, email or phone..."
                            prefix={
                                <SearchOutlined className="text-slate-500" />
                            }
                            value={search}
                        />
                    </div>
                    <div>
                        {data?.data?.map((item) => (
                            <div
                                className={cn(
                                    'flex items-center space-x-2 p-2 hover:bg-slate-50',
                                    item.id === seller?.id &&
                                        'bg-slate-200 hover:bg-slate-200'
                                )}
                                onClick={() => {
                                    if (!item.id) {
                                        return;
                                    }
                                    mutate(item.id);
                                    setIsOpen(false);
                                }}
                                role="presentation"
                            >
                                <div
                                    className={cn(
                                        item.id === seller?.id
                                            ? 'rounded-full border-2 border-cyan-500'
                                            : 'rounded-full border-2 border-transparent'
                                    )}
                                >
                                    <Avatar
                                        height={30}
                                        src={getImageUrl(item?.image)}
                                        width={30}
                                    />
                                </div>
                                <div>
                                    <p className="font-medium">{item?.name}</p>
                                    <p className="text-slate-500">
                                        {item?.email}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

AssignSeller.defaultProps = {
    seller: undefined,
    reload: undefined,
};

export default AssignSeller;
