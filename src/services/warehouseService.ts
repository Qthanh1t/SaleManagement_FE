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

export interface ExtractedItem {
    productName: string;
    quantity: number;
    price: number;
}

export interface ExtractedInvoice {
    supplierName: string;
    invoiceDate: string;
    totalAmount: number;
    items: ExtractedItem[];
}

// Gọi API scan
export const scanInvoice = async (file: File): Promise<ExtractedInvoice> => {
    const formData = new FormData();
    formData.append('file', file);

    // Lưu ý: Content-Type multipart/form-data axios tự xử lý
    const response = await apiClient.post('/ai/scan-invoice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
}