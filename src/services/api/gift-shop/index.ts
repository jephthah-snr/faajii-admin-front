import axios from "@/services/axios";
import { ApiResponse } from "../utils/utils.types";
import { IGiftShop, IGiftShopSalesResponse } from "./gift-shop.types";
import { IProductStats } from "../product/product.types";

/**
 * Description: Send gift data
 * @returns Promise
 */

// Get gifts stats
export const GetGiftsStats = async (): Promise<ApiResponse<IProductStats>> => {
  try {
    const url = "/admin/gift-store/quickstats";
    const res = await axios.get(url);
    return res.data as ApiResponse<IProductStats>;
  } catch (err) {
    throw err;
  }
};

// Get all gifts
export const GetAllGifts = async (): Promise<ApiResponse<IGiftShop[]>> => {
  try {
    const url = "/product/gift-store/items";
    const res = await axios.get(url);
    return res.data as ApiResponse<IGiftShop[]>;
  } catch (err) {
    throw err;
  }
};

// Get gift Sales
export const GetGiftSales = async (): Promise<
  ApiResponse<IGiftShopSalesResponse>
> => {
  try {
    const url = "/wishbasket/sales";
    const res = await axios.get(url);
    return res.data as ApiResponse<IGiftShopSalesResponse>;
  } catch (err) {
    throw err;
  }
};
