import React from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import { ShoppingCartIcon, HeartIcon, StarIcon } from "lucide-react";
import { BASE_URL } from "../../utils/actionTypes";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string | number;
    salePrice?: string | number | null;
    onSale?: boolean;
    hasOffer?: boolean;
    thumbnail: string;
    rating?: number;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    stock_quantity?: number;
    description?: string;
    brand?: {
      id: string;
      name: string;
      slug: string;
    };
    subcategory?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if ((e.target as HTMLElement).closest(".action-button")) {
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking action buttons
  };

  return (
    <div className="group relative cursor-pointer" onClick={handleCardClick}>
      {/* Card Container */}
      <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative flex-shrink-0">
          {/* Sale Badge */}
          {product.salePrice && (
            <div className="absolute left-4 top-4 z-10">
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                Sale
              </span>
            </div>
          )}

          {/* Stock Status */}
          {product.stock_quantity !== undefined &&
            product.stock_quantity <= 5 && (
              <div className="absolute right-4 top-4 z-10">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    product.stock_quantity === 0
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {product.stock_quantity === 0
                    ? "Out of Stock"
                    : `${product.stock_quantity} left`}
                </span>
              </div>
            )}

          {/* Product Image */}
          <div className="aspect-[4/3] w-full overflow-hidden bg-gray-200">
            <img
              src={`${BASE_URL}/${product.thumbnail}`}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-full items-center justify-center gap-2">
              <Tooltip title="Add to Cart">
                <button
                  className="action-button rounded-full bg-white p-2 text-gray-900 shadow-sm hover:bg-secondary-50"
                  onClick={handleActionClick}
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                </button>
              </Tooltip>
              <Tooltip title="Add to Wishlist">
                <button
                  className="action-button rounded-full bg-white p-2 text-gray-900 shadow-sm hover:bg-secondary-50"
                  onClick={handleActionClick}
                >
                  <HeartIcon className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4">
          {/* Category & Brand */}
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
            <span>{product.category.name || ""}</span>
            {product.brand && (
              <>
                <span>•</span>
                <span>{product.brand.name || ""}</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h3 className="mb-2 flex-1 font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating !== undefined && (
            <div className="mb-2 flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <StarIcon
                    key={index}
                    className={`h-4 w-4 ${
                      index < Math.floor(product.rating!)
                        ? "text-yellow-400"
                        : "text-gray-200"
                    }`}
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                $
                {formatPrice(
                  Number(product.salePrice) > 0
                    ? Number(product.salePrice)
                    : Number(product.price)
                )}
              </span>
              {(product.onSale || product.hasOffer) && (
                <span className="text-sm text-gray-500 line-through">
                  ${formatPrice(product.price)}
                </span>
              )}
            </div>
            {product.stock_quantity !== undefined &&
              product.stock_quantity > 0 && (
                <span className="text-xs text-gray-500">In stock</span>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
