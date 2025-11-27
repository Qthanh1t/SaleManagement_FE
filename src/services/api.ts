import axios from 'axios';
import { useStores } from '../stores/RootStore.tsx'; // Ta sẽ lấy store sau

// Lưu ý: Không thể dùng hook 'useStores' ở đây (bên ngoài React)
// Chúng ta sẽ cần một cách khác để truy cập token,
// hoặc cấu hình interceptor ở một nơi khác.

// Giải pháp đơn giản nhất là đọc từ localStorage,
// vì AuthStore của chúng ta đồng bộ với nó.

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Axios Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Đọc từ localStorage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Nếu Backend trả về 401 (Unauthorized) hoặc 403 (Forbidden)
        if (error.response) {
            const {status} = error.response;

            // ĐĂNG XUẤT KHI LỖI 401 (Token hết hạn/không hợp lệ)
            if (status === 401) {
                if (window.location.pathname !== '/login') {
                    // Xóa token
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');

                    // Chuyển hướng về login
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;