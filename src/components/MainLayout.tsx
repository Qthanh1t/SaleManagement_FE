import React, {useEffect, useMemo, useState} from 'react';
import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
    LogoutOutlined,
    AppstoreOutlined,
    BookOutlined,
    TeamOutlined,
    ShopOutlined,
    BellOutlined,
    SolutionOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, Dropdown, Space, Avatar, type MenuProps, Badge, Popover, List } from 'antd';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { getLowStockProducts, type Product } from '../services/productService';
import { useStores } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';
import logoSmall from '../assets/logo.png';
import logoFull from '../assets/logo-full.png';

const { Header, Content, Footer, Sider } = Layout;

const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    SALES: 'ROLE_SALES_STAFF',
    WAREHOUSE: 'ROLE_WAREHOUSE_STAFF',
};

interface MenuConfigItem {
    key: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    children?: MenuConfigItem[];
    allowedRoles?: string[]; // Mảng các role được phép thấy (nếu không có = public)
}

// eslint-disable-next-line react-refresh/only-export-components
const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { authStore } = useStores();
    const navigate = useNavigate();
    const location = useLocation();
    const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
    const [loadingLowStock, setLoadingLowStock] = useState(false);

    useEffect(() => {
        if (authStore.isAuthenticated) {
            setLoadingLowStock(true);
            getLowStockProducts(5) // Ngưỡng cảnh báo là 5
                .then(setLowStockItems)
                .catch(() => {}) // Im lặng nếu lỗi
                .finally(() => setLoadingLowStock(false));
        }
    }, [authStore.isAuthenticated, location.pathname]);

    const notificationContent = (
        <div style={{ width: 300 }}>
            <List
                loading={loadingLowStock}
                dataSource={lowStockItems}
                locale={{ emptyText: 'Không có cảnh báo nào' }}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            title={<span className='tw-text-red-600'>{item.name}</span>}
                            description={`Chỉ còn: ${item.stockQuantity} (SKU: ${item.sku})`}
                        />
                        {/* Link nhanh tới trang nhập kho */}
                        <Link to="/warehouse/receipts/new">Nhập ngay</Link>
                    </List.Item>
                )}
            />
        </div>
    );

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Menu cho Dropdown ở Header
    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ cá nhân',
            onClick: () => navigate('/profile'),
        },
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
        '/suppliers': 'Quản lý nhà cung cấp',
        '/warehouse/receipts/new': 'Nhập kho',
        '/warehouse/adjustments': 'Kiểm kho',
        '/users': 'Quản lý nhân viên'
    };

    let pageTitle = pageTitleMap[location.pathname];
    if (!pageTitle) {
        // Xử lý các route động, ví dụ /orders/123
        if (/^\/orders\/\d+$/.test(location.pathname)) {
            pageTitle = 'Chi tiết Đơn hàng';
        }
    }

    // Định nghĩa menu và gán quyền cho từng mục
    const menuConfiguration: MenuConfigItem[] = [
        {
            key: '/',
            label: <Link to="/">Dashboard</Link>,
            icon: <PieChartOutlined />,
            // Không gán allowedRoles => Ai cũng thấy (hoặc gán tất cả)
        },
        {
            key: '/products',
            label: <Link to="/products">Sản phẩm</Link>,
            icon: <AppstoreOutlined />,
            // Ai cũng cần xem sản phẩm
        },
        {
            key: '/categories',
            label: <Link to="/categories">Danh mục</Link>,
            icon: <BookOutlined />,
            // Ai cũng cần xem danh mục
        },
        {
            key: 'orders', // Submenu
            label: 'Đơn hàng',
            icon: <DesktopOutlined />,
            allowedRoles: [ROLES.ADMIN, ROLES.SALES], // Chỉ Admin và Sales
            children: [
                {
                    key: '/orders/new',
                    label: <Link to="/orders/new">Tạo Đơn hàng</Link>,
                },
                {
                    key: '/orders/list',
                    label: <Link to="/orders/list">Danh sách</Link>,
                }
            ]
        },
        {
            key: '/customers',
            label: <Link to="/customers">Khách hàng</Link>,
            icon: <UserOutlined />,
            allowedRoles: [ROLES.ADMIN, ROLES.SALES], // Chỉ Admin và Sales
        },
        {
            key: '/suppliers',
            label: <Link to="/suppliers">Nhà cung cấp</Link>,
            icon: <SolutionOutlined />,
            allowedRoles: [ROLES.ADMIN, ROLES.WAREHOUSE], // Admin và Kho
        },
        {
            key: 'warehouse', // Submenu
            label: 'Quản lý Kho',
            icon: <ShopOutlined />,
            allowedRoles: [ROLES.ADMIN, ROLES.WAREHOUSE], // Admin và Kho
            children: [
                {
                    key: '/warehouse/receipts/new',
                    label: <Link to="/warehouse/receipts/new">Nhập kho</Link>,
                },
                {
                    key: '/warehouse/adjustments',
                    label: <Link to="/warehouse/adjustments">Kiểm kho</Link>,
                }
            ]
        },
        {
            key: '/users',
            label: <Link to="/users">Nhân viên</Link>,
            icon: <TeamOutlined />,
            allowedRoles: [ROLES.ADMIN], // CHỈ ADMIN
        },
    ];

    const filterMenuByRole = (menuItems: MenuConfigItem[], userRole: string): any[] => {
        return menuItems
            .filter(item => {
                // Nếu không quy định role -> Hiển thị
                if (!item.allowedRoles) return true;
                // Nếu có quy định -> Check xem userRole có nằm trong danh sách không
                return item.allowedRoles.includes(userRole);
            })
            .map(item => {
                // Nếu có con, lọc tiếp con
                if (item.children) {
                    const filteredChildren = filterMenuByRole(item.children, userRole);
                    // Nếu lọc xong mà không còn con nào -> Ẩn luôn cha (Optional logic)
                    // Ở đây ta giữ cha nếu muốn, hoặc trả về object cha với children đã lọc
                    return { ...item, children: filteredChildren };
                }
                return item;
            });
    };

    const items = useMemo(() => {
        const role = authStore.user?.role || '';
        return filterMenuByRole(menuConfiguration, role);
    }, [authStore.user?.role]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="h-16 flex items-center justify-center transition-all duration-300 overflow-hidden">
                    {collapsed ? (
                        // KHI THU GỌN: Hiện Logo nhỏ (Icon)
                        <img
                            src={logoSmall}
                            alt="Small Logo"
                            // Class Tailwind gợi ý: h-10 (40px) để nó nhỏ gọn trong container h-16
                            className="h-10 w-auto animate-fade-in"
                        />
                    ) : (
                        // KHI MỞ RỘNG: Hiện Logo đầy đủ
                        <img
                            src={logoFull}
                            alt="Full Logo"
                            // Class Tailwind gợi ý: h-12 (48px) để rõ nét hơn, w-auto để giữ tỷ lệ
                            // mx-3 để tạo khoảng cách 2 bên lề
                            className="h-12 w-auto mx-3 animate-fade-in"
                        />
                    )}
                </div>
                <Menu theme="dark" defaultSelectedKeys={['/']} mode="inline" items={items} />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 16px', background: colorBgContainer }}>
                    <div className='justify-end h-full items-center gap-5 flex'>

                        {/* 🔥 ICON CHUÔNG THÔNG BÁO */}
                        <Popover
                            content={notificationContent}
                            title="Cảnh báo Tồn kho thấp"
                            trigger="click"
                            placement="bottomRight"
                        >
                            <div className='cursor-pointer mr-4 pt-2'>
                                <Badge count={lowStockItems.length} offset={[2, 0]}>
                                    <BellOutlined style={{ fontSize: '20px' }} />
                                </Badge>
                            </div>
                        </Popover>

                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                            <a onClick={(e) => e.preventDefault()}>
                                <Space className='h-full cursor-pointer'>
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