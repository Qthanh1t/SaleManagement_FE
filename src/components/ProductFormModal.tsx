import {Modal, Form, Input, InputNumber, Select, message, Upload, Button} from 'antd';
import { useStores } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import {type Category, getCategories } from '../services/categoryService';
import {type ProductRequest, createProduct, updateProduct, type Product } from '../services/productService';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { UploadOutlined } from '@ant-design/icons';

interface ProductFormModalProps {
    // Hàm này được gọi để load lại data ở trang chính
    onSuccess: () => void;
    // Truyền sản phẩm cần sửa vào (nếu có)
    product: Product | null;
}

// eslint-disable-next-line react-refresh/only-export-components
const ProductFormModal = ({ onSuccess, product }: ProductFormModalProps) => {
    const { uiStore } = useStores();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const isEditing = !!product;

    const token = localStorage.getItem('token');
    const uploadHeaders = {
        Authorization: `Bearer ${token}`,
    };

    // Lấy danh sách category khi modal mở
    useEffect(() => {
        if (uiStore.isProductModalOpen) {
            getCategories().then(setCategories);
        }
    }, [uiStore.isProductModalOpen]);

    // Set giá trị cho form nếu là edit
    useEffect(() => {
        if (isEditing && product) {
            form.setFieldsValue({
                ...product,
                initialStock: product.stockQuantity // Map tên field
            });
            if (product.imageUrl) {
                setFileList([
                    {
                        uid: '-1',
                        name: product.imageUrl.split('/').pop() || 'image.png',
                        status: 'done',
                        url: `http://localhost:8080${product.imageUrl}`, // URL đầy đủ để hiển thị
                    },
                ]);
            } else {
                setFileList([]);
            }
        } else {
            form.resetFields(); // Reset form nếu là tạo mới
        }
    }, [isEditing, product, form, uiStore.isProductModalOpen]);


    const handleOk = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            const requestData: ProductRequest = {
                ...values,
                price: Number(values.price),
                initialStock: Number(values.initialStock),
                imageUrl: values.imageUrl
            };

            if (isEditing && product) {
                await updateProduct(product.id, requestData);
                message.success('Cập nhật sản phẩm thành công!');
            } else {
                await createProduct(requestData);
                message.success('Tạo sản phẩm thành công!');
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
        uiStore.closeProductModal();
        form.resetFields();
        setFileList([]);
    };

    const handleUploadChange = (info: UploadChangeParam) => {
        let newFileList = [...info.fileList];
        newFileList = newFileList.slice(-1); // Chỉ giữ lại 1 file cuối cùng

        if (info.file.status === 'done') {
            message.success(`${info.file.name} upload thành công`);
            // Lấy URL từ response của server (API /files/upload)
            const serverUrl = info.file.response?.url;
            // Set giá trị này vào form
            form.setFieldsValue({ imageUrl: serverUrl });

            // Cập nhật lại URL trong fileList để hiển thị (nếu cần)
            newFileList[0].url = `http://localhost:8080${serverUrl}`;

        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} upload thất bại.`);
        } else if (info.file.status === 'removed') {
            // Nếu xóa file
            form.setFieldsValue({ imageUrl: null });
        }

        setFileList(newFileList);
    };

    return (
        <Modal
            title={isEditing ? 'Cập nhật Sản phẩm' : 'Tạo Sản phẩm mới'}
            open={uiStore.isProductModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            width={600}
        >
            <Form form={form} layout="vertical" name="product_form" className='mt-6'>
                <Form.Item
                    name="sku"
                    label="SKU (Mã sản phẩm)"
                    rules={[{ required: true, message: 'Vui lòng nhập SKU!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="categoryId"
                    label="Danh mục"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                >
                    <Select placeholder="Chọn 1 danh mục">
                        {categories.map(cat => (
                            <Select.Option key={cat.id} value={cat.id}>
                                {cat.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Giá bán"
                    rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                >
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="VNĐ" />
                </Form.Item>

                <Form.Item
                    name="initialStock"
                    label="Tồn kho ban đầu"
                    rules={[{ required: true, message: 'Vui lòng nhập tồn kho!' }]}
                >
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                    name="imageUrl"
                    label="Hình ảnh"
                    // 'name' này chỉ để form lấy giá trị,
                    // việc hiển thị file được quản lý bởi fileList
                >
                    <Upload
                        action="http://localhost:8080/api/v1/files/upload" // API upload
                        headers={uploadHeaders} // Header chứa token
                        listType="picture"
                        fileList={fileList} // Danh sách file (state)
                        onChange={handleUploadChange} // Hàm xử lý
                        beforeUpload={() => token ? true : (message.error('Vui lòng đăng nhập lại'), false)}
                    >
                        <Button icon={<UploadOutlined />}>Bấm để Upload</Button>
                    </Upload>
                </Form.Item>
                <Form.Item name="imageUrl" hidden>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default observer(ProductFormModal);