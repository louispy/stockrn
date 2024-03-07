export interface OrderItem {
  productCode: string;
  quantity: number;
  price: number;
  priceWarning?: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  notes?: string;
  admin?: string;
  buyer?: string;
  createdAt: Date;
  updatedAt: Date;
}
