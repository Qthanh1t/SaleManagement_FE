import apiClient from './api';

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response.data;
};

// (Sẽ thêm create/update/delete sau)