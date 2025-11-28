import { Navigate, Outlet } from 'react-router-dom';
import { useStores } from '../stores/RootStore.tsx';
import { observer } from 'mobx-react-lite';
import { Spin } from 'antd';

const ProtectedRoutes = () => {
    const { authStore } = useStores();

    if (authStore.status === 'pending' || authStore.status === 'idle') {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    // Nếu đã kiểm tra xong và không auth, điều hướng về /login
    if (!authStore.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Nếu đã auth, hiển thị trang con (Dashboard, Products...)
    return <Outlet />;
};

// Bọc component bằng observer để nó tự động render lại khi
// authStore.status hoặc authStore.isAuthenticated thay đổi
export default observer(ProtectedRoutes);