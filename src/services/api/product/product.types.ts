export interface ProductPayload {
  name: string;
  amount: string | number;
  description: string;
  images: File | null;
  quantity: string | number;
  productType: string; // 'gift' or 'drink'
}

export interface IProductResponse {
  status: boolean;
  message: string;
}

export interface IProductStats {
  inventoryVolume: number;
  inventoryValue: string;
  itemsSold: string | number;
  reveneGenerated: string | number;
  orderFufilment: string;
}

export interface IProduct {
  id: number;
  ref: string;
  name: string;
  amount: number;
  description: string;
  images: string[];
  drinkStoreId: string;
  quantity: number;
  productType: "drink" | "gift";
  availableColors: string[];
  initialQuantity: number;
  totalSales: number;
  unitsSold: number;
  created_at: string;
  updated_at: string;
  productId: string;
  total: number;
}

export interface IProductDetails {
  id: number;
  ref: string;
  name: string;
  amount: number;
  description: string;
  images: string[];
  drinkStoreId: number;
  quantity: number;
  productType: "drink" | "gift";
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
