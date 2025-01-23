import { Product } from "../types/product";

export const calculatePriceRange = (products: Product[]) => {
  if (!products || products.length === 0) {
    return { min: 0, max: 1000 };
  }

  return {
    min: Math.floor(Math.min(...products.map((p) => p.price))),
    max: Math.ceil(Math.max(...products.map((p) => p.price))),
  };
};
