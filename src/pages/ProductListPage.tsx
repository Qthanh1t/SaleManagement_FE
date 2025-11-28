import { useEffect, useState } from 'react';
import {Table, Button, Space, Input, Popconfirm, message, Typography, Tag, Image, Select, Tooltip} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useStores } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';
import {type Product, getProducts, deleteProduct, type Page, toggleProductStatus} from '../services/productService';
import ProductFormModal from '../components/ProductFormModal';
import {type Category, getCategories} from "../services/categoryService.ts";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// eslint-disable-next-line react-refresh/only-export-components
const ProductListPage = () => {
    const { uiStore } = useStores();
    const [loading, setLoading] = useState(false);
    const [productsPage, setProductsPage] = useState<Page<Product> | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // State cho phân trang và tìm kiếm
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    // Hàm load data chính
    const fetchData = async (page = 0, size = 10, search = '', catId: number | null = null) => {
        setLoading(true);
        try {
            const data = await getProducts(page, size, search, catId);
            setProductsPage(data);
            setPagination(prev => ({
                ...prev,
                current: data.number + 1,
                pageSize: data.size,
                total: data.totalElements,
            }));
        } catch (error) {
            message.error('Lỗi khi tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // Load data lần đầu
    useEffect(() => {
        getCategories().then(setCategories);
        fetchData(0, pagination.pageSize, searchTerm, selectedCategory);
    }, []); // Chỉ chạy 1 lần khi mount

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await toggleProductStatus(id);
            message.success(currentStatus ? 'Đã ngừng kinh doanh sản phẩm' : 'Đã mở bán lại sản phẩm');
            // Reload data
            fetchData(pagination.current - 1, pagination.pageSize, searchTerm, selectedCategory);
        } catch (error: any) {
            if(error.response){
                message.error(error.response.data.message);
            }
            else{
                message.error('Lỗi khi cập nhật trạng thái');
            }
        }
    }

    // Xử lý khi bảng thay đổi (phân trang, sort)
    const handleTableChange = (newPagination: any) => {
        fetchData(newPagination.current - 1, newPagination.pageSize, searchTerm);
    };

    // Xử lý tìm kiếm
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        fetchData(0, pagination.pageSize, value, selectedCategory);
    };

    // Xử lý khi chọn Category
    const handleCategoryChange = (value: number | null) => {
        setSelectedCategory(value); // Cập nhật state UI
        // Gọi API lọc ngay lập tức, reset về trang 1
        fetchData(0, pagination.pageSize, searchTerm, value);
    };

    // Xử lý mở modal (Tạo mới)
    const handleAddNew = () => {
        setEditingProduct(null); // Không có sản phẩm nào -> Form hiểu là tạo mới
        uiStore.openProductModal(null);
    };

    // Xử lý mở modal (Sửa)
    const handleEdit = (record: Product) => {
        setEditingProduct(record); // Có sản phẩm -> Form hiểu là sửa
        uiStore.openProductModal(record.id);
    };

    // Xử lý xóa
    const handleDelete = async (id: number) => {
        try {
            await deleteProduct(id);
            message.success('Xóa sản phẩm thành công');
            fetchData(pagination.current - 1, pagination.pageSize, searchTerm); // Load lại trang hiện tại
        } catch (error: any) {
            if(error.response){
                message.error(error.response.data.message);
            }
            else{
                message.error('Lỗi khi xóa sản phẩm');
            }
        }
    };

    // Cột của bảng
    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (url: string) => (
                url ?
                    <Image
                        width={60}
                        src={`http://localhost:8080${url}`}
                        preview={{ src: `http://localhost:8080${url}` }}
                    />
                    : <Image width={60} preview={false} /> // Ảnh placeholder
            )
        },
        { title: 'SKU', dataIndex: 'sku', key: 'sku' },
        { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
        { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName' },
        {
            title: 'Giá bán',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ`
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
            render: (qty: number) => (
                <Tag color={qty > 10 ? 'green' : 'red'}>{qty}</Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'success' : 'error'}>
                    {isActive ? 'Đang bán' : 'Ngừng bán'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Product) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm
                        title={record.isActive ? "Ngừng kinh doanh sản phẩm này?" : "Mở bán lại sản phẩm này?"}
                        description={record.isActive ? "Sản phẩm sẽ không xuất hiện khi tạo đơn hàng." : "Sản phẩm sẽ xuất hiện trở lại."}
                        onConfirm={() => handleToggleStatus(record.id, record.isActive)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                    >
                        {record.isActive ? (
                            <Tooltip title="Ngừng kinh doanh">
                                <Button danger icon={<StopOutlined />} />
                            </Tooltip>
                        ) : (
                            <Tooltip title="Mở bán lại">
                                <Button type="primary" ghost icon={<CheckCircleOutlined />} />
                            </Tooltip>
                        )}
                    </Popconfirm>
                    <Popconfirm
                        title="Xóa sản phẩm"
                        description="Bạn có chắc muốn xóa sản phẩm này?"
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
                <Title level={3}>Quản lý Sản phẩm</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddNew}
                >
                    Thêm mới
                </Button>
            </div>
            <Space className='mb-4' size="middle">
                {/* 1. Ô tìm kiếm Text */}
                <Search
                    placeholder="Tìm theo Tên hoặc SKU..."
                    onSearch={handleSearch}
                    enterButton
                    style={{ width: 300 }}
                    allowClear
                />

                {/* 2. 🔥 Dropdown chọn Category (Có tìm kiếm) */}
                <Select
                    showSearch // Cho phép gõ phím để tìm option
                    style={{ width: 250 }}
                    placeholder="Lọc theo Danh mục"
                    optionFilterProp="children" // Tìm kiếm dựa trên text hiển thị (tên danh mục)
                    onChange={handleCategoryChange}
                    allowClear // Cho phép bấm nút X để bỏ chọn
                    filterOption={(input, option) =>
                        (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {categories.map(cat => (
                        <Option key={cat.id} value={cat.id}>
                            {cat.name}
                        </Option>
                    ))}
                </Select>
            </Space>


            <Table
                columns={columns}
                dataSource={productsPage?.content}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                rowClassName={(record) => !record.isActive ? 'tw-bg-gray-50' : ''}
            />

            {/* Modal sẽ được render ở đây */}
            {/* Chúng ta dùng 1 key duy nhất để ép Modal re-render khi đổi sản phẩm */}
            <ProductFormModal
                key={editingProduct ? `edit-${editingProduct.id}` : 'create'}
                onSuccess={() => fetchData(pagination.current - 1, pagination.pageSize, searchTerm)}
                product={editingProduct}
            />

        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default observer(ProductListPage);