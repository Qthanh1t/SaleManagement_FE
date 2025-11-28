import apiClient from './api';
import type {Page} from './productService';

export interface Supplier {
    id: number;
    name: string;
    contactPerson?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    isActive: boolean;
}

export interface SupplierRequest {
    name: string;
    contactPerson?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
}

export const getSuppliers = async (page = 0, size = 10): Promise<Page<Supplier>> => {
    const response = await apiClient.get('/suppliers', {
        params: { page, size, sort: 'name' }
    });
    return response.data;
}

export const createSupplier = async (data: SupplierRequest): Promise<Supplier> => {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
}

export const updateSupplier = async (id: number, data: SupplierRequest): Promise<Supplier> => {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
}

export const deleteSupplier = async (id: number): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
}