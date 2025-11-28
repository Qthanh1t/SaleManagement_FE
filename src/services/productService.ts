import apiClient from './api';
// import { Category } from './categoryService';

// Dùng cho Form (Tạo/Sửa)
export interface ProductRequest {
    sku: string;
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    initialStock: number;
    imageUrl?: string;
}

// Dùng để hiển thị
export interface Product {
    id: number;
    sku: string;
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    categoryName: string;
    stockQuantity: number;
    imageUrl?: string;
    isActive: boolean;
}

// Kiểu trả về từ API Spring (Pageable)
export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; // trang hiện tại (từ 0)
}

// Lấy danh sách sản phẩm (có phân trang)
export const getProducts = async (page = 0, size = 10, search = '', categoryId?: number | null): Promise<Page<Product>> => {
    const response = await apiClient.get('/products', {
        params: {
            page,
            size,
            search,
            categoryId,
        }
    });
    return response.data;
}

export const searchProducts = async (search: string): Promise<Product[]> => {
    // Gọi API getProducts nhưng chỉ lấy 10 kết quả
    const response = await getProducts(0, 10, search);
    return response.content;
}

// Tạo sản phẩm
export const createProduct = async (data: ProductRequest): Promise<Product> => {
    const response = await apiClient.post('/products', data);
    return response.data;
}

// Sửa sản phẩm
export const updateProduct = async (id: number, data: ProductRequest): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
}

// Xóa sản phẩm
export const deleteProduct = async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
}

// Sản phẩm sắp hết
export const getLowStockProducts = async (threshold = 5): Promise<Product[]> => {
    const response = await apiClient.get('/products/low-stock', {
        params: { threshold }
    });
    return response.data;
}