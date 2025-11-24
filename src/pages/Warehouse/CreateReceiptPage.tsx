import { useEffect, useState } from 'react';
import { Form, Select, InputNumber, Button, Table, Typography, message, Card, Space, Input } from 'antd';
import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { getSuppliers, type Supplier } from '../../services/supplierService';
import { searchProducts, type Product } from '../../services/productService';
import { createReceipt, type ReceiptItemRequest } from '../../services/warehouseService';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

interface CartItem extends ReceiptItemRequest {
    productName: string;
    sku: string;
    total: number;
}

const CreateReceiptPage = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [form] = Form.useForm(); // Form để thêm SP

    // Load suppliers
    useEffect(() => {
        getSuppliers(0, 100).then(res => setSuppliers(res.content));
    }, []);

    // Search products
    const handleSearchProduct = async (val: string) => {
        if (val.length > 1) {
            const res = await searchProducts(val);
            setProducts(res);
        }
    };

    // Thêm SP vào bảng
    const handleAddItem = (values: any) => {
        const product = products.find(p => p.id === values.productId);
        if (!product) return;

        const newItem: CartItem = {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            quantity: values.quantity,
            entryPrice: values.entryPrice,
            total: values.quantity * values.entryPrice
        };

        setCart([...cart, newItem]);
        form.resetFields(['productId', 'quantity', 'entryPrice']); // Reset form thêm nhỏ
    };

    // Xóa SP
    const handleRemove = (idx: number) => {
        const newCart = [...cart];
        newCart.splice(idx, 1);
        setCart(newCart);
    };

    // Submit
    const handleSubmit = async () => {
        if (!selectedSupplier) return message.error('Chọn nhà cung cấp');
        if (cart.length === 0) return message.error('Chưa có sản phẩm');

        setLoading(true);
        try {
            await createReceipt({
                supplierId: selectedSupplier,
                note,
                items: cart.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    entryPrice: i.entryPrice
                }))
            });
            message.success('Nhập kho thành công!');
            navigate('/products');
        } catch (error) {
            message.error('Lỗi nhập kho');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'SKU', dataIndex: 'sku' },
        { title: 'Tên SP', dataIndex: 'productName' },
        { title: 'Số lượng', dataIndex: 'quantity' },
        { title: 'Giá nhập', dataIndex: 'entryPrice', render: (v: number) => v.toLocaleString() },
        { title: 'Thành tiền', dataIndex: 'total', render: (v: number) => v.toLocaleString() },
        {
            render: (_: any, __: any, idx: number) => (
                <Button danger icon={<DeleteOutlined />} onClick={() => handleRemove(idx)} />
            )
        }
    ];

    return (
        <div className='tw-p-4'>
            <Title level={3}>Tạo Phiếu Nhập Kho</Title>

            <div className='tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-4'>
                {/* CỘT TRÁI: INFO & FORM THÊM */}
                <Card className='lg:tw-col-span-1' title="Thông tin nhập">
                    <div className='tw-mb-4'>
                        <label>Nhà cung cấp:</label>
                        <Select
                            className='tw-w-full'
                            placeholder="Chọn NCC"
                            onChange={setSelectedSupplier}
                        >
                            {suppliers.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
                    </div>
                    <div className='tw-mb-4'>
                        <label>Ghi chú:</label>
                        <Input.TextArea rows={2} value={note} onChange={e => setNote(e.target.value)} />
                    </div>

                    <hr className='tw-my-4'/>

                    <Typography.Text strong>Thêm sản phẩm:</Typography.Text>
                    <Form form={form} layout="vertical" onFinish={handleAddItem} className='tw-mt-2'>
                        <Form.Item name="productId" rules={[{required: true, message: 'Chọn SP'}]}>
                            <Select
                                showSearch
                                placeholder="Tìm SP..."
                                onSearch={handleSearchProduct}
                                filterOption={false}
                            >
                                {products.map(p => (
                                    <Option key={p.id} value={p.id}>{p.name} (Tồn: {p.stockQuantity})</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Space align="baseline">
                            <Typography.Text>Số Lượng:</Typography.Text>
                            <Form.Item name="quantity" initialValue={1} rules={[{required: true}]}>
                                <InputNumber placeholder="SL" min={1} />
                            </Form.Item>
                            <Typography.Text>Giá nhập:</Typography.Text>
                            <Form.Item name="entryPrice" initialValue={0} rules={[{required: true}]}>
                                <InputNumber placeholder="Giá nhập" min={0} addonAfter="VNĐ" style={{ margin: 0, marginTop: '-4px' }}/>
                            </Form.Item>
                            <Button type="dashed" htmlType="submit" icon={<PlusOutlined />}>Thêm</Button>
                        </Space>
                    </Form>
                </Card>

                {/* CỘT PHẢI: DANH SÁCH */}
                <Card className='lg:tw-col-span-2' title="Danh sách hàng nhập">
                    <Table dataSource={cart} columns={columns} rowKey="productId" pagination={false} />

                    <div className='tw-mt-4 tw-text-right'>
                        <Title level={4}>
                            Tổng tiền: {cart.reduce((sum, item) => sum + item.total, 0).toLocaleString()} VNĐ
                        </Title>
                        <Button
                            type="primary"
                            size="large"
                            icon={<SaveOutlined />}
                            onClick={handleSubmit}
                            loading={loading}
                        >
                            Xác nhận Nhập Kho
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CreateReceiptPage;