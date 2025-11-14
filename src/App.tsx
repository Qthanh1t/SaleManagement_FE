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

function App() {
    return (
        <RootStoreProvider>
            <BrowserRouter>
                <Routes>
                    {/* Route công khai */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Các route được bảo vệ */}
                    <Route element={<ProtectedRoutes />}>
                        {/* Bọc các trang bằng MainLayout */}
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/products" element={<ProductListPage />} />
                            <Route path="/categories" element={<CategoryListPage />} />
                            <Route path="/orders/new" element={<CreateOrderPage />} />
                            <Route path="/orders/list" element={<OrderListPage />} />
                            <Route path="/orders/:id" element={<OrderDetailPage />} />
                            <Route path="/customers" element={<CustomerListPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </BrowserRouter>
        </RootStoreProvider>
    );
}

export default App;