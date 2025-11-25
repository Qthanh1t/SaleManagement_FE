import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Card, Alert, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/RootStore.tsx';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;

// eslint-disable-next-line react-refresh/only-export-components
const LoginPage = () => {
    const { authStore } = useStores();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (authStore.isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [authStore.isAuthenticated, navigate]);

    const onFinish = async (values: any) => {
        setErrorMessage(null);
        try {
            await authStore.login({
                email: values.email,
                password: values.password,
            });
            // Tự động chuyển hướng sẽ được xử lý bởi useEffect ở trên
            navigate('/');
        } catch (error) {
            setErrorMessage("Sai email hoặc mật khẩu. Vui lòng thử lại.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-800 to-blue-950 p-4">
            <Card
                style={{ width: 420 }}
                className="shadow-2xl rounded-2xl border-0 backdrop-blur-md bg-white/90 overflow-hidden"
                bodyStyle={{ padding: '40px' }}
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4 shadow-sm">
                        <UserOutlined style={{ fontSize: '24px' }} />
                    </div>
                    <Title level={3} style={{ marginBottom: 0, color: '#1f2937' }}>V-Quản Lý</Title>
                    <Text type="secondary">Chào mừng bạn quay trở lại</Text>
                </div>

                <Form
                    name="normal_login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập Email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Email đăng nhập"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Mật khẩu"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    {errorMessage && (
                        <Form.Item>
                            <Alert message={errorMessage} type="error" showIcon className="rounded-lg" />
                        </Form.Item>
                    )}

                    <Form.Item className="mb-2">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full h-12 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 border-none"
                            loading={authStore.status === 'pending'}
                        >
                            ĐĂNG NHẬP
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default observer(LoginPage);