import { useState } from 'react';
import { Form, Select, InputNumber, Input, Button, message, Card, Alert, Descriptions } from 'antd';
import { searchProducts, type Product } from '../../services/productService';
import { adjustStock } from '../../services/warehouseService';

const { Option } = Select;

const AdjustmentPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleSearch = async (val: string) => {
        if (val.length > 1) {
            const res = await searchProducts(val);
            setProducts(res);
        }
    };

    const handleSelect = (id: number) => {
        const p = products.find(x => x.id === id);
        setSelectedProduct(p || null);
    };

    const onFinish = async (values: any) => {
        if(!selectedProduct) return;
        setLoading(true);
        try {
            await adjustStock({
                productId: selectedProduct.id,
                newQuantity: values.newQuantity,
                reason: values.reason
            });
            message.success("Điều chỉnh kho thành công!");
            form.resetFields();
            setSelectedProduct(null);
        } catch (error) {
            message.error("Lỗi!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='max-w-2xl mx-auto p-4'>
            <Card title="Kiểm kê / Điều chỉnh tồn kho">
                <Alert
                    message="Cảnh báo"
                    description="Hành động này sẽ thay đổi trực tiếp số lượng tồn kho. Hãy cẩn trọng."
                    type="warning"
                    showIcon
                    className='mb-6'
                />

                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Form.Item label="Chọn sản phẩm">
                        <Select
                            showSearch
                            placeholder="Tìm kiếm sản phẩm..."
                            onSearch={handleSearch}
                            onChange={handleSelect}
                            filterOption={false}
                        >
                            {products.map(p => (
                                <Option key={p.id} value={p.id}>{p.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {selectedProduct && (
                        <Descriptions bordered className='mb-6'>
                            <Descriptions.Item label="SKU">{selectedProduct.sku}</Descriptions.Item>
                            <Descriptions.Item label="Tồn hiện tại">
                                <b className='text-blue-600 text-lg'>{selectedProduct.stockQuantity}</b>
                            </Descriptions.Item>
                        </Descriptions>
                    )}

                    <Form.Item
                        name="newQuantity"
                        label="Số lượng thực tế (Mới)"
                        rules={[{required: true, message: 'Nhập số lượng'}]}
                    >
                        <InputNumber className='w-full' min={0} />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Lý do điều chỉnh"
                        rules={[{required: true, message: 'Nhập lý do'}]}
                    >
                        <Input.TextArea rows={3} placeholder="Ví dụ: Hàng hỏng, Kiểm đếm sai..." />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} block size='large'>
                        Xác nhận Điều chỉnh
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default AdjustmentPage;