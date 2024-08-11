/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/naming-convention */
import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Button,
    DatePicker,
    Form,
    FormProps,
    Input,
    Modal,
    Select,
    Tooltip,
    Upload,
    UploadFile,
} from 'antd';
import { RcFile } from 'antd/es/upload';
import * as request from 'common/utils/http-request';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

type Props = {
    type: 'CREATE' | 'EDIT' | 'VIEW';
    title: string;
    reload: () => void;
    userId?: string;
};

type FormType = {
    name: string;
    email: string;
    image: UploadFile[];
    role: string;
    gender: string;
    dob: string;
    phone: string;
    address: string;
    status: string;
};

type UserRequestType = {
    name: string;
    email: string;
    image: string;
    gender: string;
    role: string;
    status: string;
    dob: string;
    phone: string;
    address: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-lines-per-function
const UserFormModal: React.FC<Props> = ({ type, title, reload, userId }) => {
    const genderOptions = {
        MALE: 'Male',
        FEMALE: 'Female',
    };

    const roleOptions = {
        USER: 'User',
        ADMIN: 'Admin',
        SELLER: 'Seller',
        SELLERMANAGER: 'Seller Manager',
        MARKETER: 'Marketer',
    };

    const statusOptions = {
        ACTIVE: 'Active',
        INACTIVE: 'Inactive',
        NEWLY_REGISTER: 'Newly register',
        NEWLY_BOUGHT: 'Newly bought',
        BANNED: 'Banned',
    };

    const [form] = Form.useForm();
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const { mutateAsync: uploadFileTrigger, isPending: uploadFileIsPending } =
        useMutation({
            mutationFn: (files: RcFile[]) => {
                const formData = new FormData();
                files.forEach((file) => formData.append('files', file));
                return request.post('upload', formData).then((res) => res.data);
            },
            onError: () => {
                toast.error('Upload file failed!');
            },
        });

    const { mutate: createUser, isPending: createUserIsPending } = useMutation({
        mutationFn: (data: UserRequestType) => {
            return request
                .post('/admin/create-user', data)
                .then((res) => res.data);
        },
        onSuccess: (res) => {
            toast.success(res?.message);
            setTimeout(() => {
                setIsOpenModal(false);
                reload();
            }, 500);
        },
        onError: (error) => {
            toast.error(error?.message);
        },
    });

    const { mutate: editUser, isPending: editUserIsPending } = useMutation({
        mutationFn: (data: { role: string; status: string }) => {
            return request
                .put(`/admin/edit-user/${userId}`, data)
                .then((res) => res.data);
        },
        onSuccess: (res) => {
            toast.success(res?.message);
            setTimeout(() => {
                setIsOpenModal(false);
                reload();
            }, 500);
        },
        onError: (error) => {
            toast.error(error?.message);
        },
    });

    const { data: userDetail, isLoading: getUserIsPending } = useQuery({
        queryKey: ['user', userId],
        queryFn: () =>
            request.get(`/admin/user-detail/${userId}`).then((res) => res.data),
        enabled: !!isOpenModal && !!userId,
    });

    // useEffect(() => {
    //     if (isOpenModal) {
    //         form.resetFields();
    //     }
    // }, [isOpenModal]);

    useEffect(() => {
        if (isOpenModal && !userId) {
            form.resetFields();
        }
        if (isOpenModal && userId && userDetail) {
            form.setFieldsValue({
                name: userDetail?.data?.name,
                email: userDetail?.data?.email,
                role: userDetail?.data?.role,
                gender: userDetail?.data?.gender,
                status: userDetail?.data?.status,
                dob: userDetail?.data?.dob
                    ? dayjs(userDetail?.data?.dob)
                    : null,
                phone: userDetail?.data?.phone,
                address: userDetail?.data?.address,
                image: userDetail?.data?.image
                    ? [
                          {
                              uid: '-1',
                              name: userDetail?.data?.image ?? '',
                              status: 'done',
                              url: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${userDetail.data.image}`,
                          },
                      ]
                    : undefined,
            });
        }
    }, [isOpenModal, userId, userDetail]);

    const button = useMemo(() => {
        switch (type) {
            case 'CREATE':
                return (
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => setIsOpenModal(true)}
                        type="primary"
                    >
                        Create
                    </Button>
                );
            case 'EDIT':
                return (
                    <Tooltip arrow={false} color="#108ee9" title="Edit user">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => setIsOpenModal(true)}
                            shape="circle"
                            type="link"
                        />
                    </Tooltip>
                );
            case 'VIEW':
                return (
                    <Tooltip arrow={false} color="#108ee9" title="View user">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => setIsOpenModal(true)}
                            shape="circle"
                            type="link"
                        />
                    </Tooltip>
                );
            default:
                return null;
        }
    }, [type]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const onFinish: FormProps<FormType>['onFinish'] = async (values) => {
        if (type === 'CREATE') {
            const {
                name,
                email,
                image,
                status,
                role,
                gender,
                dob,
                phone,
                address,
            } = values;

            const avatar = image?.map((file) => file.originFileObj);

            const imageResponse = await uploadFileTrigger(
                (avatar as RcFile[]) ?? []
            )?.then((res) => res.imageUrls);

            createUser({
                name,
                email,
                role,
                gender,
                status,
                dob,
                phone,
                address,
                image: imageResponse[0] ?? '',
            });
        } else if (type === 'EDIT') {
            const { role, status } = values;
            editUser({
                role,
                status,
            });
        }
    };

    return (
        <div>
            {button}
            <Modal
                closable={
                    !uploadFileIsPending ||
                    !createUserIsPending ||
                    !getUserIsPending ||
                    !editUserIsPending
                }
                footer={false}
                maskClosable={false}
                onCancel={() => setIsOpenModal(false)}
                open={isOpenModal}
                title={title}
                width={800}
            >
                <div className="max-h-[75vh] overflow-auto px-5">
                    <Form
                        disabled={
                            uploadFileIsPending ||
                            createUserIsPending ||
                            getUserIsPending ||
                            editUserIsPending
                        }
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Form.Item
                            getValueFromEvent={normFile}
                            label="Avatar"
                            name="image"
                            valuePropName="fileList"
                        >
                            <Upload
                                accept=".png, .jpg, .jpeg"
                                beforeUpload={() => false}
                                disabled={type !== 'CREATE'}
                                listType="picture-card"
                                maxCount={1}
                                // onPreview={handlePreview}
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            </Upload>
                        </Form.Item>
                        <div className="grid grid-cols-2 gap-x-10">
                            <Form.Item<FormType>
                                label="Name"
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: 'User name must be required!',
                                    },
                                ]}
                            >
                                <Input
                                    disabled={type !== 'CREATE'}
                                    size="large"
                                />
                            </Form.Item>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your email!',
                                    },
                                    {
                                        type: 'email',
                                        message: 'Please enter a valid email!',
                                    },
                                ]}
                            >
                                <Input
                                    disabled={type !== 'CREATE'}
                                    size="large"
                                />
                            </Form.Item>
                            <Form.Item<FormType>
                                label="Role"
                                name="role"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Role must be required!',
                                    },
                                ]}
                            >
                                <Select disabled={type === 'VIEW'} size="large">
                                    {Object.values(roleOptions).map(
                                        (item: string) => (
                                            <Select.Option
                                                key={Object.values(
                                                    roleOptions
                                                ).indexOf(item)}
                                                value={
                                                    Object.keys(roleOptions)[
                                                        Object.values(
                                                            roleOptions
                                                        ).indexOf(item)
                                                    ]
                                                }
                                            >
                                                {item}
                                            </Select.Option>
                                        )
                                    )}
                                </Select>
                            </Form.Item>
                            <Form.Item<FormType>
                                label="Status"
                                name="status"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Status must be required!',
                                    },
                                ]}
                            >
                                <Select disabled={type === 'VIEW'} size="large">
                                    {Object.values(statusOptions).map(
                                        (item: string) => (
                                            <Select.Option
                                                key={Object.values(
                                                    statusOptions
                                                ).indexOf(item)}
                                                value={
                                                    Object.keys(statusOptions)[
                                                        Object.values(
                                                            statusOptions
                                                        ).indexOf(item)
                                                    ]
                                                }
                                            >
                                                {item}
                                            </Select.Option>
                                        )
                                    )}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Phone number"
                                name="phone"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input your phone number!',
                                    },
                                    {
                                        pattern:
                                            /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
                                        message:
                                            'Please enter a valid phone number!',
                                    },
                                ]}
                            >
                                <Input
                                    disabled={type !== 'CREATE'}
                                    size="large"
                                />
                            </Form.Item>
                            <Form.Item label="Address" name="address">
                                <Input
                                    disabled={type !== 'CREATE'}
                                    size="large"
                                />
                            </Form.Item>
                            <Form.Item<FormType> label="Gender" name="gender">
                                <Select
                                    disabled={type !== 'CREATE'}
                                    size="large"
                                >
                                    {Object.values(genderOptions).map(
                                        (item: string) => (
                                            <Select.Option
                                                key={Object.values(
                                                    genderOptions
                                                ).indexOf(item)}
                                                value={
                                                    Object.keys(genderOptions)[
                                                        Object.values(
                                                            genderOptions
                                                        ).indexOf(item)
                                                    ]
                                                }
                                            >
                                                {item}
                                            </Select.Option>
                                        )
                                    )}
                                </Select>
                            </Form.Item>
                            <Form.Item<FormType>
                                label="Date of birth"
                                name="dob"
                            >
                                <DatePicker
                                    disabled={type !== 'CREATE'}
                                    size="large"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item>
                            <Button
                                hidden={type === 'VIEW'}
                                htmlType="submit"
                                loading={createUserIsPending}
                                type="primary"
                            >
                                {type === 'CREATE' ? 'Create' : 'Edit'}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

UserFormModal.defaultProps = {
    userId: undefined,
};

export default UserFormModal;
