import { Modal, Form, Input, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import {type Customer, type CustomerRequest, createCustomer, updateCustomer } from '../services/customerService';

interface CustomerFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customer: Customer | null;
}

// eslint-disable-next-line react-refresh/only-export-components
const CustomerFormModal = ({ open, onClose, onSuccess, customer }: CustomerFormModalProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isEditing = !!customer;

    useEffect(() => {
        if (open) {
            if (isEditing && customer) {
                form.setFieldsValue(customer);
            } else {
                form.resetFields();
            }
        }
    }, [isEditing, customer, form, open]);


    const handleOk = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const requestData: CustomerRequest = values;

            if (isEditing && customer) {
                await updateCustomer(customer.id, requestData);
                message.success('Cập nhật khách hàng thành công!');
            } else {
                await createCustomer(requestData);
                message.success('Tạo khách hàng thành công!');
            }

            onSuccess();
            handleCancel();

        } catch (error: any) {
            // XỬ LÝ LỖI TRÙNG SĐT TỪ BACKEND
            if (error.response && error.response.status === 409) {
                message.error(error.response.data.message); // Hiển thị lỗi "Số điện thoại ... đã tồn tại"
            } else {
                message.error('Đã xảy ra lỗi!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
        form.resetFields();
    };

    return (
        <Modal
            title={isEditing ? 'Cập nhật Khách hàng' : 'Tạo Khách hàng mới'}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical" name="customer_form" className='mt-6'>
                <Form.Item
                    name="fullName"
                    label="Họ tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="phoneNumber"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="address"
                    label="Địa chỉ"
                >
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default observer(CustomerFormModal);