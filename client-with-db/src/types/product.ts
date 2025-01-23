export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  thumbnail: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  attributes: ProductAttribute[];
  variants?: ProductVariant[];
  hasVariants: boolean;
  tags: string[];
  stock?: number;
  rating: number;
  reviewCount: number;
  seller: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
  };
  status: "active" | "inactive" | "draft";
  isFeatured: boolean;
  isNew: boolean;
  onSale: boolean;
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
}

export interface ProductAttribute {
  name: string;
  type: AttributeType;
  value: string | number;
  unit?: string;
  options?: string[];
  displayValue?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sequence_no: number;
  images?: string[];
  attributes: {
    [key: string]: string | { name: string; value: string };
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  featured?: boolean;
  parentId?: string;
  subcategories?: SubCategory[];
  productCount: number;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  image?: string;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
}

export interface Seller {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  description?: string;
  contactInfo?: {
    email: string;
    phone: string;
    address: string;
  };
}

// Additional helper types
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  helpful: number;
  user: {
    name: string;
    avatar?: string;
  };
  verified: boolean;
}

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  price: [number, number];
  rating?: number;
  attributes?: Record<string, string[]>;
  inStock?: boolean;
  onSale?: boolean;
  sortBy?: "price-asc" | "price-desc" | "rating" | "newest" | "popular";
}

export interface ProductSortOption {
  label: string;
  value: string;
}

export const PRODUCT_SORT_OPTIONS: ProductSortOption[] = [
  { label: "Latest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
  { label: "Popularity", value: "popular" },
];

export type ProductStatus = "active" | "inactive" | "draft";

export interface ProductInventory {
  productId: string;
  variantId?: string;
  quantity: number;
  reservedQuantity: number;
  lastUpdated: string;
}

// Constants
export const PRODUCT_STATUSES: Record<ProductStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  draft: "Draft",
};

export const DEFAULT_PRODUCT_IMAGE = "/images/placeholder-product.jpg";

export const MAX_PRODUCT_IMAGES = 8;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  helpful: number;
}

// Product Attribute Types
export type AttributeType =
  | "size"
  | "weight"
  | "color"
  | "dimension"
  | "material"
  | "technical";
