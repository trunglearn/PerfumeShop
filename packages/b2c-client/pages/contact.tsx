import React from 'react';
import { Button, Col, Form, Input, Layout, Row, Typography } from 'antd';
import {
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
} from '@ant-design/icons';
import styles from '../styles/Contact.module.css';

const { Title, Text } = Typography;

const Contact = () => {
    return (
        <Layout.Content className={styles.container}>
            <Title className={styles.title}>Liên hệ với chúng tôi</Title>

            <Row className={styles.infoRow} gutter={[24, 24]}>
                <Col className={styles.infoCol} md={8} sm={12} xs={24}>
                    <PhoneOutlined className={styles.icon} />
                    <Title className={styles.methodTitle} level={4}>
                        Hotline
                    </Title>
                    <Text className={styles.text}>
                        Gọi đến hotline chăm sóc khách hàng của chúng tôi tại
                        (123) 456-7890 (9h sáng – 9h tối) 7 ngày trong tuần nếu
                        bạn cần bất kỳ thông tin hoặc hỗ trợ nào từ The Perfume.
                    </Text>
                </Col>
                <Col className={styles.infoCol} md={8} sm={12} xs={24}>
                    <MailOutlined className={styles.icon} />
                    <Title className={styles.methodTitle} level={4}>
                        Email
                    </Title>
                    <Text className={styles.text}>
                        Gửi email đến{' '}
                        <a href="mailto:perfumeshop1830@gmail.com">
                            perfumeshop1830@gmail.com
                        </a>{' '}
                        để nhận được hỗ trợ từ The Perfume (phản hồi trong vòng
                        24 giờ).
                    </Text>
                </Col>
                <Col className={styles.infoCol} md={8} sm={12} xs={24}>
                    <EnvironmentOutlined className={styles.icon} />
                    <Title className={styles.methodTitle} level={4}>
                        Địa chỉ cửa hàng
                    </Title>
                    <Text className={styles.text}>
                        Showroom 1: 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh
                        <br />
                        Showroom 2: 456 Đường Trần Hưng Đạo, Quận 5, TP. Hồ Chí
                        Minh
                        <br />
                        Showroom 3: 789 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ
                        Chí Minh
                    </Text>
                </Col>
            </Row>

            <Row className={styles.formRow}>
                <Col md={16} sm={24} xs={24}>
                    <Title className={styles.formTitle} level={3}>
                        Gửi tin nhắn cho chúng tôi
                    </Title>
                    <Form className={styles.form}>
                        <Form.Item
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên của bạn!',
                                },
                            ]}
                        >
                            <Input placeholder="Tên của bạn" />
                        </Form.Item>
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập email của bạn!',
                                },
                            ]}
                        >
                            <Input placeholder="Email của bạn" />
                        </Form.Item>
                        <Form.Item
                            name="message"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tin nhắn của bạn!',
                                },
                            ]}
                        >
                            <Input.TextArea
                                placeholder="Tin nhắn của bạn"
                                rows={4}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                className={styles.submitButton}
                                htmlType="submit"
                                type="primary"
                            >
                                Gửi tin nhắn
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Layout.Content>
    );
};

export default Contact;
