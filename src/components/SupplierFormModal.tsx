import { Modal, Form, Input, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import {type Supplier, type SupplierRequest, createSupplier, updateSupplier } from '../services/supplierService';

interface SupplierFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    supplier: Supplier | null;
}

// eslint-disable-next-line react-refresh/only-export-components
const SupplierFormModal = ({ open, onClose, onSuccess, supplier }: SupplierFormModalProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isEditing = !!supplier;

    useEffect(() => {
        if (open) {
            if (isEditing && supplier) {
                form.setFieldsValue(supplier);
            } else {
                form.resetFields();
            }
        }
    }, [isEditing, supplier, form, open]);


    const handleOk = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const requestData: SupplierRequest = values;

            if (isEditing && supplier) {
                await updateSupplier(supplier.id, requestData);
                message.success('Cập nhật nhà cung cấp thành công!');
            } else {
                await createSupplier(requestData);
                message.success('Tạo nhà cung cấp thành công!');
            }

            onSuccess();
            handleCancel();

        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                message.error(error.response.data.message); // Xử lý lỗi trùng (nếu có)
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
            title={isEditing ? 'Cập nhật NCC' : 'Tạo Nhà cung cấp mới'}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical" name="supplier_form" className='tw-mt-6'>
                <Form.Item
                    name="name"
                    label="Tên nhà cung cấp"
                    rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="contactPerson"
                    label="Người liên hệ"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="phoneNumber"
                    label="Số điện thoại"
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
export default observer(SupplierFormModal);