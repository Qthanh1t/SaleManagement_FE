import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, Col, Row, Spin, Typography, message, Table, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {type Order, getOrderById, type OrderDetail } from '../services/orderService';

const { Title, Text } = Typography;

const OrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getOrderById(Number(id))
                .then(data => {
                    setOrder(data);
                    setLoading(false);
                })
                .catch(() => {
                    message.error('Không tìm thấy đơn hàng');
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) {
        return <div className="tw-text-center tw-mt-10"><Spin size="large" /></div>;
    }

    if (!order) {
        return <div className="tw-text-center tw-mt-10">Không tìm thấy đơn hàng.</div>;
    }

    // Cột cho bảng chi tiết sản phẩm
    const detailColumns = [
        { title: 'SKU', dataIndex: 'productSku', key: 'productSku' },
        { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'productName' },
        {
            title: 'Giá (lúc mua)',
            dataIndex: 'priceAtPurchase',
            key: 'priceAtPurchase',
            render: (val: number) => `${val.toLocaleString('vi-VN')} VNĐ`
        },
        { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
        {
            title: 'Thành tiền',
            key: 'total',
            render: (_: any, record: OrderDetail) =>
                `${(record.priceAtPurchase * record.quantity).toLocaleString('vi-VN')} VNĐ`
        }
    ];

    return (
        <div>
            <Link to="/orders/list">
                <Button icon={<ArrowLeftOutlined />} className="tw-mb-4">
                    Quay lại danh sách
                </Button>
            </Link>

            <Title level={3}>Chi tiết Đơn hàng #{order.id}</Title>

            <Row gutter={[16, 16]}>
                {/* Thông tin chung */}
                <Col xs={24} md={12}>
                    <Card title="Thông tin Đơn hàng">
                        <p><Text strong>Ngày tạo:</Text> {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                        <p><Text strong>Nhân viên:</Text> {order.userName}</p>
                        <p><Text strong>Trạng thái:</Text> <Tag color="green">{order.status}</Tag></p>
                        <Title level={4} className="tw-mt-4">Tổng tiền: <Text type="danger">{order.totalAmount.toLocaleString('vi-VN')} VNĐ</Text></Title>
                    </Card>
                </Col>

                {/* Thông tin khách hàng */}
                <Col xs={24} md={12}>
                    <Card title="Thông tin Khách hàng">
                        <p><Text strong>Họ tên:</Text> {order.customerName}</p>
                        <p><Text strong>SĐT:</Text> {order.customerPhone}</p>
                    </Card>
                </Col>
            </Row>

            {/* Chi tiết sản phẩm */}
            <Title level={4} className="tw-mt-6 tw-mb-4">Chi tiết Sản phẩm</Title>
            <Table
                columns={detailColumns}
                dataSource={order.orderDetails}
                rowKey="productId"
                pagination={false}
            />
        </div>
    );
};

export default OrderDetailPage;