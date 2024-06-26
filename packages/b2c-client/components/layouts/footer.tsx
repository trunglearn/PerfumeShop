import React from 'react';
import { Col, Layout, Row, Space, Typography } from 'antd';
import {
    FacebookOutlined,
    InstagramOutlined,
    TwitterOutlined,
} from '@ant-design/icons';
import styles from '../../styles/Footer.module.css';

const { Footer: LayoutFooter } = Layout;
const { Title, Text, Link } = Typography;

const Footer = () => {
    return (
        <LayoutFooter className={styles.footer}>
            <div className={styles.container}>
                <Row gutter={[32, 32]}>
                    <Col md={8} sm={12} xs={24}>
                        <Title className={styles.title} level={4}>
                            Liên Hệ
                        </Title>
                        <Text className={styles.text}>
                            123 Đường Nước Hoa, Thành phố Hương, PC 12345
                        </Text>
                        <br />
                        <Text className={styles.text}>
                            Điện thoại: (123) 456-7890
                        </Text>
                        <br />
                        <Text className={styles.text}>
                            Email: perfumeshop1830@gmail.com
                        </Text>
                    </Col>
                    <Col md={8} sm={12} xs={24}>
                        <Title className={styles.title} level={4}>
                            Theo Dõi Chúng Tôi
                        </Title>
                        <Space size="middle">
                            <Link href="https://facebook.com" target="_blank">
                                <FacebookOutlined className={styles.icon} />
                            </Link>
                            <Link href="https://instagram.com" target="_blank">
                                <InstagramOutlined className={styles.icon} />
                            </Link>
                            <Link href="https://twitter.com" target="_blank">
                                <TwitterOutlined className={styles.icon} />
                            </Link>
                        </Space>
                    </Col>
                    <Col md={8} sm={12} xs={24}>
                        <Title className={styles.title} level={4}>
                            Liên Kết Hữu Ích
                        </Title>
                        <ul className={styles.list}>
                            <li>
                                <Link className={styles.link} href="/about">
                                    Về Chúng Tôi
                                </Link>
                            </li>
                            <li>
                                <Link className={styles.link} href="/contact">
                                    Liên Hệ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className={styles.link}
                                    href="/privacy-policy"
                                >
                                    Chính Sách Bảo Mật
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className={styles.link}
                                    href="/terms-of-service"
                                >
                                    Điều Khoản Dịch Vụ
                                </Link>
                            </li>
                        </ul>
                    </Col>
                </Row>
                <Row justify="center" style={{ marginTop: '20px' }}>
                    <Text className={styles.text}>
                        © 2024 Cửa Hàng Nước Hoa. Mọi quyền được bảo lưu.
                    </Text>
                </Row>
            </div>
        </LayoutFooter>
    );
};

export default Footer;
