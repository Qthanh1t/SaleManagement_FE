import apiClient from './api';

export interface TopProduct {
    productId: number;
    productName: string;
    totalSold: number;
}

export interface DashboardStats {
    totalRevenueToday: number;
    totalOrdersToday: number;
    newCustomersToday: number;
    topSellingProducts: TopProduct[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
}