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
            message.success('Password changed successfully');
            form.resetFields();
            setConfirmVisible(false);
            onClose();
        },
        onError: (error: ErrorResponse) => {
            message.error(
                error.response?.data?.message || 'Password change failed'
            );
            setConfirmVisible(false);
        },
    });

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const passwordRegex = /^.{8,}$/;
            if (!passwordRegex.test(values.newPassword)) {
                message.error(
                    'New password must be at least 8 characters long'
                );
                return;
            }
            if (values.newPassword === values.oldPassword) {
                message.error(
                    'New password cannot be the same as current password'
                );
                return;
            }
            if (values.newPassword !== values.confirmPassword) {
                message.error('New password does not match');
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
                        Cancel
                    </Button>,
                    <Button key="submit" onClick={handleOk} type="primary">
                        Submit
                    </Button>,
                ]}
                onCancel={onClose}
                title="Change Password"
                visible={visible}
            >
                <Form form={form} layout="vertical" name="change_password">
                    <Form.Item
                        label="Current password"
                        name="oldPassword"
                        rules={[
                            {
                                required: true,
                                message: 'Please enter your current password',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="New password"
                        name="newPassword"
                        rules={[
                            {
                                required: true,
                                message: 'Please enter your new password',
                            },
                            {
                                min: 8,
                                message:
                                    'Password must be at least 8 characters long',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="Confirm new password"
                        name="confirmPassword"
                        rules={[
                            {
                                required: true,
                                message: 'Please confirm your new password',
                            },
                            {
                                min: 8,
                                message:
                                    'Password must be at least 8 characters long',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                cancelText="Cancel"
                centered
                okText="Confirm"
                onCancel={handleCancel}
                onOk={confirmChangePassword}
                title="Confirm Password Change"
                visible={confirmVisible}
            >
                <p>Are you sure you want to change your password?</p>
            </Modal>
        </>
    );
};

export default ChangePasswordPopup;
