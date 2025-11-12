import {Row, Col, Card, Table, Typography, Button, InputNumber, Alert, message, Space} from 'antd';
import { useStores } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';
import CustomerSearch from './CreateOrderPage/CustomerSearch';
import ProductSearch from './CreateOrderPage/ProductSearch';
import { DeleteOutlined } from '@ant-design/icons';
import { useEffect } from 'react';

const { Title, Text } = Typography;

const CreateOrderPage = observer(() => {
    const { orderCreationStore } = useStores();
    const {
        cartItemsArray,
        totalCartAmount,
        status,
        errorMessage,
    } = orderCreationStore;

    // Hiển thị thông báo khi tạo đơn thành công
    useEffect(() => {
        (async ()=>{
            if (status === 'success') {
                await message.success('Tạo đơn hàng thành công!');
                // store đã tự clearCart
                orderCreationStore.resetStatus()
            }
        })()

    }, [orderCreationStore, status]);

    // Xử lý submit
    const handleSubmit = async () => {
        if (!orderCreationStore.selectedCustomer) {
            message.warning('Vui lòng chọn khách hàng');
            return;
        }
        if (orderCreationStore.cart.size === 0) {
            message.warning('Vui lòng thêm sản phẩm vào giỏ');
            return;
        }
        await orderCreationStore.submitOrder();
    }

    // Cột của bảng Giỏ hàng
    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ`
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (qty: number, record: any) => (
                <InputNumber
                    min={1}
                    max={record.stock}
                    value={qty}
                    onChange={(value) => orderCreationStore.updateItemQuantity(record.productId, value || 1)}
                />
            )
        },
        {
            title: 'Thành tiền',
            key: 'total',
            render: (_: any, record: any) =>
                `${(record.price * record.quantity).toLocaleString('vi-VN')} VNĐ`
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: any) => (
                <Button
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => orderCreationStore.removeItemFromCart(record.productId)}
                />
            ),
        },
    ];

    return (
        <div>
            <Title level={3}>Tạo Đơn hàng mới</Title>

            {/* Hiển thị lỗi (ví dụ: hết hàng) */}
            {status === 'error' && (
                <Alert message={errorMessage} type="error" showIcon closable className="tw-mb-4" />
            )}

            <Row gutter={[16, 16]}>
                {/* CỘT BÊN TRÁI (Chọn SP & KH) */}
                <Col xs={24} lg={15}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Card title="1. Chọn Khách hàng">
                            <CustomerSearch />
                        </Card>

                        <Card title="2. Chọn Sản phẩm">
                            <ProductSearch />
                            <Table
                                columns={columns}
                                dataSource={cartItemsArray}
                                rowKey="productId"
                                pagination={false}
                                className='tw-mt-4'
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={3} className='tw-text-right'>
                                            <Text strong>Tổng cộng</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={3}>
                                            <Text strong type="danger">
                                                {totalCartAmount.toLocaleString('vi-VN')} VNĐ
                                            </Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )}
                            />
                        </Card>
                    </Space>
                </Col>

                {/* CỘT BÊN PHẢI (Tóm tắt & Hoàn tất) */}
                <Col xs={24} lg={9}>
                    <Card title="3. Hoàn tất">
                        <div className='tw-mb-4'>
                            <Text strong>Khách hàng:</Text>
                            <Text> {orderCreationStore.selectedCustomer?.fullName || 'Chưa chọn'}</Text>
                        </div>
                        <div className='tw-mb-4'>
                            <Text strong>SĐT:</Text>
                            <Text> {orderCreationStore.selectedCustomer?.phoneNumber || ''}</Text>
                        </div>

                        <hr className='tw-my-4' />

                        <div className='tw-flex tw-justify-between tw-mb-2'>
                            <Text>Tổng tiền hàng: </Text>
                            <Text strong>{totalCartAmount.toLocaleString('vi-VN')} VNĐ</Text>
                        </div>

                        {/* (Thêm ô giảm giá ở đây nếu cần) */}

                        <div className='tw-flex tw-justify-between tw-mt-4'>
                            <Title level={4}>Khách phải trả</Title>
                            <Title level={4} type="danger">{totalCartAmount.toLocaleString('vi-VN')} VNĐ</Title>
                        </div>

                        <Button
                            type="primary"
                            className='tw-w-full tw-mt-4'
                            onClick={handleSubmit}
                            loading={status === 'pending'}
                        >
                            HOÀN TẤT ĐƠN HÀNG
                        </Button>

                        <Button
                            danger
                            className='tw-w-full tw-mt-2'
                            onClick={() => orderCreationStore.clearCart()}
                        >
                            Hủy đơn
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
});

export default CreateOrderPage;