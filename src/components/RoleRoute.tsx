import { Navigate, Outlet } from 'react-router-dom';
import { useStores } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';

interface RoleRouteProps {
    allowedRoles: string[]; // Danh sách các role được phép
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
    const { authStore } = useStores();
    const currentUserRole = authStore.user?.role;

    // Nếu chưa có role (lỗi logic) hoặc role không nằm trong danh sách cho phép
    if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
        // Chuyển hướng sang trang 403
        // replace: true để user không back lại được trang này
        return <Navigate to="/403" replace />;
    }

    // Nếu hợp lệ, render nội dung con (Outlet)
    return <Outlet />;
};

export default observer(RoleRoute);