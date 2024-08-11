import React, { useState } from 'react';
import { Button, Form, Input, message, Modal } from 'antd';
import { useMutation } from '@tanstack/react-query';
import request from 'common/utils/http-request';

interface ChangePasswordPopupProps {
    visible: boolean;
    onClose: () => void;
}

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const ChangePasswordPopup: React.FC<ChangePasswordPopupProps> = ({
    visible,
    onClose,
}) => {
    const [form] = Form.useForm();
    const [confirmVisible, setConfirmVisible] = useState(false);

    const { mutateAsync: changePassword } = useMutation({
        mutationFn: (data: { oldPassword: string; newPassword: string }) => {
            return request.put('/user-profile/change-password', data);
        },
        onSuccess: () => {
            message.success('Mật khẩu đã được thay đổi thành công');
            form.resetFields();
            setConfirmVisible(false);
            onClose();
        },
        onError: (error: ErrorResponse) => {
            message.error(
                error.response?.data?.message || 'Mật khẩu thay đổi thất bại'
            );
            setConfirmVisible(false);
        },
    });

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const passwordRegex = /^.{8,}$/;
            if (!passwordRegex.test(values.newPassword)) {
                message.error('Mật khẩu mới phải dài ít nhất 8 ký tự');
                return;
            }
            if (values.newPassword === values.oldPassword) {
                message.error(
                    'Mật khẩu mới không được trùng với mật khẩu hiện tại'
                );
                return;
            }
            if (values.newPassword !== values.confirmPassword) {
                message.error('Mật khẩu mới không khớp');
                return;
            }
            setConfirmVisible(true);
        } catch (error) {
            // Handle other errors
        }
    };

    const confirmChangePassword = async () => {
        try {
            const values = await form.validateFields();
            await changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            });
        } catch (error) {
            // Handle errors
        }
    };

    const handleCancel = () => {
        setConfirmVisible(false);
    };

    return (
        <>
            <Modal
                footer={[
                    <Button key="back" onClick={onClose}>
                        Đóng
                    </Button>,
                    <Button key="submit" onClick={handleOk} type="primary">
                        Xác nhận
                    </Button>,
                ]}
                onCancel={onClose}
                title="Đổi mật khẩu"
                visible={visible}
            >
                <Form form={form} layout="vertical" name="change_password">
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="oldPassword"
                        rules={[
                            {
                                required: true,
                                message:
                                    'Vui lòng nhập mật khẩu hiện tại của bạn',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu mới của bạn',
                            },
                            {
                                min: 8,
                                message: 'Mật khẩu có độ dài tối thiểu 8 kí tự',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        rules={[
                            {
                                required: true,
                                message:
                                    'Vui lòng xác nhận mật khẩu mới của bạn',
                            },
                            {
                                min: 8,
                                message: 'Mật khẩu có độ dài tối thiểu 8 kí tự',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                cancelText="Hủy"
                centered
                okText="Xác nhận"
                onCancel={handleCancel}
                onOk={confirmChangePassword}
                title="Xác nhận thay đổi mật khẩu"
                visible={confirmVisible}
            >
                <p>Bạn có chắc chắn muốn thay đổi mật khẩu không?</p>
            </Modal>
        </>
    );
};

export default ChangePasswordPopup;
