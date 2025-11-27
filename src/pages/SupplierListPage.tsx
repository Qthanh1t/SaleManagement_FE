import { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import {type Supplier, getSuppliers, deleteSupplier } from '../services/supplierService';
import SupplierFormModal from '../components/SupplierFormModal';
import type {Page} from "../services/productService.ts";

const { Title } = Typography;

// eslint-disable-next-line react-refresh/only-export-components
const SupplierListPage = () => {
    const [loading, setLoading] = useState(false);
    const [supplierPage, setSupplierPage] = useState<Page<Supplier> | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const fetchData = async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const data = await getSuppliers(page, size);
            setSupplierPage(data);
            setPagination(prev => ({
                ...prev,
                current: data.number + 1,
                pageSize: data.size,
                total: data.totalElements,
            }));
        } catch (error: any) {
            if(error.response){
                message.error(error.response.data.message);
            }
            else{
                message.error('Lỗi khi tải danh sách nhà cung cấp');
            }
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

    const handleAddNew = () => {
        setEditingSupplier(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record: Supplier) => {
        setEditingSupplier(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteSupplier(id);
            message.success('Xóa nhà cung cấp thành công');
            fetchData(pagination.current - 1, pagination.pageSize);
        } catch (error: any) {
            if (error.response) {
                message.error(error.response.data.message);
            } else {
                message.error('Lỗi khi xóa');
            }
        }
    };

    const columns = [
        { title: 'Tên NCC', dataIndex: 'name', key: 'name' },
        { title: 'Người liên hệ', dataIndex: 'contactPerson', key: 'contactPerson' },
        { title: 'SĐT', dataIndex: 'phoneNumber', key: 'phoneNumber' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Supplier) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm
                        title="Xóa nhà cung cấp"
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
                <Title level={3}>Quản lý Nhà cung cấp</Title>
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
                dataSource={supplierPage?.content}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />

            <SupplierFormModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchData(pagination.current - 1, pagination.pageSize)}
                supplier={editingSupplier}
            />
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default observer(SupplierListPage);