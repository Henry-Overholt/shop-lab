import { ObjectId } from "mongodb";
import Product from "./Product";

export default interface CartItem {
  _id?: ObjectId;
  userId: string;
  product: Product;
  quantity: number;
}
