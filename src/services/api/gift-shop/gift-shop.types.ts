export interface IGiftShop {
  id: number;
  ref: string;
  name: string;
  amount: number;
  description: string;
  images: string[];
  drinkStoreId: string;
  quantity: number;
  productType: string;
  availableColors: string[];
  initialQuantity: number;
  totalSales: number;
  unitsSold: number;
  created_at: string;
  updated_at: string;
  productId: string;
  total: number;
  status: string;
}

export interface IGiftShopSalesResponse {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
