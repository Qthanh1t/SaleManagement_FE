import { useStores } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const DashboardPage = observer(() => {
    const { authStore } = useStores();

    return (
        <div className="tw-p-4">
            <Title>Chào mừng, {authStore.user?.fullName}!</Title>
            <Text>Bạn đã đăng nhập với vai trò: {authStore.user?.role}</Text>
        </div>
    );
});

export default DashboardPage;