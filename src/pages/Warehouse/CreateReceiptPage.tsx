import { useEffect, useState } from 'react';
import {Form, Select, InputNumber, Button, Table, Typography, message, Card, Space, Input, Upload} from 'antd';
import { DeleteOutlined, PlusOutlined, SaveOutlined, ScanOutlined, LoadingOutlined } from '@ant-design/icons';
import { getSuppliers, type Supplier } from '../../services/supplierService';
import { searchProducts, type Product } from '../../services/productService';
import {createReceipt, type ReceiptItemRequest, scanInvoice} from '../../services/warehouseService';
import { useNavigate } from 'react-router-dom';
import stringSimilarity from 'string-similarity';

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
    const [scanning, setScanning] = useState(false);

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
        } catch (error: any) {
            if(error.response){
                message.error(error.response.data.message);
            }
            else{
                message.error('Lỗi khi nhập kho');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleScanInvoice = async (file: File) => {
        setScanning(true);
        try {
            const data = await scanInvoice(file);
            message.success('Trích xuất thông tin thành công!');

            // 1. Gợi ý Nhà cung cấp (Tìm gần đúng)
            if (data.supplierName && suppliers.length > 0) {
                // Tạo danh sách tên NCC trong DB để so sánh
                const supplierNames = suppliers.map(s => s.name);

                // Tìm tên giống nhất
                const matchResult = stringSimilarity.findBestMatch(data.supplierName, supplierNames);
                const bestMatch = matchResult.bestMatch;

                // Log để debug xem độ giống là bao nhiêu (0 -> 1)
                console.log(`NCC AI: "${data.supplierName}" vs DB: "${bestMatch.target}" - Score: ${bestMatch.rating}`);

                // Ngưỡng chấp nhận (Threshold): 0.4
                // (Thấp hơn sản phẩm vì tên công ty thường lệch nhiều do chữ "Công ty", "TNHH", "Cổ phần"...)
                if (bestMatch.rating > 0.4) {
                    // Lấy ID của NCC tại index tốt nhất
                    const matchedSupplier = suppliers[matchResult.bestMatchIndex];
                    setSelectedSupplier(matchedSupplier.id);
                    message.info(`Đã chọn NCC: ${matchedSupplier.name} (${Math.round(bestMatch.rating * 100)}% khớp)`);
                } else {
                    message.warning(`Không tìm thấy NCC nào giống tên: "${data.supplierName}"`);
                    setSelectedSupplier(null);
                }
            }

            // 2. Điền ghi chú
            setNote(`Hóa đơn ngày: ${data.invoiceDate}. Tổng tiền gốc: ${data.totalAmount}`);

            // 3. Map sản phẩm (Phần khó nhất)
            // AI trả về tên sản phẩm trên hóa đơn (vd: "IP 15 Promax")
            // Ta phải tìm sản phẩm tương ứng trong DB
            const newCartItems: any[] = [];

            for (const aiItem of data.items) {
                // Bước A: Gọi API tìm kiếm để lấy danh sách ứng viên (Candidates)
                const candidates = await searchProducts(aiItem.productName);

                if (candidates && candidates.length > 0) {
                    // Bước B: Tìm ứng viên tốt nhất bằng thuật toán so sánh chuỗi
                    // Tạo mảng chỉ chứa tên để thư viện so sánh
                    const candidateNames = candidates.map(p => p.name);

                    // So sánh tên AI đọc được với danh sách tên trong DB
                    const matches = stringSimilarity.findBestMatch(aiItem.productName, candidateNames);
                    // Lấy sản phẩm tốt nhất dựa trên index
                    const bestMatchIndex = matches.bestMatchIndex;
                    const bestProduct = candidates[bestMatchIndex];
                    const bestScore = matches.bestMatch.rating; // Điểm số từ 0 -> 1

                    // (Tùy chọn) Chỉ chấp nhận nếu độ giống > 0.3 để tránh map rác
                    if (bestScore > 0.3) {
                        newCartItems.push({
                            productId: bestProduct.id,
                            productName: bestProduct.name,
                            sku: bestProduct.sku,
                            quantity: aiItem.quantity,
                            entryPrice: aiItem.price,
                            total: aiItem.quantity * aiItem.price
                        });
                    } else {
                        // Nếu tìm ra nhưng không cái nào giống tên (điểm thấp)
                        message.warning(`Không tìm thấy SP tương tự: "${aiItem.productName}"`);
                    }
                } else {
                    message.warning(`Không tìm thấy SP: "${aiItem.productName}"`);
                }
            }

            setCart(prev => [...prev, ...newCartItems]);

        } catch (error) {
            message.error('Không thể đọc hóa đơn. Vui lòng thử lại.');
        } finally {
            setScanning(false);
        }
        return false; // Chặn auto upload của antd
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
        <div className='p-4'>
            <Title level={3}>Tạo Phiếu Nhập Kho</Title>
            <Upload
                beforeUpload={handleScanInvoice}
                showUploadList={false}
                accept="image/*"
            >
                <Button
                    type="dashed"
                    icon={scanning ? <LoadingOutlined /> : <ScanOutlined />}
                    size="large"
                    className="bg-green-50 border-green-500 text-green-600"
                >
                    {scanning ? 'Đang phân tích...' : 'Quét Hóa Đơn (AI)'}
                </Button>
            </Upload>

            <div className='grid grid-cols-1 lg:grid-cols-9 gap-4'>
                {/* CỘT TRÁI: INFO & FORM THÊM */}
                <Card className='lg:col-span-4' title="Thông tin nhập">
                    <div className='mb-4'>
                        <label>Nhà cung cấp:</label>
                        <Select
                            className='w-full'
                            placeholder="Chọn NCC"
                            onChange={setSelectedSupplier}
                            value={selectedSupplier}
                        >
                            {suppliers.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
                    </div>
                    <div className='mb-4'>
                        <label>Ghi chú:</label>
                        <Input.TextArea rows={2} value={note} onChange={e => setNote(e.target.value)} />
                    </div>

                    <hr className='my-4'/>

                    <Typography.Text strong>Thêm sản phẩm:</Typography.Text>
                    <Form form={form} layout="vertical" onFinish={handleAddItem} className='mt-2'>
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
                            <Form.Item name="quantity" initialValue={1} rules={[{required: true}]}>
                                <InputNumber placeholder="SL" min={1} />
                            </Form.Item>
                            <Form.Item name="entryPrice" initialValue={0} rules={[{required: true}]}>
                                <InputNumber placeholder="Giá nhập" min={0} addonAfter="VNĐ" style={{ margin: 0, marginTop: '-4px' }}/>
                            </Form.Item>
                            <Button type="dashed" htmlType="submit" icon={<PlusOutlined />}>Thêm</Button>
                        </Space>
                    </Form>
                </Card>

                {/* CỘT PHẢI: DANH SÁCH */}
                <Card className='lg:col-span-5' title="Danh sách hàng nhập">
                    <Table dataSource={cart} columns={columns} rowKey="productId" pagination={false} />

                    <div className='mt-4 text-right'>
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