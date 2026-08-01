export interface Drink {
  ref: string | null;
  id: number;
  name: string;
  amount: number;
  description: string;
  images: string[];
  drinkStoreId: number;
  quantity: number;
  availableColors: string[];
  initialQuantity: number;
  unitsSold: number;
  totalSales: number;
  created_at: string;
  updated_at: string;
  productType: string;
  productId: string;
  isDeleted: boolean;
  total: number;
}
