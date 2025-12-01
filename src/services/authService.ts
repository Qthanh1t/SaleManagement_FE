import apiClient from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    email: string;
    fullName: string;
    role: string;
}

export interface UpdateProfileRequest {
    fullName: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<AuthResponse> => {
    // API trả về UserDTO, nhưng AuthResponse có cấu trúc tương tự (email, fullName, role)
    const response = await apiClient.put('/profile/info', data);
    return response.data;
}

export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put('/profile/change-password', data);
}