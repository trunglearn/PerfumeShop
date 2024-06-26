import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Button, Modal, Tooltip } from 'antd';
import request from 'common/utils/http-request';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
    userName: string;
    reload: () => void;
    userId?: string;
};

const DeleteUserModal: React.FC<Props> = ({ userName, reload, userId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { mutate: deleteUser, isPending: deleteUserIsPending } = useMutation({
        mutationFn: () => {
            return request
                .put(`/admin/delete-user/${userId}`)
                .then((res) => res.data);
        },
        onSuccess: (res) => {
            toast.success(res?.message);
            setTimeout(() => {
                setIsModalOpen(false);
                reload();
            }, 500);
        },
        onError: (error) => {
            toast.error(error?.message);
        },
    });

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        deleteUser();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Tooltip arrow={false} color="#cd1818" title="Delete user">
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={showModal}
                    shape="circle"
                    type="link"
                />
            </Tooltip>
            <Modal
                closable={!deleteUserIsPending}
                footer={[
                    <Button key="back" onClick={handleCancel} type="default">
                        Cancel
                    </Button>,

                    <Button
                        danger
                        key="submit"
                        onClick={handleOk}
                        type="default"
                    >
                        Delete
                    </Button>,
                ]}
                okText="Delete"
                onCancel={handleCancel}
                onOk={handleOk}
                open={isModalOpen}
                title={
                    <>
                        <ExclamationCircleFilled
                            style={{ fontSize: '20px', color: '#faad14' }}
                        />
                        <span className="ml-2">Delete user</span>
                    </>
                }
            >
                <p>Are you sure you want to delete {userName}</p>
            </Modal>
        </>
    );
};
DeleteUserModal.defaultProps = {
    userId: undefined,
};

export default DeleteUserModal;
