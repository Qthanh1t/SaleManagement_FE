import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootStoreProvider } from './stores/RootStore';
import LoginPage from './pages/LoginPage';
import ProtectedRoutes from './components/ProtectedRoutes';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './components/MainLayout';
import ProductListPage from './pages/ProductListPage';
import '@ant-design/v5-patch-for-react-19';

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
                            {/* <Route path="/orders" element={<OrderPage />} /> */}
                            {/* <Route path="/customers" element={<CustomerPage />} /> */}
                        </Route>
                    </Route>

                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </BrowserRouter>
        </RootStoreProvider>
    );
}

export default App;