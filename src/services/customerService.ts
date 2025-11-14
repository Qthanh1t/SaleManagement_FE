import apiClient from './api';
import type {Page} from "./productService.ts";

export interface Customer {
    id: number;
    fullName: string;
    phoneNumber: string;
    email?: string;
    address?: string;
}

// Dùng cho form tạo nhanh
export interface CustomerCreateRequest {
    fullName: string;
    phoneNumber: string;
    email?: string;
    address?: string;
}
// Dùng cho form tạo/sửa
export interface CustomerRequest {
    fullName: string;
    phoneNumber: string;
    email?: string;
    address?: string;
}

export const searchCustomers = async (phone: string): Promise<Customer[]> => {
    const response = await apiClient.get('/customers/search', {
        params: { phone }
    });
    return response.data;
};

export const createCustomer = async (data: CustomerCreateRequest): Promise<Customer> => {
    const response = await apiClient.post('/customers', data);
    return response.data;
}

export const getCustomers = async (page = 0, size = 10): Promise<Page<Customer>> => {
    const response = await apiClient.get('/customers', {
        params: { page, size, sort: 'fullName' }
    });
    return response.data;
}

export const updateCustomer = async (id: number, data: CustomerRequest): Promise<Customer> => {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
}

export const deleteCustomer = async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
}