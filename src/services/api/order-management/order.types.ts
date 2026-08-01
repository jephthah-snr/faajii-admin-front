interface Receiver {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: number;
  reference: string;
  giftRef: string;
  orderAmount: number;
  paymentStatus: string;
  deliveryStatus: string;
  recipientStatus: string;
  recipientResponseAction: string;
  createdAt: string;
  completedAt: string;
  eventName: string;
  productName: string;
  productImage: string;
  isCashGift: boolean;
  productCategory: string;
  deliveryAddress: string;
  notes: string;
  receiver: Receiver;
  status: string;
}

export interface OrdersResponse {
  page: number;
  numberOfItems: number;
  data: Order[];
}
