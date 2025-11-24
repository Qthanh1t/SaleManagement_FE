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

export const getDashboardStats = async (startDate?: string, endDate?: string): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats', {
        params: { startDate, endDate }
    });
    return response.data;
}