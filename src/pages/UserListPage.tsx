import { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Typography, Tag } from 'antd';
import {UserAddOutlined, UnlockOutlined, LockOutlined} from '@ant-design/icons';
import {getUsers, type User, toggleUserStatus} from '../services/userService.ts';
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
        } catch (error: any) {
            if(error.response){
                message.error(error.response.data.message);
            }
            else{
                message.error('Không thể tải danh sách nhân viên');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleToggleStatus = async (id: number) => {
        try {
            await toggleUserStatus(id);
            message.success('Đã thay đổi trạng thái nhân viên');
            fetchData();
        } catch (error: any) {
            if(error.response){
                message.error(error.response.data.message);
            }
            else{
                message.error('Lỗi khi thay đổi trạng thái tài khoản');
            }
        }
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
            title: 'Trạng thái',
            dataIndex: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Hoạt động' : 'Đã khóa'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            render: (_: any, record: User) => (
                // Không cho phép tự xóa chính mình
                record.email !== authStore.user?.email && (
                    <Popconfirm
                        title={record.isActive ? "Khóa tài khoản này?" : "Mở khóa tài khoản?"}
                        description={record.isActive ? "Nhân viên này sẽ không thể đăng nhập." : "Nhân viên này sẽ có thể truy cập lại."}
                        onConfirm={() => handleToggleStatus(record.id)}
                    >
                        {record.isActive ? (
                            <Button danger icon={<LockOutlined />} size="small">Khóa</Button>
                        ) : (
                            <Button type="primary" icon={<UnlockOutlined />} size="small">Mở</Button>
                        )}
                    </Popconfirm>
                )
            )
        }
    ];

    return (
        <div>
            <div className='flex justify-between mb-4'>
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