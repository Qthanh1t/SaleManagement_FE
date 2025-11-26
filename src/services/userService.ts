import apiClient from './api';
import type {Page} from './productService';

export interface User {
    id: number;
    fullName: string;
    email: string;
    roleName: string;
    roleId: number;
}

export interface UserCreateRequest {
    fullName: string;
    email: string;
    password: string;
    roleId: number;
}

export const getUsers = async (page = 0, size = 10): Promise<Page<User>> => {
    const response = await apiClient.get('/users', { params: { page, size } });
    return response.data;
}

export const createUser = async (data: UserCreateRequest): Promise<User> => {
    const response = await apiClient.post('/users', data);
    return response.data;
}

export const deleteUser = async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
}