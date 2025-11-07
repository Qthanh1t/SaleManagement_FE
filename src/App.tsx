import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootStoreProvider } from './stores/RootStore.tsx';
import LoginPage from './pages/LoginPage';
import ProtectedRoutes from './components/ProtectedRoutes';
import DashboardPage from './pages/DashboardPage'; // Trang "chào mừng"
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
                        <Route path="/" element={<DashboardPage />} />
                        {/* Thêm các route khác ở đây, ví dụ: */}
                        {/* <Route path="/products" element={<ProductPage />} /> */}
                    </Route>

                    {/* Route 404 (Tùy chọn) */}
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </BrowserRouter>
        </RootStoreProvider>
    );
}

export default App;