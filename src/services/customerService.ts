import apiClient from './api';

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