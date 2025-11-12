import apiClient from './api';

export interface OrderItemRequest {
    productId: number;
    quantity: number;
}

export interface OrderCreateRequest {
    customerId: number;
    items: OrderItemRequest[];
}

export const createOrder = async (data: OrderCreateRequest): Promise<number> => {
    const response = await apiClient.post('/orders', data);
    return response.data; // Trả về Order ID
}