import { DeleteOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Button, Modal, Tooltip } from 'antd';
import React, { useState } from 'react';
import * as request from 'common/utils/http-request';
import { toast } from 'react-toastify';

type Props = {
    brandId: string;
    brandName: string;
    reloadList: () => void;
};

const DeleteBrand: React.FC<Props> = ({ brandId, brandName, reloadList }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            request.del(`brand/delete/${brandId}`).then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res.message);
            setTimeout(() => {
                reloadList();
                setIsOpen(false);
            }, 500);
        },
        onError: () => {
            toast.error('Something went wrong!');
            setTimeout(() => {
                setIsOpen(false);
            }, 500);
        },
    });

    const handleDeleteBrand = () => {
        if (!brandId) {
            return;
        }
        mutate();
    };

    return (
        <div>
            <Tooltip title="Delete">
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setIsOpen(true)}
                    type="text"
                />
            </Tooltip>
            <Modal
                closable={!isPending}
                confirmLoading={isPending}
                maskClosable={false}
                okButtonProps={{
                    danger: true,
                }}
                okType="primary"
                onCancel={() => setIsOpen(false)}
                onOk={handleDeleteBrand}
                open={isOpen}
                title="Delete brand"
            >
                <div className="flex flex-col items-center justify-center">
                    <p className="text-lg font-semibold text-rose-600">
                        <span className="text-rose-400">
                            Do you want delete brand
                        </span>{' '}
                        {brandName}?
                    </p>
                    <p className="font-semibold text-slate-500">
                        BrandID: <span className="text-base">{brandId}</span>
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default DeleteBrand;
