import React, { useEffect, useState } from 'react';
import {
    Button,
    DatePicker,
    Form,
    Input,
    message,
    Modal,
    Radio,
    Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Avatar from 'common/components/avatar';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { RcFile, UploadFile, UploadProps } from 'antd/es/upload';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import request, { get } from 'common/utils/http-request';
import { getImageUrl } from 'common/utils/getImageUrl';
import { useUserQueryStore } from 'common/store/useUserStore';
import { PHONE_PATTERN } from 'common/constant/pattern';
import styles from '~/styles/my-page/EditProfilePopup.module.css';

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    gender?: string;
    dob?: string | null;
    address?: string;
    image?: string;
}
const mapGender = (gender: string | undefined) => {
    if (gender === 'MALE') return 'Nam';
    if (gender === 'FEMALE') return 'Nữ';
    return undefined;
};
const mapGenderToAPI = (gender: string | undefined) => {
    if (gender === 'Nam') return 'MALE';
    if (gender === 'Nữ') return 'FEMALE';
    return undefined;
};
interface EditProfilePopupProps {
    visible: boolean;
    onClose: () => void;
}

const EditProfilePopup: React.FC<EditProfilePopupProps> = ({
    visible,
    onClose,
}) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploadedImageName, setUploadedImageName] = useState('');
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
        useState(false);
    const [initialValues, setInitialValues] = useState<UserProfile | null>(
        null
    );
    const { reload } = useUserQueryStore();

    const { mutateAsync: uploadFileTrigger } = useMutation({
        mutationFn: (files: RcFile[]) => {
            const formData = new FormData();
            files.forEach((file) => formData.append('files', file));
            return request.post('upload', formData).then((res) => res.data);
        },
        onError: () => {
            toast.error('Upload file failed!');
        },
    });

    const { mutateAsync: updateUserProfile } = useMutation({
        mutationFn: (data: Partial<UserProfile>) => {
            return request.put('/user-profile/update', data);
        },
        onSuccess: () => {
            message.success('User Profile updated successfully');
            form.resetFields();
            setFileList([]);
            setUploadedImageName('');
            onClose();
            setTimeout(() => reload());
        },
        onError: (err) => {
            const error = err as Error;
            message.error(error.message || 'Unable to update user information');
        },
    });

    useEffect(() => {
        if (visible) {
            const fetchUserProfile = async () => {
                try {
                    const response = await get('/user-profile');
                    const userData: UserProfile = response.data.data;
                    setInitialValues(userData);
                    form.setFieldsValue({
                        ...userData,
                        gender: mapGender(userData.gender),
                        dob: userData.dob ? dayjs(userData.dob) : null,
                    });
                    setUploadedImageName(getImageUrl(userData.image));
                    setFileList([]);
                    setTimeout(() => reload());
                } catch (error) {
                    message.error('Failed to load user profile');
                }
            };

            fetchUserProfile();
        }
    }, [visible, form]);

    const handleOk = async () => {
        setIsConfirmationModalVisible(true);
    };

    const handleConfirmOk = async () => {
        try {
            const values = await form.validateFields();

            // Trimming whitespace from string fields
            const trimmedValues = {
                ...values,
                name: values.name.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
                address: values.address?.trim() || null,
            };

            let newUploadedImageName = uploadedImageName;

            const profileChanged = () => {
                if (!initialValues) return true;

                const initialValuesFormatted = {
                    ...initialValues,
                    dob: initialValues.dob ? dayjs(initialValues.dob) : null,
                    gender: mapGender(initialValues.gender),
                };

                const isDobChanged = () => {
                    if (
                        trimmedValues.dob === null &&
                        initialValuesFormatted.dob === null
                    ) {
                        return false;
                    }
                    if (
                        trimmedValues.dob === null ||
                        initialValuesFormatted.dob === null
                    ) {
                        return true;
                    }
                    return (
                        trimmedValues.dob.format('YYYY-MM-DD') !==
                        initialValuesFormatted.dob.format('YYYY-MM-DD')
                    );
                };

                return (
                    trimmedValues.name !== initialValuesFormatted.name ||
                    trimmedValues.phone !== initialValuesFormatted.phone ||
                    trimmedValues.gender !== initialValuesFormatted.gender ||
                    isDobChanged() ||
                    trimmedValues.address !== initialValuesFormatted.address ||
                    fileList.length > 0
                );
            };

            if (!profileChanged()) {
                message.warning(
                    'Update failed. Please change or leave out the space at the end of the information field.'
                );
                setIsConfirmationModalVisible(false);
                return;
            }

            if (fileList.length > 0) {
                const fileListToUpload = fileList.map(
                    (file) => file.originFileObj as RcFile
                );

                if (fileListToUpload.length > 0) {
                    const uploadResponse =
                        await uploadFileTrigger(fileListToUpload);
                    const { imageUrls } = uploadResponse;

                    if (imageUrls && imageUrls.length > 0) {
                        [newUploadedImageName] = imageUrls;
                        setUploadedImageName(newUploadedImageName);
                    } else {
                        throw new Error(
                            'Image upload failed, no image URLs returned'
                        );
                    }
                }
            }

            const imageName = newUploadedImageName.split('/').pop();

            const updateData = {
                ...trimmedValues,
                gender: mapGenderToAPI(trimmedValues.gender),
                image: imageName || '',
                dob: trimmedValues.dob
                    ? trimmedValues.dob.format('YYYY-MM-DD')
                    : null,
            };

            delete updateData.avatar;

            await updateUserProfile(updateData);
            setIsConfirmationModalVisible(false);
        } catch (err) {
            const error = err as Error;
            message.error(error.message || 'Unable to update user information');
        }
    };

    const handleChange = ({
        fileList: newFileList,
    }: {
        fileList: UploadFile[];
    }) => setFileList(newFileList);

    const beforeUpload = (file: UploadFile) => {
        const isImage = file.type && file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
            return Upload.LIST_IGNORE;
        }
        return isImage;
    };

    const normFile = (e: { fileList: UploadFile[] }) => {
        return e?.fileList;
    };

    const customItemRender: UploadProps['itemRender'] = (originNode) => {
        const customFileName = '';
        return React.cloneElement(originNode, {
            ...originNode.props,
            children: React.Children.map(
                originNode.props.children,
                (child, index) => {
                    if (index === 1 && React.isValidElement(child)) {
                        return React.cloneElement(child as React.ReactElement, {
                            children: customFileName,
                        });
                    }
                    return child;
                }
            ),
        } as React.ReactElement);
    };

    const getAvatarSrc = () => {
        if (!uploadedImageName) {
            return '/images/default_avatar.jpg';
        }

        if (uploadedImageName.startsWith('http')) {
            return uploadedImageName;
        }

        return getImageUrl(uploadedImageName);
    };

    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 8 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
        },
    };

    return (
        <>
            <Modal
                className={styles.editProfilePopup}
                onCancel={onClose}
                onOk={handleOk}
                open={visible}
                title="User Profile"
            >
                <Form form={form} layout="horizontal" name="edit_profile">
                    <div className={styles.formContent}>
                        <div className={styles.formLeft}>
                            <Form.Item
                                label="Email"
                                name="email"
                                {...formItemLayout}
                                help="Email cannot be changed."
                            >
                                <Input disabled />
                            </Form.Item>
                            <Form.Item
                                label="Name"
                                name="name"
                                {...formItemLayout}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter your name',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Phone number"
                                name="phone"
                                {...formItemLayout}
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please enter the phone number',
                                    },
                                    {
                                        pattern: PHONE_PATTERN,
                                        message:
                                            'Phone number is in wrong format',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Gender"
                                name="gender"
                                {...formItemLayout}
                            >
                                <Radio.Group>
                                    <Radio value="Nam">Male</Radio>
                                    <Radio value="Nữ">Female</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item
                                label="Date of birth"
                                name="dob"
                                {...formItemLayout}
                            >
                                <DatePicker
                                    defaultPickerValue={
                                        initialValues && initialValues.dob
                                            ? dayjs(initialValues.dob)
                                            : undefined
                                    }
                                    disabledDate={(current) =>
                                        current &&
                                        current > dayjs().endOf('day')
                                    }
                                    format="DD/MM/YYYY"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Address"
                                name="address"
                                {...formItemLayout}
                            >
                                <Input />
                            </Form.Item>
                        </div>
                        <div className={styles.verticalDivider} />
                        <div className={styles.formRight}>
                            <Avatar
                                height={150}
                                src={getAvatarSrc()}
                                width={150}
                            />
                            <Form.Item
                                getValueFromEvent={normFile}
                                name="avatar"
                            >
                                <Upload
                                    beforeUpload={beforeUpload}
                                    className={styles.uploadContainer}
                                    fileList={fileList}
                                    itemRender={customItemRender}
                                    listType="picture"
                                    maxCount={1}
                                    onChange={handleChange}
                                >
                                    <Button icon={<UploadOutlined />}>
                                        Select Image
                                    </Button>
                                </Upload>
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </Modal>
            <Modal
                className={styles.centeredModal}
                onCancel={() => setIsConfirmationModalVisible(false)}
                onOk={handleConfirmOk}
                open={isConfirmationModalVisible}
                title="Confirm update"
            >
                <p>Are you sure you want to update the information?</p>
            </Modal>
        </>
    );
};

export default EditProfilePopup;
