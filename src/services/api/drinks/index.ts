import axios from "@/services/axios";
import { ApiResponse } from "../utils/utils.types";
import { Drink } from "./drinks.types";
import { IProductStats } from "../product/product.types";

/**
 * Description: Send drinks data
 * @returns Promise
 */

// Get drinks overview
export const GetDrinksOverview = async (): Promise<
  ApiResponse<IProductStats>
> => {
  try {
    const url = "/admin/drink-store/quickstats";
    const res = await axios.get(url);
    return res.data as ApiResponse<IProductStats>;
  } catch (err) {
    throw err;
  }
};

// Get drinks
export const GetAllDrinks = async (): Promise<ApiResponse<Drink[]>> => {
  try {
    const url = "/admin/drinkstore/items";
    const res = await axios.get(url);
    return res.data as ApiResponse<Drink[]>;
  } catch (err) {
    throw err;
  }
};

// Get drink brands
export const GetDrinkBrands = async (): Promise<ApiResponse<Drink>> => {
  try {
    const url = "/admin/drinks/brands";
    const res = await axios.get(url);
    return res.data as ApiResponse<Drink>;
  } catch (err) {
    throw err;
  }
};

// Get drink sales
export const GetDrinkSales = async (): Promise<ApiResponse<Drink>> => {
  try {
    const url = "/admin/drinks/sales";
    const res = await axios.get(url);
    return res.data as ApiResponse<Drink>;
  } catch (err) {
    throw err;
  }
};
