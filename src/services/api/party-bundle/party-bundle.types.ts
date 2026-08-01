export interface IPartyBundleOverview {
  totalRevenue: string;
  totalOrders: number;
  completedOrders: number;
  completionPercentage: string;
  totalItemsSold: string;
}

export interface IPartyBundle {
  id: number;
  ref: string;
  name: string;
  amount: number;
  description: string;
  images: string[];
  isDeleted: boolean;
  drinkStoreId: number;
  quantity: number;
  productType: string;
  availableColors: string[] | null;
  initialQuantity: number | null;
  totalSales: number;
  isExternalProduct: boolean | null;
  purchaseLink: string | null;
  unitsSold: number;
  created_at: string;
  updated_at: string;
  productId: string;
  status: string;
}

export interface IPartyBundleDetails {
  id: number;
  ref: string | null;
  name: string;
  amount: number;
  description: string;
  images: string[];
  isDeleted: number;
  drinkStoreId: string | null;
  quantity: number;
  productType: string;
  availableColors: string[] | null;
  initialQuantity: number | null;
  totalSales: number | null;
  isExternalProduct: boolean | null;
  purchaseLink: string | null;
  unitsSold: number | null;
  created_at: string;
  updated_at: string;
  productId: string;
  status: string;
}
