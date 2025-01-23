import React, { useEffect } from "react";
import { Slider } from "antd";
import { FilterState } from "../../pages/Products";

interface PriceRangeFilterProps {
  priceRange: { min: number; max: number };
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  priceRange,
  filters,
  onFilterChange,
}) => {
  // Initialize price range when it changes
  useEffect(() => {
    if (
      priceRange.min !== undefined &&
      priceRange.max !== undefined &&
      (filters.price[0] === 0 || filters.price[1] === 0)
    ) {
      onFilterChange({
        ...filters,
        price: [priceRange.min, priceRange.max],
      });
    }
  }, [priceRange.min, priceRange.max]);

  return (
    <div className="border-b pb-6">
      <h3 className="font-medium mb-4">Price Range</h3>
      <Slider
        range
        min={priceRange.min}
        max={priceRange.max}
        value={[
          filters.price[0] !== priceRange.min
            ? filters.price[0]
            : priceRange.min,
          filters.price[1] !== priceRange.max
            ? filters.price[1]
            : priceRange.max,
        ]}
        onChange={(value: number[]) => {
          const newPrice = value as [number, number];
          onFilterChange({
            ...filters,
            price: newPrice,
          });
        }}
        tipFormatter={(value) => `$${value}`}
      />
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span>${filters.price[0]}</span>
        <span>${filters.price[1]}</span>
      </div>
    </div>
  );
};
