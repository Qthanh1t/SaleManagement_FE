import { useEffect, useState } from 'react';
import { Table, Button, message, Typography, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import {type Order, getOrders } from '../services/orderService';
import { useNavigate } from 'react-router-dom';
import type {Page} from "../services/productService.ts";

const { Title } = Typography;

// eslint-disable-next-line react-refresh/only-export-components
const OrderListPage = () => {
    const [loading, setLoading] = useState(false);
    const [orderPage, setOrderPage] = useState<Page<Order> | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const navigate = useNavigate();

    const fetchData = async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const data = await getOrders(page, size);
            setOrderPage(data);
            setPagination(prev => ({
                ...prev,
                current: data.number + 1,
                pageSize: data.size,
                total: data.totalElements,
            }));
        } catch (error) {
            message.error('Lỗi khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(0, pagination.pageSize);
    }, []);

    const handleTableChange = (newPagination: any) => {
        fetchData(newPagination.current - 1, newPagination.pageSize);
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        {
            title: 'Ngày tạo',
            dataIndex: 'orderDate',
            key: 'orderDate',
            render: (dateStr: string) => new Date(dateStr).toLocaleString('vi-VN')
        },
        { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
        { title: 'Nhân viên', dataIndex: 'userName', key: 'userName' },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (val: number) => `${val.toLocaleString('vi-VN')} VNĐ`
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                let text = status;

                if (status === 'COMPLETED') {
                    color = 'success'; // Màu xanh lá
                    text = 'Hoàn thành';
                } else if (status === 'CANCELLED') {
                    color = 'error'; // Màu đỏ
                    text = 'Đã hủy';
                }

                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Order) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/orders/${record.id}`)} // Chuyển sang trang chi tiết
                >
                    Xem
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Title level={3} className="mb-4">Danh sách Đơn hàng</Title>

            <Table
                columns={columns}
                dataSource={orderPage?.content}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default observer(OrderListPage);