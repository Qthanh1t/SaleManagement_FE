import { Modal, Form, Input, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import {type Category, type CategoryRequest, createCategory, updateCategory } from '../services/categoryService';

interface CategoryFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    category: Category | null; // null: Tạo mới, Category: Sửa
}

// eslint-disable-next-line react-refresh/only-export-components
const CategoryFormModal = ({ open, onClose, onSuccess, category }: CategoryFormModalProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isEditing = !!category;

    // Set giá trị cho form nếu là edit
    useEffect(() => {
        if (isEditing && category) {
            form.setFieldsValue(category);
        } else {
            form.resetFields();
        }
    }, [isEditing, category, form, open]); // Thêm 'open' để reset form khi mở lại


    const handleOk = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const requestData: CategoryRequest = values;

            if (isEditing && category) {
                await updateCategory(category.id, requestData);
                message.success('Cập nhật danh mục thành công!');
            } else {
                await createCategory(requestData);
                message.success('Tạo danh mục thành công!');
            }

            onSuccess(); // Load lại data
            handleCancel(); // Đóng modal

        } catch (error) {
            console.error(error);
            message.error('Đã xảy ra lỗi!');
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
            title={isEditing ? 'Cập nhật Danh mục' : 'Tạo Danh mục mới'}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical" name="category_form" className='tw-mt-6'>
                <Form.Item
                    name="name"
                    label="Tên danh mục"
                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default observer(CategoryFormModal);