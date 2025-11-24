import apiClient from './api';

export interface ReceiptItemRequest {
    productId: number;
    quantity: number;
    entryPrice: number;
}

export interface CreateReceiptRequest {
    supplierId: number;
    note?: string;
    items: ReceiptItemRequest[];
}

export interface AdjustmentRequest {
    productId: number;
    newQuantity: number;
    reason: string;
}

export const createReceipt = async (data: CreateReceiptRequest): Promise<void> => {
    await apiClient.post('/warehouse/receipts', data);
}

export const adjustStock = async (data: AdjustmentRequest): Promise<void> => {
    await apiClient.post('/warehouse/adjustments', data);
}