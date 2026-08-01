import axios from "@/services/axios";
import { ApiResponse } from "../utils/utils.types";
import {
  IProductDetails,
  IProductResponse,
  ProductPayload,
} from "./product.types";

/**
 * Description: Send product data
 * @returns Promise
 */

// Get product details
export const GetProductDetails = async (
  id: string
): Promise<ApiResponse<IProductDetails>> => {
  try {
    const url = `/product/${id}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<IProductDetails>;
  } catch (err) {
    throw err;
  }
};

// Add product
export const AddProduct = async (payload: FormData) => {
  try {
    const url = `/product`;
    const res = await axios.post(url, payload);
    return res.data as ApiResponse<IProductResponse>;
  } catch (err) {
    throw err;
  }
};

// Update product
export const UpdateProduct = async (id: string, payload: ProductPayload) => {
  try {
    const url = `/product/update/${id}`;
    const res = await axios.post(url, payload);
    return res.data as ApiResponse<IProductResponse>;
  } catch (err) {
    throw err;
  }
};

// Delete product
export const DeleteProduct = async (id: string) => {
  try {
    const url = `/product/${id}`;
    const res = await axios.delete(url);
    return res.data as ApiResponse<IProductResponse>;
  } catch (err) {
    throw err;
  }
};
