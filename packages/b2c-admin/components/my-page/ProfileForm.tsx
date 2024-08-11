import React, { useEffect, useState } from 'react';
import {
    Button,
    Form,
    Input,
    message,
    Spin,
    Typography,
    Upload,
    UploadFile,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import request, { get } from 'common/utils/http-request';
import { useMutation } from '@tanstack/react-query';
import { getImageUrl } from 'common/utils/getImageUrl';
import moment from 'moment';
import { RcFile, UploadProps } from 'antd/es/upload';
import { toast } from 'react-toastify';
import Avatar from 'common/components/avatar';
import { useUserQueryStore } from 'common/store/useUserStore';
import EditProfilePopup from './EditProfilePopup';
import styles from '~/styles/my-page/ProfileForm.module.css';

const { Title } = Typography;

const ProfileForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [uploadedImageName, setUploadedImageName] = useState(avatarUrl);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [checkUpdateImg, setCheckUpdateImg] = useState(false);
    const [checkHideImg, setCheckHideImg] = useState(false);
    const { reload } = useUserQueryStore();

    const mapGender = (gender: string) => {
        if (gender === 'MALE') return 'Male';
        if (gender === 'FEMALE') return 'Female';
        return '';
    };

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const response = await get('/user-profile');
            const userData = response.data.data;

            form.setFieldsValue({
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                gender: mapGender(userData.gender),
                dob: userData.dob
                    ? moment(userData.dob).format('DD/MM/YYYY')
                    : '',
                address: userData.address,
            });

            if (userData.image) {
                setAvatarUrl(getImageUrl(userData.image));
            }
        } catch (error) {
            message.error('Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        setCheckUpdateImg(false);
    }, [form, checkUpdateImg]);

    const handlePopupClose = () => {
        setIsModalVisible(false);
        fetchUserProfile();
    };

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

    const { mutateAsync: updateUserImage } = useMutation({
        mutationFn: (image: string) => {
            return request.put('/user-profile/update-image', { image });
        },
        onSuccess: () => {
            message.success('Profile updated successfully');
            setFileList([]);
            setUploadedImageName('');
            setCheckUpdateImg(true);
            setCheckHideImg(false);
            setTimeout(() => {
                reload();
            });
        },
        onError: (err) => {
            const error = err as Error;
            message.error(error.message || 'Failed to update profile');
        },
    });

    const beforeUpload = (file: UploadFile) => {
        const isImage = file.type && file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
            return Upload.LIST_IGNORE;
        }
        return isImage;
    };

    const handleChange = ({
        fileList: newFileList,
    }: {
        fileList: UploadFile[];
    }) => setFileList(newFileList);

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

    const handleUpdateImage = async () => {
        try {
            let newUploadedImageName = uploadedImageName;

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

            // Loại bỏ phần URL khỏi tên ảnh, chỉ lưu tên ảnh
            const imageName = `${newUploadedImageName.split('/').pop()}`;

            await updateUserImage(imageName);
        } catch (err) {
            const error = err as Error;
            message.error(error.message || 'Failed to update profile');
        }
    };

    const handleDisplayImg = () => {
        setCheckHideImg(true);
    };

    const openModal = () => {
        setFileList([]); // Clear file list before opening modal
        setIsModalVisible(true);
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
        <Spin spinning={loading}>
            <div className={styles.profileFormContainer}>
                <Title level={3}>My Profile</Title>

                <Form
                    form={form}
                    initialValues={{
                        name: '',
                        email: '',
                        phone: '',
                        gender: 'Khác',
                        dob: '',
                        address: '',
                    }}
                    layout="horizontal"
                    name="profile"
                    style={{ marginTop: '20px' }}
                >
                    <div className={styles.formContent}>
                        <div className={styles.formLeft}>
                            <Form.Item
                                {...formItemLayout}
                                label="Email"
                                name="email"
                            >
                                <Input readOnly />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Name"
                                name="name"
                            >
                                <Input readOnly />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Phone number"
                                name="phone"
                            >
                                <Input readOnly />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Gender"
                                name="gender"
                            >
                                <Input
                                    readOnly
                                    value={form.getFieldValue('gender')}
                                />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Date of birth"
                                name="dob"
                            >
                                <Input readOnly />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Address"
                                name="address"
                            >
                                <Input readOnly />
                            </Form.Item>
                        </div>
                        <div className={styles.verticalDivider} />
                        <div className={styles.formRight}>
                            <Avatar height={150} src={avatarUrl} width={150} />
                            {/* {avatarUrl ? (
                                <img
                                    alt="Avatar"
                                    className={styles.avatarImage}
                                    src={avatarUrl}
                                />
                            ) : (
                                <UserOutlined className={styles.profileIcon} />
                            )} */}
                            <div>Avatar</div>
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
                                    showUploadList={checkHideImg}
                                >
                                    <Button
                                        className={styles.btnUpdateImg}
                                        icon={<UploadOutlined />}
                                        onClick={handleDisplayImg}
                                    >
                                        Select Image
                                    </Button>
                                </Upload>
                            </Form.Item>
                            <Button
                                className={styles.btnUpdateImg}
                                icon={<UploadOutlined />}
                                onClick={handleUpdateImage}
                                style={{
                                    display:
                                        fileList.length > 0 ? 'block' : 'none',
                                }}
                            >
                                Update
                            </Button>
                        </div>
                    </div>
                    <Form.Item>
                        <Button
                            htmlType="submit"
                            onClick={openModal}
                            type="primary"
                        >
                            Edit Profile
                        </Button>
                    </Form.Item>
                </Form>
                <EditProfilePopup
                    onClose={handlePopupClose}
                    visible={isModalVisible}
                />
            </div>
        </Spin>
    );
};

export default ProfileForm;
