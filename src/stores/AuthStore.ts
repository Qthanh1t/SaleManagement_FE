import { makeAutoObservable, runInAction } from "mobx";
import { login, type LoginCredentials, type AuthResponse } from "../services/authService";

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
    checkAuthOnLoad() {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        try {
            if (token && user) {
                // Nếu có token, đặt là 'success'
                runInAction(() => {
                    this.token = token;
                    this.user = JSON.parse(user);
                    this.status = "success";
                });
            } else {
                // Nếu KHÔNG có token, đặt là 'error'
                runInAction(() => {
                    this.status = "error";
                });
            }
        } catch (e) {
            // Xử lý nếu data user trong localStorage bị lỗi
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            runInAction(() => {
                this.status = "error";
            });
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