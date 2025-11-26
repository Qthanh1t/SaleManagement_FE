import { Modal, Form, Input, Select, message } from 'antd';
import { useState } from 'react';
import { createUser, type UserCreateRequest } from '../services/userService.ts';

interface UserFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UserFormModal = ({ open, onClose, onSuccess }: UserFormModalProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleOk = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            await createUser(values as UserCreateRequest);
            message.success('Tạo tài khoản thành công!');
            form.resetFields();
            onSuccess();
            onClose();
        } catch (error: any) {
            if (error.response?.status === 409) {
                message.error(error.response.data.message); // Email trùng
            } else {
                message.error('Lỗi khi tạo tài khoản');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo tài khoản nhân viên"
            open={open}
            onOk={handleOk}
            onCancel={() => { onClose(); form.resetFields(); }}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical" className='tw-mt-4'>
                <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="email" label="Email (Tên đăng nhập)" rules={[{ required: true, type: 'email' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item name="roleId" label="Vai trò" rules={[{ required: true }]}>
                    <Select placeholder="Chọn vai trò">
                        {/* ID này phải khớp với Liquibase changeset 001 */}
                        <Select.Option value={1}>ADMIN (Quản trị)</Select.Option>
                        <Select.Option value={2}>SALES_STAFF (Nhân viên Bán hàng)</Select.Option>
                        <Select.Option value={3}>WAREHOUSE_STAFF (Nhân viên Kho)</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserFormModal;