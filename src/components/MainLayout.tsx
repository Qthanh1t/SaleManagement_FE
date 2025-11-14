import React, { useState } from 'react';
import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
    LogoutOutlined,
    AppstoreOutlined,
    BookOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, Dropdown, Space, Avatar, type MenuProps } from 'antd';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
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
    getItem(<Link to="/categories">Danh mục</Link>, '/categories', <BookOutlined />),
    getItem('Đơn hàng', '/orders', <DesktopOutlined />, [
        getItem(<Link to="/orders/new">Tạo Đơn hàng</Link>, '/orders/new'),
        getItem(<Link to="/orders/list">Danh sách</Link>, '/orders/list'), // (Tạm dùng /orders/list)
    ]),
    getItem(<Link to="/customers">Khách hàng</Link>, '/customers', <UserOutlined />),
];


// eslint-disable-next-line react-refresh/only-export-components
const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { authStore } = useStores();
    const navigate = useNavigate();
    const location = useLocation();

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

    // Định nghĩa map từ path sang Tên Tiếng Việt
    const pageTitleMap: { [key: string]: string } = {
        '/': 'Dashboard',
        '/products': 'Quản lý Sản phẩm',
        '/categories': 'Quản lý Danh mục',
        '/orders/new': 'Tạo Đơn hàng',
        '/orders/list': 'Danh sách Đơn hàng',
        '/customers': 'Quản lý Khách hàng',
    };

    let pageTitle = pageTitleMap[location.pathname];
    if (!pageTitle) {
        // Xử lý các route động, ví dụ /orders/123
        if (/^\/orders\/\d+$/.test(location.pathname)) {
            pageTitle = 'Chi tiết Đơn hàng';
        }
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="tw-h-16 tw-flex tw-items-center tw-justify-center">
                    <h1 className="tw-text-white tw-font-bold tw-text-lg text-white text-2xl mx-3">SALES MANAGEMENT</h1>
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
                        <Breadcrumb.Item>
                            <Link to="/">Trang chủ</Link>
                        </Breadcrumb.Item>
                        {/* Chỉ hiển thị item thứ 2 nếu tìm thấy title */}
                        {pageTitle && <Breadcrumb.Item>{pageTitle}</Breadcrumb.Item>}
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