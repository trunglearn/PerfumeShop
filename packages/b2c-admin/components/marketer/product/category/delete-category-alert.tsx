import { DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import React, { useState } from 'react';
import * as request from 'common/utils/http-request';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

type Props = {
    categoryId: string;
    name: string;
    reloadList: () => void;
};

const DeleteCategoryAlert: React.FC<Props> = ({
    categoryId,
    name,
    reloadList,
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            request
                .del(`category/delete/${categoryId}`)
                .then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res.message);
            setTimeout(() => {
                setIsOpen(false);
                reloadList();
            }, 500);
        },
        onError: () => {
            toast.error('Something went wrong!');
        },
    });

    const handleDelete = () => {
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
                onCancel={() => setIsOpen(false)}
                onOk={handleDelete}
                open={isOpen}
                title="Delete category"
            >
                <div className="flex flex-col items-center gap-y-2">
                    <p className="text-base text-rose-400">
                        <span>Do you want delete category </span>
                        <span className="font-semibold text-rose-700">
                            {name}
                        </span>
                        ?
                    </p>
                    <p className="text-slate-500">
                        ID:{' '}
                        <span className="font-semibold text-slate-800">
                            {categoryId}
                        </span>
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default DeleteCategoryAlert;
