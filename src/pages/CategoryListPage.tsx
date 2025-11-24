import { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import {type Category, getCategories, deleteCategory } from '../services/categoryService';
import CategoryFormModal from '../components/CategoryFormModal';

const { Title } = Typography;

// eslint-disable-next-line react-refresh/only-export-components
const CategoryListPage = () => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // State cho modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Hàm load data chính
    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            message.error('Lỗi khi tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Xử lý mở modal (Tạo mới)
    const handleAddNew = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    // Xử lý mở modal (Sửa)
    const handleEdit = (record: Category) => {
        setEditingCategory(record);
        setIsModalOpen(true);
    };

    // Xử lý xóa
    const handleDelete = async (id: number) => {
        try {
            await deleteCategory(id);
            message.success('Xóa danh mục thành công');
            fetchData(); // Load lại
        } catch (error) {
            message.error('Lỗi khi xóa. (Có thể do danh mục đang được sản phẩm sử dụng)');
        }
    };

    const columns = [
        { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
        { title: 'Mô tả', dataIndex: 'description', key: 'description' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Category) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm
                        title="Xóa danh mục"
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
                <Title level={3}>Quản lý Danh mục</Title>
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
                dataSource={categories}
                rowKey="id"
                loading={loading}
                pagination={false}
            />

            <CategoryFormModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                category={editingCategory}
            />
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default observer(CategoryListPage);