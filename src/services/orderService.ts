import apiClient from './api';
import type {Page} from "./productService.ts";

export interface OrderItemRequest {
    productId: number;
    quantity: number;
}

export interface OrderCreateRequest {
    customerId: number;
    items: OrderItemRequest[];
}

export interface OrderDetail {
    productId: number;
    productName: string;
    productSku: string;
    quantity: number;
    priceAtPurchase: number;
}

export interface Order {
    id: number;
    orderDate: string; // (Instant -> string)
    totalAmount: number;
    status: string;
    customerName: string;
    customerPhone: string;
    userName: string; // Tên nhân viên
    orderDetails: OrderDetail[];
}

export const createOrder = async (data: OrderCreateRequest): Promise<number> => {
    const response = await apiClient.post('/orders', data);
    return response.data; // Trả về Order ID
}

// Lấy danh sách (phân trang)
export const getOrders = async (page = 0, size = 10): Promise<Page<Order>> => {
    const response = await apiClient.get('/orders', {
        params: { page, size, sort: 'orderDate,desc' } // Sắp xếp mới nhất
    });
    return response.data;
}

// Lấy chi tiết
export const getOrderById = async (id: number): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
}