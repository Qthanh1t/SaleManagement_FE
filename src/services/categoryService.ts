import apiClient from './api';

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface CategoryRequest {
    name: string;
    description?: string;
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response.data;
};

export const createCategory = async (data: CategoryRequest): Promise<Category> => {
    const response = await apiClient.post('/categories', data);
    return response.data;
}

export const updateCategory = async (id: number, data: CategoryRequest): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
}

export const deleteCategory = async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
}