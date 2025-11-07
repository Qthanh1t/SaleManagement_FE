import { useStores } from '../stores/RootStore.tsx';
import { observer } from 'mobx-react-lite';
import { Button, Typography } from 'antd';

const { Title, Text } = Typography;

const DashboardPage = observer(() => {
    const { authStore } = useStores();

    return (
        <div className="tw-p-4">
            <Title>Chào mừng, {authStore.user?.fullName}!</Title>
            <Text>Bạn đã đăng nhập với vai trò: {authStore.user?.role}</Text>
            <br />
            <Button
                type="primary"
                danger
                className="tw-mt-4" // Dùng Tailwind
                onClick={() => authStore.logout()}
            >
                Đăng xuất
            </Button>
        </div>
    );
});

export default DashboardPage;