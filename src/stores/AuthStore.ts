import { makeAutoObservable, runInAction } from "mobx";
import {login, type LoginCredentials, type AuthResponse, getCurrentUser} from "../services/authService";

interface User {
    email: string;
    fullName: string;
    role: string;
}

export class AuthStore {
    // Observables (Trạng thái)
    token: string | null = null;
    user: User | null = null;
    status: "idle" | "pending" | "success" | "error" = "idle"; // Trạng thái tải

    constructor() {
        makeAutoObservable(this);
        // Tự động chạy hàm này khi store được tạo
        this.checkAuthOnLoad();
    }

    // Computed (Trạng thái tính toán)
    get isAuthenticated() {
        return !!this.token && !!this.user;
    }

    // Action: Kiểm tra auth khi tải trang
    async checkAuthOnLoad() {
        const token = localStorage.getItem("token");

        if (token) {
            // Có token, nhưng chưa tin vội. Đặt trạng thái pending để UI có thể hiện loading
            runInAction(() => {
                this.token = token; // Tạm thời set token để Axios Interceptor có cái mà gửi đi
                this.status = "pending";
            });

            try {
                // Gọi API để xác thực token và lấy thông tin user mới nhất
                const userData: AuthResponse = await getCurrentUser();

                runInAction(() => {
                    this.user = {
                        email: userData.email,
                        fullName: userData.fullName,
                        role: userData.role
                    };
                    // Cập nhật lại user vào localStorage cho đồng bộ
                    localStorage.setItem("user", JSON.stringify(this.user));
                    this.status = "success";
                });
            } catch (error) {
                // Token hết hạn hoặc không hợp lệ -> Logout
                console.error("Token invalid or expired", error);
                this.logout();
            }
        } else {
            // Không có token trong kho
            this.logout();
        }
    }

    // Action: Đăng nhập
    async login(credentials: LoginCredentials) {
        this.status = "pending";
        try {
            const response: AuthResponse = await login(credentials);

            // Lưu vào localStorage
            localStorage.setItem("token", response.token);
            const userData = { email: response.email, fullName: response.fullName, role: response.role };
            localStorage.setItem("user", JSON.stringify(userData));

            // Cập nhật state (trong 1 runInAction)
            runInAction(() => {
                this.token = response.token;
                this.user = userData;
                this.status = "success";
            });
        } catch (error) {
            runInAction(() => {
                this.status = "error";
            });
            throw error; // Ném lỗi ra để component Form xử lý
        }
    }

    // Action: Đăng xuất
    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.token = null;
        this.user = null;
        this.status = "error";
    }
}