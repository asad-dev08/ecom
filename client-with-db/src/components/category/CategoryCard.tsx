import React from "react";
import { Link } from "react-router-dom";
import { Category } from "../../types/product";
import { BASE_URL } from "../../utils/actionTypes";

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="block group relative w-auto h-48 rounded-lg overflow-hidden"
    >
      <img
        src={`${BASE_URL}/${category.image}`}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="text-center">
          {category.icon && (
            <img
              src={`${BASE_URL}/${category.icon}`}
              alt=""
              className="w-8 h-8 mx-auto mb-2"
            />
          )}
          <h3 className="text-white font-semibold">{category.name}</h3>
          <p className="text-white/80 text-sm">
            {category.productCount} Products
          </p>
        </div>
      </div>
    </Link>
  );
};
