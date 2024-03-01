export interface PurchaseItem {
  productCode: string;
  quantity: number;
  price: number;
}

export interface Purchase {
  _id: string;
  items: PurchaseItem[];
  notes: string;
  purchaser: string;
  createdAt: Date;
  updatedAt: Date;
}
