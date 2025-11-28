import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootStoreProvider } from './stores/RootStore';
import LoginPage from './pages/LoginPage';
import ProtectedRoutes from './components/ProtectedRoutes';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './components/MainLayout';
import ProductListPage from './pages/ProductListPage';
import '@ant-design/v5-patch-for-react-19';
import CreateOrderPage from "./components/CreateOrderPage.tsx";
import CategoryListPage from "./pages/CategoryListPage.tsx";
import CustomerListPage from "./pages/CustomerListPage";
import OrderListPage from "./pages/OrderListPage.tsx";
import OrderDetailPage from "./pages/OrderDetailPage.tsx";
import SupplierListPage from './pages/SupplierListPage';
import CreateReceiptPage from "./pages/Warehouse/CreateReceiptPage.tsx";
import AdjustmentPage from "./pages/Warehouse/AdjustmentPage.tsx";
import UserListPage from "./pages/UserListPage.tsx";
import ForbiddenPage from "./pages/ForbiddenPage.tsx";
import RoleRoute from "./components/RoleRoute.tsx";

const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    SALES: 'ROLE_SALES_STAFF',
    WAREHOUSE: 'ROLE_WAREHOUSE_STAFF',
};

function App() {
    return (
        <RootStoreProvider>
            <BrowserRouter>
                <Routes>
                    {/* Route công khai */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/403" element={<ForbiddenPage />} />

                    {/* Các route được bảo vệ */}
                    <Route element={<ProtectedRoutes />}>
                        {/* Bọc các trang bằng MainLayout */}
                        <Route element={<MainLayout />}>
                            {/* --- 1. NHÓM PUBLIC (Ai đăng nhập cũng vào được) --- */}
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/products" element={<ProductListPage />} />
                            <Route path="/categories" element={<CategoryListPage />} />

                            {/* --- 2. NHÓM ADMIN & SALES --- */}
                            <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.SALES]} />}>
                                <Route path="/orders/new" element={<CreateOrderPage />} />
                                <Route path="/orders/list" element={<OrderListPage />} />
                                <Route path="/orders/:id" element={<OrderDetailPage />} />
                                <Route path="/customers" element={<CustomerListPage />} />
                            </Route>

                            {/* --- 3. NHÓM ADMIN & KHO --- */}
                            <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.WAREHOUSE]} />}>
                                <Route path="/suppliers" element={<SupplierListPage />} />
                                <Route path="/warehouse/receipts/new" element={<CreateReceiptPage />} />
                                <Route path="/warehouse/adjustments" element={<AdjustmentPage />} />
                            </Route>

                            {/* --- 4. NHÓM CHỈ ADMIN --- */}
                            <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
                                <Route path="/users" element={<UserListPage />} />
                            </Route>
                        </Route>
                    </Route>

                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </BrowserRouter>
        </RootStoreProvider>
    );
}

export default App;