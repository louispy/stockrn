import { Product } from "./product.type";

export interface Purchase {
  _id: string;
  items: Product[];
  notes: string;
  purchaser: string;
  createdAt: Date;
  updatedAt: Date;
}
