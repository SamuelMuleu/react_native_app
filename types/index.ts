export interface Product {
  id: string;
  name: string;
  category: string;
  sellPrice: number;
  costPrice: number;
  stock?: number;
  createdAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  profit: number;
  timestamp: Date;
}

export interface DashboardData {
  totalSales: number;
  totalProfit: number;
  totalCosts: number;
  salesCount: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export type TabParamList = {
  dashboard: undefined;
  products: undefined;
  sales: undefined;
  settings: undefined;
};

export type DateFilter = 'today' | 'week' | 'month';