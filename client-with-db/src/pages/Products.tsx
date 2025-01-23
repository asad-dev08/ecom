import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useSearchParams,
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { ChevronDown, X, ChevronRight, Home } from "lucide-react";
import { Checkbox, Radio, Card, Pagination } from "antd";
import { Category, Product, SubCategory } from "../types/product";
import { useQuery } from "@tanstack/react-query";
import { productAPI, ProductParams } from "../services/api";
import { debounce } from "lodash";
import { PriceRangeFilter } from "../components/filters/PriceRangeFilter";
import { calculatePriceRange } from "../utils/price";

export interface FilterState {
  category: string[];
  subcategory: string[];
  brand: string[];
  price: [number, number];
  rating: number | null;
  sort: string;
  inStock: boolean;
  onSale: boolean;
  page: number;
  attributes: {
    [key: string]: string[];
  };
  variants: {
    [key: string]: string[];
  };
}

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating: High to Low", value: "rating_desc" },
  { label: "Most Popular", value: "popular" },
];

interface AvailableFilters {
  brands: Array<{ id: string; name: string; slug: string }>;
  attributes: { [key: string]: string[] };
  priceRange: { min: number; max: number };
}

export const Products = () => {
  const navigate = useNavigate();
  const { categorySlug, subcategorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isPriceSliderTouched, setIsPriceSliderTouched] = useState(false);

  // Move all hooks to the top
  const [filters, setFilters] = useState<FilterState>(() => ({
    category: getCategoryFilters(),
    subcategory: getSubcategoryFilters(),
    brand: searchParams.getAll("brand"),
    price: [
      Number(searchParams.get("minPrice")) || 0,
      Number(searchParams.get("maxPrice")) || 0,
    ],
    rating: searchParams.get("rating")
      ? Number(searchParams.get("rating"))
      : null,
    sort: searchParams.get("sort") || "newest",
    inStock: searchParams.get("inStock") === "true",
    onSale: searchParams.get("onSale") === "true",
    page: Number(searchParams.get("page")) || 1,
    attributes: Object.fromEntries(
      Array.from(searchParams.entries())
        .filter(([key]) => key.startsWith("attr_"))
        .map(([key]) => [key.replace("attr_", ""), searchParams.getAll(key)])
    ),
    variants: Object.fromEntries(
      Array.from(searchParams.entries())
        .filter(([key]) => key.startsWith("variant_"))
        .map(([key]) => [key.replace("variant_", ""), searchParams.getAll(key)])
    ),
  }));
  // Fetch products
  const queryParams: ProductParams = useMemo(() => {
    const params: ProductParams = {
      page: filters.page,
      limit: 12,
      sort: filters.sort as ProductParams["sort"],
      category: searchParams.get("category") || undefined,
      subcategory: searchParams.get("subcategory") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      inStock: searchParams.get("inStock") === "true",
      onSale: searchParams.get("onSale") === "true",
      rating: filters.rating ? filters.rating : undefined,
      brand: filters.brand.length > 0 ? filters.brand.join(",") : undefined,
    };

    // Add attribute filters to params
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (key.startsWith("attr_")) {
        params[key] = value;
      }
    });

    return params;
  }, [filters, categorySlug, subcategorySlug]);

  const {
    data: productsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productAPI.getProducts(queryParams),
  });

  // Extract the data from the response
  const { data: { products: filteredProducts = [], pagination = null } = {} } =
    productsResponse || {};

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await productAPI.getCategories();
      return response.data;
    },
  });

  // Replace mock data with real data
  const categories = categoriesData || [];

  const debouncedUpdateUrl = useMemo(
    () =>
      debounce((minPrice: number, maxPrice: number) => {
        if (!isPriceSliderTouched) return; // Don't update URL if slider hasn't been touched

        const params = new URLSearchParams(window.location.search);

        if (minPrice > 0) {
          params.set("minPrice", minPrice.toString());
        } else {
          params.delete("minPrice");
        }

        if (maxPrice < priceRange.max) {
          params.set("maxPrice", maxPrice.toString());
        } else {
          params.delete("maxPrice");
        }

        const queryString = params.toString();
        const newUrl = queryString
          ? `${window.location.pathname}?${queryString}`
          : window.location.pathname;
        navigate(newUrl, { replace: true });
        setIsPriceSliderTouched(false); // Reset the flag after updating URL
      }, 1000),
    [navigate, isPriceSliderTouched]
  );

  // Helper function to get category filters
  function getCategoryFilters(): string[] {
    if (categorySlug) {
      return [categorySlug];
    }
    const categoryParam = searchParams.get("category");
    return categoryParam ? categoryParam.split(",") : [];
  }

  // Helper function to get subcategory filters
  function getSubcategoryFilters(): string[] {
    if (subcategorySlug) {
      return [subcategorySlug];
    }
    const subcategoryParam = searchParams.get("subcategory");
    return subcategoryParam ? subcategoryParam.split(",") : [];
  }
  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      category: getCategoryFilters(),
      subcategory: getSubcategoryFilters(),
      brand: searchParams.getAll("brand"),
      price: [
        Number(searchParams.get("minPrice")) || prevFilters.price[0],
        Number(searchParams.get("maxPrice")) || prevFilters.price[1],
      ],
      rating: searchParams.get("rating")
        ? Number(searchParams.get("rating"))
        : prevFilters.rating,
      sort: searchParams.get("sort") || prevFilters.sort,
      inStock: searchParams.get("inStock") === "true",
      onSale: searchParams.get("onSale") === "true",
      page: Number(searchParams.get("page")) || prevFilters.page,
      attributes: {
        ...prevFilters.attributes,
        ...Object.fromEntries(
          Array.from(searchParams.entries())
            .filter(([key]) => key.startsWith("attr_"))
            .map(([key]) => [
              key.replace("attr_", ""),
              searchParams.getAll(key),
            ])
        ),
      },
      variants: {
        ...prevFilters.variants,
        ...Object.fromEntries(
          Array.from(searchParams.entries())
            .filter(([key]) => key.startsWith("variant_"))
            .map(([key]) => [
              key.replace("variant_", ""),
              searchParams.getAll(key),
            ])
        ),
      },
    }));
  }, [searchParams, categorySlug, subcategorySlug]);

  // Handle URL parameter updates
  const updateUrlParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();

      // Handle categories
      if (!categorySlug && newFilters.category.length > 0) {
        params.set("category", newFilters.category.join(","));
      }

      // Handle subcategories
      if (!subcategorySlug && newFilters.subcategory.length > 0) {
        params.set("subcategory", newFilters.subcategory.join(","));
      }

      // Handle brands - only add if there are brands selected
      if (newFilters.brand.length > 0) {
        newFilters.brand.forEach((brand) => params.append("brand", brand));
      }

      // Handle price range - only add if not default values
      if (newFilters.price[0] !== priceRange.min && priceRange.min > 0) {
        params.set("minPrice", newFilters.price[0].toString());
      }
      if (newFilters.price[1] !== priceRange.max) {
        params.set("maxPrice", newFilters.price[1].toString());
      }

      // Handle rating
      if (newFilters.rating) {
        params.set("rating", newFilters.rating.toString());
      }

      // Handle sort - only add if not default
      if (newFilters.sort !== "newest") {
        params.set("sort", newFilters.sort);
      }

      // Handle boolean filters - only add if true
      if (newFilters.inStock) {
        params.set("inStock", "true");
      }
      if (newFilters.onSale) {
        params.set("onSale", "true");
      }

      // Handle page - only add if not first page
      if (newFilters.page > 1) {
        params.set("page", newFilters.page.toString());
      }

      // Handle attributes - only add non-empty arrays
      Object.entries(newFilters.attributes).forEach(([key, values]) => {
        if (values && values.length > 0) {
          values.forEach((value) => params.append(`attr_${key}`, value));
        }
      });

      // Handle variant filters
      Object.entries(newFilters.variants).forEach(([name, values]) => {
        if (values && values.length > 0) {
          values.forEach((value) => params.append(`variant_${name}`, value));
        }
      });

      // Update URL only if there are parameters
      const queryString = params.toString();
      const newUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;

      navigate(newUrl, { replace: true });
    },
    [navigate, categorySlug, subcategorySlug]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterType: keyof FilterState, value: any) => {
      setFilters((prev) => {
        const newFilters = { ...prev };

        switch (filterType) {
          case "category":
          case "subcategory":
          case "brand":
            if (Array.isArray(value)) {
              newFilters[filterType] = value;
            } else {
              const currentArray = newFilters[filterType] as string[];
              const index = currentArray.indexOf(value);
              if (index > -1) {
                newFilters[filterType] = currentArray.filter(
                  (item) => item !== value
                );
              } else {
                newFilters[filterType] = [...currentArray, value];
              }
            }
            newFilters.page = 1;
            break;
          case "price":
            newFilters.price = value;
            break;
          case "attributes":
            newFilters.attributes = value;
            newFilters.page = 1; // Reset page when changing attributes
            break;
          case "rating":
            if (typeof value === "number") {
              newFilters.rating = value;
            } else if (value === null) {
              newFilters.rating = null;
            }
            newFilters.page = 1; // Reset page when changing rating
            break;
          case "variants":
            newFilters.variants = value;
            newFilters.page = 1; // Reset page when changing variants
            break;
          default:
            newFilters[filterType] = value as never;
        }

        updateUrlParams(newFilters);
        return newFilters;
      });
    },
    [updateUrlParams]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    navigate("/products");

    setFilters({
      category: [],
      subcategory: [],
      brand: [],
      price: [0, 1000],
      rating: null,
      sort: "newest",
      inStock: false,
      onSale: false,
      page: 1,
      attributes: {},
      variants: {},
    });
  }, [navigate]);

  // Remove individual filter
  const removeFilter = useCallback(
    (type: string, value: string) => {
      const params = new URLSearchParams(window.location.search);

      setFilters((prev) => {
        const newFilters = { ...prev };

        switch (type.toLowerCase()) {
          case "category":
            newFilters.category = prev.category.filter((cat) => cat !== value);
            params.delete("category");
            if (newFilters.category.length > 0) {
              params.set("category", newFilters.category.join(","));
            }
            break;

          case "subcategory":
            newFilters.subcategory = prev.subcategory.filter(
              (sub) => sub !== value
            );
            params.delete("subcategory");
            if (newFilters.subcategory.length > 0) {
              params.set("subcategory", newFilters.subcategory.join(","));
            }
            break;

          case "brand":
            newFilters.brand = prev.brand.filter((b) => b !== value);
            params.delete("brand");
            newFilters.brand.forEach((brand) => params.append("brand", brand));
            break;

          case "price":
            newFilters.price = [0, priceRange.max];
            params.delete("minPrice");
            params.delete("maxPrice");
            break;

          case "rating":
            newFilters.rating = null;
            params.delete("rating");
            break;

          case "availability":
            if (value === "In Stock") {
              newFilters.inStock = false;
              params.delete("inStock");
            }
            break;

          case "special":
            if (value === "On Sale") {
              newFilters.onSale = false;
              params.delete("onSale");
            }
            break;

          case "variant_":
            const variantName = type.replace("variant_", "");
            newFilters.variants = {
              ...prev.variants,
              [variantName]: prev.variants[variantName].filter(
                (v) => v !== value
              ),
            };
            if (newFilters.variants[variantName].length === 0) {
              delete newFilters.variants[variantName];
            }
            break;

          default:
            // Handle attribute filters
            const attributeName = type;
            if (prev.attributes[attributeName]) {
              newFilters.attributes = {
                ...prev.attributes,
                [attributeName]: prev.attributes[attributeName].filter(
                  (v) =>
                    v.toString().toLocaleLowerCase() !==
                    value.toString().toLocaleLowerCase()
                ),
              };

              // Remove the attribute key if no values are left
              if (newFilters.attributes[attributeName].length === 0) {
                delete newFilters.attributes[attributeName];
              }

              // Update URL parameters
              const attrKey = `attr_${attributeName}`;
              params.delete(attrKey);

              // Re-add remaining values if any exist
              if (newFilters.attributes[attributeName]?.length > 0) {
                newFilters.attributes[attributeName].forEach((val) => {
                  params.append(attrKey, val);
                });
              }
            }
        }

        // Update URL with new params
        const queryString = params.toString();
        const newUrl = queryString
          ? `${window.location.pathname}?${queryString}`
          : window.location.pathname;
        navigate(newUrl, { replace: true });

        return newFilters;
      });
    },
    [navigate, updateUrlParams]
  );

  // Convert filters to query params

  // Add priceRange memo here, before any conditional returns
  const priceRange = useMemo(
    () => calculatePriceRange(filteredProducts),
    [filteredProducts]
  );

  if (isLoading || categoriesLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-2">Error Loading Products</h2>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  // Get selected categories' details
  const selectedCategories = categories.filter((cat: Category) =>
    filters.category.includes(cat.slug)
  );

  // Get all products from selected categories
  const categoryProducts = filteredProducts.filter(
    (product: Product) =>
      filters.category.length === 0 ||
      filters.category.includes(product.category.slug)
  );

  // Calculate available filters based on current category selection
  const calculateAvailableFilters = (): AvailableFilters => {
    const filterData: AvailableFilters = {
      brands: [],
      attributes: {},
      priceRange: { min: 0, max: 1000 },
    };

    // Get unique brands
    const brandsSet = new Set();
    categoryProducts.forEach((product: Product) => {
      if (!brandsSet.has(product.brand.id)) {
        brandsSet.add(product.brand.id);
        filterData.brands.push(product.brand);
      }
    });
    filterData.brands.sort((a, b) => a.name.localeCompare(b.name));

    // Get available attributes and their values
    categoryProducts.forEach((product: Product) => {
      product.attributes?.forEach((attr: any) => {
        if (!filterData.attributes[attr.name]) {
          filterData.attributes[attr.name] = [];
        }

        if (attr.options) {
          attr.options.forEach((option: any) => {
            if (!filterData.attributes[attr.name].includes(option)) {
              filterData.attributes[attr.name].push(option);
            }
          });
        } else if (
          attr.value &&
          !filterData.attributes[attr.name].includes(attr.value.toString())
        ) {
          filterData.attributes[attr.name].push(attr.value.toString());
        }
      });
    });

    // Sort attribute values
    Object.keys(filterData.attributes).forEach((key) => {
      filterData.attributes[key].sort();
    });

    // Calculate price range
    if (categoryProducts.length > 0) {
      filterData.priceRange.min = Math.floor(
        Math.min(...categoryProducts.map((p: Product) => p.price))
      );
      filterData.priceRange.max = Math.ceil(
        Math.max(...categoryProducts.map((p: Product) => p.price))
      );
    }

    return filterData;
  };

  const availableFilters = calculateAvailableFilters();

  // const priceRange = useMemo(
  //   () => calculatePriceRange(filteredProducts),
  //   [filteredProducts]
  // );

  // Helper function to extract unique variant options from products
  const getUniqueVariantOptions = (products: Product[]) => {
    const variantOptions: {
      [key: string]: Set<string | { name: string; value: string }>;
    } = {};

    products.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant) => {
          const attributes = variant.attributes as {
            [key: string]: string | { name: string; value: string };
          };
          Object.entries(attributes).forEach(([key, value]) => {
            const optionValue = typeof value === "object" ? value.value : value;
            if (!variantOptions[key]) {
              variantOptions[key] = new Set();
            }
            variantOptions[key].add(optionValue);
          });
        });
      }
    });

    // Convert Sets to sorted arrays and sort them
    return Object.fromEntries(
      Object.entries(variantOptions).map(([key, values]) => [
        key,
        Array.from(values).sort((a, b) => {
          const aValue = typeof a === "string" ? a : a.value;
          const bValue = typeof b === "string" ? b : b.value;
          return aValue.localeCompare(bValue);
        }),
      ])
    );
  };

  // Render the filters panel
  const renderFiltersPanel = () => {
    return (
      <Card className="h-full">
        {/* Always show these basic filters */}
        <div className="border-b pb-6">
          <h3 className="font-medium mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((category: Category) => (
              <div key={category.id}>
                <Checkbox
                  checked={filters.category.includes(category.slug)}
                  onChange={() => handleFilterChange("category", category.slug)}
                >
                  {category.name}
                </Checkbox>
              </div>
            ))}
          </div>
        </div>

        <PriceRangeFilter
          priceRange={priceRange}
          filters={filters}
          onFilterChange={(newFilters) => {
            setIsPriceSliderTouched(true); // Set to true when slider is moved
            setFilters(newFilters);
            debouncedUpdateUrl(newFilters.price[0], newFilters.price[1]);
          }}
        />

        <div className="border-b pb-6">
          <h3 className="font-medium mb-4">Rating</h3>
          <Radio.Group
            value={filters.rating}
            onChange={(e) => handleFilterChange("rating", e.target.value)}
          >
            <div className="space-y-2">
              <Radio value={4}>4★ & Above</Radio>
              <Radio value={3}>3★ & Above</Radio>
              <Radio value={2}>2★ & Above</Radio>
              <Radio value={1}>1★ & Above</Radio>
            </div>
          </Radio.Group>
          {filters.rating && (
            <button
              onClick={() => handleFilterChange("rating", null)}
              className="text-sm text-gray-500 hover:text-gray-700 mt-2"
            >
              Clear Rating Filter
            </button>
          )}
        </div>

        {/* Show these filters only when a category is selected */}
        {filters.category.length > 0 && (
          <>
            {/* Subcategories */}
            {selectedCategories.map(
              (category: Category) =>
                category.subcategories &&
                category.subcategories.length > 0 && (
                  <div key={`sub-${category.id}`} className="border-b pb-6">
                    <h3 className="font-medium mb-4">
                      {category.name} Subcategories
                    </h3>
                    <div className="space-y-2">
                      {category.subcategories.map((sub) => (
                        <Checkbox
                          key={sub.id}
                          checked={filters.subcategory.includes(sub.slug)}
                          onChange={(e) =>
                            handleFilterChange(
                              "subcategory",
                              e.target.checked
                                ? [...filters.subcategory, sub.slug]
                                : filters.subcategory.filter(
                                    (s) => s !== sub.slug
                                  )
                            )
                          }
                        >
                          {sub.name}
                          <span className="text-gray-500 text-sm ml-1">
                            ({sub.productCount})
                          </span>
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                )
            )}

            {/* Brands */}
            {availableFilters.brands.length > 0 && (
              <div className="border-b pb-6">
                <h3 className="font-medium mb-4">Brands</h3>
                <div className="space-y-2">
                  {availableFilters.brands.map((brand) => (
                    <div key={brand.id} className="flex items-center">
                      <Checkbox
                        checked={filters.brand.includes(brand.slug.toString())}
                        onChange={(e) =>
                          handleFilterChange(
                            "brand",
                            e.target.checked
                              ? [...filters.brand, brand.slug.toString()]
                              : filters.brand.filter(
                                  (b) => b !== brand.slug.toString()
                                )
                          )
                        }
                      >
                        {brand.name}
                      </Checkbox>
                    </div>
                  ))}
                </div>
                {filters.brand.length > 0 && (
                  <button
                    onClick={() => handleFilterChange("brand", [])}
                    className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                  >
                    Clear Brand Filters
                  </button>
                )}
              </div>
            )}

            {/* Dynamic Attributes (Color, Size, etc.) */}
            {Object.entries(availableFilters.attributes).map(
              ([attrName, options]) => (
                <div key={attrName} className="border-b pb-6">
                  <h3 className="font-medium mb-4">{attrName}</h3>
                  <div className="space-y-2">
                    {options.map((option) => (
                      <Checkbox
                        key={option}
                        checked={filters.attributes[attrName]?.includes(option)}
                        onChange={() => {
                          const currentValues =
                            filters.attributes[attrName] || [];
                          const newAttributes = {
                            ...filters.attributes,
                            [attrName]: currentValues.includes(option)
                              ? currentValues.filter((v) => v !== option)
                              : [...currentValues, option],
                          };
                          // If the attribute array is empty, remove the key
                          if (newAttributes[attrName].length === 0) {
                            delete newAttributes[attrName];
                          }
                          handleFilterChange("attributes", newAttributes);
                        }}
                      >
                        {attrName.toLowerCase() === "color" ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: option.toLowerCase() }}
                            />
                            {option}
                          </div>
                        ) : (
                          option
                        )}
                      </Checkbox>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Availability Filters */}
            <div className="border-b pb-6">
              <h3 className="font-medium mb-4">Availability</h3>
              <div className="space-y-2">
                <Checkbox
                  checked={filters.inStock}
                  onChange={(e) =>
                    handleFilterChange("inStock", e.target.checked)
                  }
                >
                  In Stock Only
                </Checkbox>
                <Checkbox
                  checked={filters.onSale}
                  onChange={(e) =>
                    handleFilterChange("onSale", e.target.checked)
                  }
                >
                  On Sale
                </Checkbox>
              </div>
            </div>

            {/* Variant Filters */}
            {filteredProducts && filteredProducts.length > 0 && (
              <>
                {/* Variant Filters */}
                {Object.entries(getUniqueVariantOptions(filteredProducts)).map(
                  ([variantName, options]) => (
                    <div key={variantName} className="border-b pb-6">
                      <h3 className="font-medium mb-4">Product Variants</h3>
                      <div className="space-y-2">
                        {options.map((option) => {
                          const optionValue =
                            typeof option === "string" ? option : option.value;

                          return (
                            <Checkbox
                              key={optionValue}
                              checked={filters.variants[variantName]?.includes(
                                optionValue
                              )}
                              onChange={() => {
                                const currentValues =
                                  filters.variants[variantName] || [];
                                const newVariants = {
                                  ...filters.variants,
                                  [variantName]: currentValues.includes(
                                    optionValue
                                  )
                                    ? currentValues.filter(
                                        (v) => v !== optionValue
                                      )
                                    : [...currentValues, optionValue],
                                };
                                // If the variant array is empty, remove the key
                                if (newVariants[variantName].length === 0) {
                                  delete newVariants[variantName];
                                }
                                handleFilterChange("variants", newVariants);
                              }}
                            >
                              {variantName.toLowerCase() === "color" ? (
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-4 h-4 rounded-full border"
                                    style={{
                                      backgroundColor:
                                        optionValue.toLowerCase(),
                                    }}
                                  />
                                  {optionValue}
                                </div>
                              ) : (
                                optionValue
                              )}
                            </Checkbox>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </>
            )}
          </>
        )}
      </Card>
    );
  };

  const renderBreadcrumb = () => {
    const breadcrumbItems = [
      {
        label: <Home className="w-4 h-4" />,
        link: "/",
      },
      {
        label: "Products",
        link: "/products",
      },
    ];

    if (categorySlug) {
      const category = categories.find(
        (cat: Category) => cat.slug === categorySlug
      );
      if (category) {
        breadcrumbItems.push({
          label: category.name,
          link: `/products/${category.slug}`,
        });

        if (subcategorySlug && category.subcategories) {
          const subcategory = category.subcategories.find(
            (sub: SubCategory) => sub.slug === subcategorySlug
          );
          if (subcategory) {
            breadcrumbItems.push({
              label: subcategory.name,
              link: `/products/${category.slug}/${subcategory.slug}`,
            });
          }
        }
      }
    }

    return (
      <nav className="mb-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              <Link
                to={item.link}
                className={`flex items-center hover:text-secondary-600 ${
                  index === breadcrumbItems.length - 1
                    ? "text-secondary-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                {item.label}
              </Link>
            </React.Fragment>
          ))}
        </div>

        {/* Category Title and Description */}
        {categorySlug && (
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {breadcrumbItems[breadcrumbItems.length - 1].label}
              {subcategorySlug ? (
                <span className="text-lg font-normal text-gray-500 ml-2">
                  in {breadcrumbItems[breadcrumbItems.length - 2].label}
                </span>
              ) : (
                ""
              )}
            </h1>
            {/* Optional: Add category description if available */}
            <p className="mt-2 text-gray-600">
              {
                categories.find((cat: Category) => cat.slug === categorySlug)
                  ?.description
              }
            </p>

            {/* Optional: Add category stats */}
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>{filteredProducts?.length || 0} Products</span>
              {subcategorySlug && <span>•</span>}
              {subcategorySlug && (
                <span>
                  {categories
                    .find((cat: Category) => cat.slug === categorySlug)
                    ?.subcategories?.find(
                      (sub: SubCategory) => sub.slug === subcategorySlug
                    )?.productCount || 0}{" "}
                  in {breadcrumbItems[breadcrumbItems.length - 1].label}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {renderActiveFilters()}
      </nav>
    );
  };

  const renderActiveFilters = () => {
    const activeFilters = [
      // Add category filters
      ...filters.category.map((cat: string) => ({
        type: "Category",
        value: cat,
        slug: cat,
      })),

      // Add subcategory filters
      ...filters.subcategory.map((sub) => ({
        type: "Subcategory",
        value: sub,
        slug: sub,
      })),

      // Add brand filters
      ...filters.brand.map((brandId) => {
        const brand = availableFilters.brands.find(
          (b) => b.slug.toString() === brandId
        );
        if (brand) {
          return {
            type: "Brand",
            value: brand.name,
            slug: brand.slug,
          };
        }
      }),

      // Add price range if not default
      ...(filters.price[0] !== priceRange.min ||
      filters.price[1] !== priceRange.max
        ? [
            {
              type: "Price",
              value: `$${filters.price[0]} - $${filters.price[1]}`,
              slug: "",
            },
          ]
        : []),

      // Add rating filter
      ...(filters.rating
        ? [
            {
              type: "Rating",
              value: `${filters.rating}+ Stars`,
              slug: "",
            },
          ]
        : []),

      // Add availability filters
      ...(filters.inStock
        ? [
            {
              type: "Availability",
              value: "In Stock",
              slug: "",
            },
          ]
        : []),

      ...(filters.onSale
        ? [
            {
              type: "Special",
              value: "On Sale",
              slug: "",
            },
          ]
        : []),

      // Add attribute filters
      ...Object.entries(filters.attributes).flatMap(([name, values]) =>
        values.map((value) => ({
          type: `attr_${name}`,
          value: value,
          slug: value,
        }))
      ),

      // Add variant filters

      ...Object.entries(filters.variants).flatMap(([name, values]) =>
        values.map((value) => ({
          type: `variant_${name}`,
          value: value,
          slug: value,
        }))
      ),
    ];

    if (activeFilters.length === 0) return null;

    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">Active Filters:</span>
        {activeFilters.map((filter, index) => (
          <span
            key={`${filter?.type}-${filter?.value}-${index}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
              text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            <span className="font-medium">{filter?.type}:</span>
            {filter?.value}
            <button
              onClick={() => removeFilter(filter!.type, filter!.slug)}
              className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={`Remove ${filter?.type} filter: ${filter?.slug}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        {activeFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-secondary-600 hover:text-secondary-700 
              font-medium hover:underline focus:outline-none"
          >
            Clear All
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      {renderBreadcrumb()}

      {/* Mobile Filter Toggle Button */}
      <button
        className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 
          bg-white border rounded-lg text-gray-700 hover:bg-gray-50"
        onClick={() => setIsMobileFilterOpen(true)}
      >
        <span>Filters</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div
          className={`
            fixed lg:relative inset-0 z-40 lg:z-0 
            ${isMobileFilterOpen ? "block" : "hidden lg:block"}
            w-80 bg-white lg:bg-transparent
            overflow-y-auto
          `}
        >
          {/* Close button for mobile */}
          <button
            className="lg:hidden absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Overlay for mobile */}
          {isMobileFilterOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileFilterOpen(false)}
            />
          )}

          {/* Filter Panel */}
          <div className="relative z-50 h-full lg:h-auto p-4 lg:p-0">
            {renderFiltersPanel()}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort and Results Info */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <p className="text-gray-500 mb-4 sm:mb-0">
              Showing {filteredProducts.length} results
            </p>

            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or search criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Update pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            current={filters.page}
            total={pagination.total}
            pageSize={pagination.limit}
            onChange={(page: number) => {
              handleFilterChange("page", page);
            }}
          />
        </div>
      )}
    </div>
  );
};
