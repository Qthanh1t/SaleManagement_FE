import { Navigate, Outlet } from 'react-router-dom';
import { useStores } from '../stores/RootStore.tsx';
import { observer } from 'mobx-react-lite';
import { Spin } from 'antd';

const ProtectedRoutes = () => {
    const { authStore } = useStores();

    // Trạng thái "idle" nghĩa là store chưa kịp kiểm tra localStorage
    if (authStore.status === 'idle') {
        // Hiển thị loading trong khi store kiểm tra (rất nhanh)
        return (
            <div className="tw-flex tw-items-center tw-justify-center tw-h-screen">
                <Spin size="large" />
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