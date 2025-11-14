import { useEffect, useState } from 'react';
import { useStores } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';
import { Typography, Row, Col, Card, Statistic, Spin, Alert, Empty } from 'antd';
import { AreaChartOutlined, ShoppingCartOutlined, UserAddOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {type DashboardStats, getDashboardStats } from '../services/dashboardService';

const { Title } = Typography;

const DashboardPage = observer(() => {
    const { authStore } = useStores();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAdmin = authStore.user?.role === 'ROLE_ADMIN';

    useEffect(() => {
        // Chỉ gọi API nếu là Admin
        if (isAdmin) {
            getDashboardStats()
                .then(data => {
                    setStats(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setError('Không thể tải dữ liệu dashboard.');
                    setLoading(false);
                });
        } else {
            setLoading(false); // Không phải Admin, không cần load gì
        }
    }, [isAdmin]); // Chạy lại nếu vai trò thay đổi

    // Nếu loading
    if (loading) {
        return <div className="tw-text-center tw-mt-10"><Spin size="large" /></div>;
    }

    // Nếu lỗi
    if (error) {
        return <Alert message="Lỗi" description={error} type="error" showIcon />;
    }

    // Nếu là Sales, chỉ hiển thị chào mừng
    if (!isAdmin || !stats) {
        return (
            <div className="tw-p-4">
                <Title>Chào mừng, {authStore.user?.fullName}!</Title>
            </div>
        );
    }

    // Giao diện Dashboard cho ADMIN
    return (
        <div className="tw-p-4">
            <Title level={3} className="tw-mb-6">Tổng quan Hôm nay</Title>

            {/* 1. Các thẻ Statistic */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Doanh thu"
                            value={stats.totalRevenueToday}
                            precision={0}
                            suffix="VNĐ"
                            prefix={<AreaChartOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Đơn hàng mới"
                            value={stats.totalOrdersToday}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Khách hàng mới"
                            value={stats.newCustomersToday}
                            prefix={<UserAddOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 2. Biểu đồ Top Sản phẩm */}
            <Title level={4} className="tw-mt-8 tw-mb-4">Top 5 Sản phẩm Bán chạy (Toàn thời gian)</Title>
            <Card>
                {stats.topSellingProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={stats.topSellingProducts}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="productName" />
                            <YAxis allowDecimals={false} />
                            <Tooltip formatter={(value: number) => [value, 'Đã bán']} />
                            <Legend />
                            <Bar dataKey="totalSold" name="Số lượng đã bán" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Empty description="Chưa có dữ liệu sản phẩm" />
                )}
            </Card>
        </div>
    );
});

export default DashboardPage;