import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Card, Layout, Alert } from 'antd';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/RootStore.tsx';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Title from "antd/es/typography/Title";

const { Content } = Layout;

const LoginPage = () => {
    const { authStore } = useStores();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Nếu đã đăng nhập, tự động chuyển hướng
    useEffect(() => {
        if (authStore.isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [authStore.isAuthenticated, navigate]);

    const onFinish = async (values: any) => {
        setErrorMessage(null); // Xóa lỗi cũ
        try {
            await authStore.login({
                email: values.email,
                password: values.password,
            });
            // Tự động chuyển hướng sẽ được xử lý bởi useEffect ở trên
            navigate('/');
        } catch (error) {
            // Xử lý lỗi đăng nhập
            setErrorMessage("Sai email hoặc mật khẩu. Vui lòng thử lại.");
        }
    };

    return (
        <Layout className="min-h-screen flex items-center justify-center bg-gray-100">
            <Content>
                <Card style={{ width: 400 }} className="shadow-lg">
                    <div className="text-center mb-6">
                        <Title level={2}>Hệ thống Bán hàng</Title>
                    </div>

                    <Form
                        name="normal_login"
                        onFinish={onFinish}
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập Email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="user@example.com"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="password"
                            />
                        </Form.Item>

                        {/* Hiển thị lỗi */}
                        {errorMessage && (
                            <Form.Item>
                                <Alert message={errorMessage} type="error" showIcon />
                            </Form.Item>
                        )}

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full"
                                loading={authStore.status === 'pending'} // Hiển thị loading
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};

// Đừng quên observer cho các component dùng MobX
export default observer(LoginPage);