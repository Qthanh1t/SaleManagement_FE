import { useEffect, useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useStores } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';
import { changePassword, updateProfile } from '../services/authService';
import { runInAction } from 'mobx';

const { Title } = Typography;

const ProfilePage = observer(() => {
    const { authStore } = useStores();
    const [infoForm] = Form.useForm();
    const [passForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Set giá trị ban đầu cho form thông tin
    useEffect(() => {
        if (authStore.user) {
            infoForm.setFieldsValue({
                email: authStore.user.email,
                fullName: authStore.user.fullName,
                role: authStore.user.role // Chỉ để hiển thị, disable
            });
        }
    }, [authStore.user, infoForm]);

    // Xử lý cập nhật thông tin
    const handleUpdateInfo = async (values: any) => {
        setLoading(true);
        try {
            const updatedUser = await updateProfile({ fullName: values.fullName });

            // Cập nhật lại Store và LocalStorage
            runInAction(() => {
                if (authStore.user) {
                    authStore.user.fullName = updatedUser.fullName;
                    localStorage.setItem("user", JSON.stringify(authStore.user));
                }
            });
            message.success('Cập nhật thông tin thành công!');
        } catch (error) {
            message.error('Lỗi khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý đổi mật khẩu
    const handleChangePassword = async (values: any) => {
        setLoading(true);
        try {
            await changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            });
            message.success('Đổi mật khẩu thành công!');
            passForm.resetFields();
        } catch (error: any) {
            // Hiển thị lỗi từ backend (ví dụ: mật khẩu cũ sai)
            message.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    // Tab 1: Thông tin chung
    const GeneralInfoTab = (
        <Form layout="vertical" form={infoForm} onFinish={handleUpdateInfo} className="max-w-md">
            <Form.Item label="Email (Tên đăng nhập)">
                <Input disabled /> {/* Email không cho sửa */}
            </Form.Item>
            <Form.Item label="Vai trò">
                <Input disabled /> {/* Role không cho sửa */}
            </Form.Item>
            <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
                <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
                Lưu thay đổi
            </Button>
        </Form>
    );

    // Tab 2: Đổi mật khẩu
    const SecurityTab = (
        <Form layout="vertical" form={passForm} onFinish={handleChangePassword} className="max-w-md">
            <Form.Item
                name="oldPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Nhập mật khẩu cũ' }]}
            >
                <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                    { required: true, message: 'Nhập mật khẩu mới' },
                    { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }
                ]}
            >
                <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                    }),
                ]}
            >
                <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Button type="primary" danger htmlType="submit" loading={loading}>
                Đổi mật khẩu
            </Button>
        </Form>
    );

    const items = [
        { key: '1', label: 'Thông tin chung', children: GeneralInfoTab },
        { key: '2', label: 'Bảo mật', children: SecurityTab },
    ];

    return (
        <div className='p-4'>
            <Title level={3} className='mb-6'>Hồ sơ cá nhân</Title>
            <Row>
                <Col xs={24} md={16} lg={12}>
                    <Card>
                        <Tabs defaultActiveKey="1" items={items} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
});

export default ProfilePage;