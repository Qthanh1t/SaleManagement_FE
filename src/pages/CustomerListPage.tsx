import { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import {type Customer, getCustomers, deleteCustomer } from '../services/customerService';
import CustomerFormModal from '../components/CustomerFormModal';
import type {Page} from "../services/productService.ts";

const { Title } = Typography;

// eslint-disable-next-line react-refresh/only-export-components
const CustomerListPage = () => {
    const [loading, setLoading] = useState(false);
    const [customerPage, setCustomerPage] = useState<Page<Customer> | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // State cho modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    // Hàm load data chính
    const fetchData = async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const data = await getCustomers(page, size);
            setCustomerPage(data);
            setPagination(prev => ({
                ...prev,
                current: data.number + 1,
                pageSize: data.size,
                total: data.totalElements,
            }));
        } catch (error) {
            message.error('Lỗi khi tải danh sách khách hàng');
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

    // Xử lý mở modal (Tạo mới)
    const handleAddNew = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    // Xử lý mở modal (Sửa)
    const handleEdit = (record: Customer) => {
        setEditingCustomer(record);
        setIsModalOpen(true);
    };

    // Xử lý xóa
    const handleDelete = async (id: number) => {
        try {
            await deleteCustomer(id);
            message.success('Xóa khách hàng thành công');
            fetchData(pagination.current - 1, pagination.pageSize);
        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                message.error(error.response.data.message); // Hiển thị lỗi "Không thể xóa..."
            } else {
                message.error('Lỗi khi xóa khách hàng');
            }
        }
    };

    const columns = [
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Số điện thoại', dataIndex: 'phoneNumber', key: 'phoneNumber' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Customer) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm
                        title="Xóa khách hàng"
                        description="Bạn có chắc muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className='flex justify-between mb-4'>
                <Title level={3}>Quản lý Khách hàng</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddNew}
                >
                    Thêm mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={customerPage?.content}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />

            <CustomerFormModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchData(pagination.current - 1, pagination.pageSize)}
                customer={editingCustomer}
            />
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default observer(CustomerListPage);