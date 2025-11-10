import React, { useState } from 'react';
import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
    LogoutOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, Dropdown, Space, Avatar, type MenuProps } from 'antd';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useStores } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';

const { Header, Content, Footer, Sider } = Layout;

// Định nghĩa kiểu cho Menu Item
type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: string,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

// Menu chính
const items: MenuItem[] = [
    getItem(<Link to="/">Dashboard</Link>, '/', <PieChartOutlined />),
    getItem(<Link to="/products">Sản phẩm</Link>, '/products', <AppstoreOutlined />),
    getItem('Đơn hàng', '/orders', <DesktopOutlined />), // Sẽ dùng ở MS3
    getItem('Khách hàng', '/customers', <UserOutlined />), // Sẽ dùng ở MS3
];


// eslint-disable-next-line react-refresh/only-export-components
const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { authStore } = useStores();
    const navigate = useNavigate();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Menu cho Dropdown ở Header
    const userMenuItems: MenuProps['items'] = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: () => {
                authStore.logout();
                navigate('/login');
            },
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="tw-h-16 tw-flex tw-items-center tw-justify-center">
                    <h1 className="tw-text-white tw-font-bold tw-text-lg">SALES</h1>
                </div>
                <Menu theme="dark" defaultSelectedKeys={['/']} mode="inline" items={items} />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 16px', background: colorBgContainer }}>
                    <div className='tw-flex tw-justify-end tw-h-full'>
                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                            <a onClick={(e) => e.preventDefault()}>
                                <Space className='tw-h-full tw-cursor-pointer'>
                                    <Avatar size="small" icon={<UserOutlined />} />
                                    {authStore.user?.fullName}
                                </Space>
                            </a>
                        </Dropdown>
                    </div>
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>Admin</Breadcrumb.Item>
                        <Breadcrumb.Item>Sản phẩm</Breadcrumb.Item>
                    </Breadcrumb>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {/* Nội dung các trang sẽ được render ở đây */}
                        <Outlet />
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Hệ thống Quản lý Bán hàng ©2025
                </Footer>
            </Layout>
        </Layout>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default observer(MainLayout); // Rất quan trọng khi dùng store