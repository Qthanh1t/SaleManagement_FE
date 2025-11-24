import { useEffect, useState } from 'react';
import { useStores } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';
import {Typography, Row, Col, Card, Statistic, Spin, Alert, Empty, Space, DatePicker} from 'antd';
import { AreaChartOutlined, ShoppingCartOutlined, UserAddOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {type DashboardStats, getDashboardStats } from '../services/dashboardService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const DashboardPage = observer(() => {
    const { authStore } = useStores();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);

    const isAdmin = authStore.user?.role === 'ROLE_ADMIN';

    useEffect(() => {
        // Chỉ gọi API nếu là Admin
        if (isAdmin) {
            setLoading(true); // Nên set loading lại khi đổi ngày để UI phản hồi

            // 1. Format ngày từ dayjs object sang chuỗi 'YYYY-MM-DD'
            const startDateStr = dateRange[0].format('YYYY-MM-DD');
            const endDateStr = dateRange[1].format('YYYY-MM-DD');

            // 2. Truyền tham số vào hàm API
            getDashboardStats(startDateStr, endDateStr)
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
            setLoading(false);
        }
    }, [isAdmin, dateRange]);

    const onDateChange = (dates: any) => {
        if (dates) {
            setDateRange([dates[0], dates[1]]);
        }
    };

    // Nếu loading
    if (loading) {
        return <div className="text-center mt-10"><Spin size="large" /></div>;
    }

    // Nếu lỗi
    if (error) {
        return <Alert message="Lỗi" description={error} type="error" showIcon />;
    }

    // Nếu là Sales, chỉ hiển thị chào mừng
    if (!isAdmin || !stats) {
        return (
            <div className="p-4">
                <Title>Chào mừng, {authStore.user?.fullName}!</Title>
            </div>
        );
    }

    // Giao diện Dashboard cho ADMIN
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <Title level={3} style={{ marginBottom: 0 }}>Báo cáo Kinh doanh</Title>

                <Space direction="vertical" size={12}>
                    <RangePicker
                        value={dateRange}
                        onChange={onDateChange}
                        allowClear={false} // Không cho phép xóa trắng
                    />
                </Space>
            </div>

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
                        <div className='text-gray-400 text-xs mt-2'>
                            Từ {dateRange[0].format('DD/MM')} đến {dateRange[1].format('DD/MM')}
                        </div>
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
            <Title level={4} className="mt-8 mb-4">Top 5 Sản phẩm Bán chạy (Toàn thời gian)</Title>
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