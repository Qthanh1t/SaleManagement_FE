import { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Typography, Tag } from 'antd';
import { UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { getUsers, deleteUser, type User } from '../services/userService.ts';
import UserFormModal from '../components/UserFormModal';
import { useStores } from '../stores/RootStore';
import type {Page} from "../services/productService.ts"; // Để check không cho tự xóa mình

const { Title } = Typography;

const UserListPage = () => {
    const { authStore } = useStores();
    const [loading, setLoading] = useState(false);
    const [userPage, setUserPage] = useState<Page<User> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getUsers(0, 100); // Lấy tạm 100 user
            setUserPage(data);
        } catch (error) {
            message.error('Không thể tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id: number) => {
        try {
            await deleteUser(id);
            message.success('Đã xóa nhân viên');
            fetchData();
        } catch (e) { message.error('Lỗi khi xóa'); }
    }

    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Họ tên', dataIndex: 'fullName' },
        { title: 'Email', dataIndex: 'email' },
        {
            title: 'Vai trò',
            dataIndex: 'roleName',
            render: (role: string) => {
                let color = 'blue';
                if (role === 'ROLE_ADMIN') color = 'red';
                if (role === 'ROLE_WAREHOUSE_STAFF') color = 'orange';
                return <Tag color={color}>{role}</Tag>
            }
        },
        {
            title: 'Hành động',
            render: (_: any, record: User) => (
                // Không cho phép tự xóa chính mình
                record.email !== authStore.user?.email && (
                    <Popconfirm title="Xóa nhân viên này?" onConfirm={() => handleDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                    </Popconfirm>
                )
            )
        }
    ];

    return (
        <div>
            <div className='tw-flex tw-justify-between tw-mb-4'>
                <Title level={3}>Quản lý Nhân viên</Title>
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalOpen(true)}>
                    Tạo tài khoản
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={userPage?.content}
                rowKey="id"
                loading={loading}
                pagination={false}
            />

            <UserFormModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default UserListPage;