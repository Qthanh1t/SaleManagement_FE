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

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
};