import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import {
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { ProductCard } from "../components/product/ProductCard";
import { Swiper as SwiperType } from "swiper";
import { Product, Review, ProductAttribute } from "../types/product";
import { Tabs, Avatar, Button, Input, Rate } from "antd";
import { LikeOutlined } from "@ant-design/icons";
import { Pagination } from "antd";
import { useCartStore } from "../store/useCartStore";
import { toast } from "react-hot-toast";
import AuthModal from "../components/auth/AuthModal";
import { CheckoutModal } from "../components/checkout/CheckoutModal";
import api, { productAPI } from "../services/api";
import { BASE_URL } from "../utils/actionTypes";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
const { TabPane } = Tabs;
const { TextArea } = Input;

// Add type for variant attribute

// Review Form Component with antd
const ReviewForm = ({
  productId,
  variantId,
}: {
  productId: string;
  variantId: string;
}) => {
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>("");
  const queryClient = useQueryClient();

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (review.trim().length > 0) {
      const response = await api.post("/submit-review", {
        rating,
        review,
        productId,
        variantId,
      });
      if (response.data.statusCode === 200) {
        toast.success("Review submitted successfully!");
        setRating(5);
        setReview("");
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
      } else {
        toast.error("Failed to submit review.");
      }
    } else {
      toast.error("Please write a review before submitting");
    }
  };

  return (
    <form className="space-y-4 mt-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Rating</label>
        <Rate value={rating} allowHalf onChange={setRating} />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Your Review</label>
        <TextArea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review here..."
          rows={4}
        />
      </div>
      <button
        className=" bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition-colors flex items-center justify-center space-x-2"
        onClick={(e) => handleSubmitReview(e)}
      >
        Submit Review
      </button>
    </form>
  );
};

// Add this function to calculate average rating
const calculateAverageRating = (reviews: Review[]) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
};

const ProductDetails = () => {
  const { id } = useParams();
  const [thumbsSwiper, setThumbsSwiper] = React.useState<SwiperType | null>(
    null
  );
  const [selectedQuantity, setSelectedQuantity] = React.useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated } = useCustomerAuth();
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, { name: string; value: string }>
  >({});
  const [variantError, setVariantError] = useState<string>("");
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Fetch product details
  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await productAPI.getProductDetails(id!);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch related products
  const { data: relatedProductsData, isLoading: relatedProductsLoading } =
    useQuery({
      queryKey: ["related-products", productData?.category?.id],
      queryFn: async () => {
        const response = await productAPI.getRelatedProducts(
          id!,
          productData.category.id
        );
        return response.data;
      },
      enabled: !!productData?.category?.id,
    });

  const product = productData;
  const relatedProducts = relatedProductsData || [];

  // Automatically select the first variant if it exists
  useEffect(() => {
    if (product?.hasVariants && product.variants.length > 0) {
      // Sort variants by sequence_no
      const sortedVariants = [...product.variants].sort(
        (a, b) => a.sequence_no - b.sequence_no
      );
      const firstVariant = sortedVariants[0];

      // Format the initial attributes with name and value properties
      const initialAttributes = Object.fromEntries(
        firstVariant.attributes.map((attr: { name: string; value: string }) => [
          attr.name,
          {
            name: attr.name,
            value: attr.value,
          },
        ])
      );

      setSelectedAttributes(initialAttributes);
      setSelectedVariant(firstVariant);
    }
  }, [product]);
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const response = await api.get("/wishlist");
        setIsInWishlist(
          response.data.some((item: any) => item.productId === product?.id)
        );
      } catch (error) {
        console.error("Failed to check wishlist status");
      }
    };

    if (isAuthenticated && product) {
      checkWishlist();
    }
  }, [isAuthenticated, product]);

  // Find matching variant based on selected attributes
  const findMatchingVariant = useCallback(() => {
    if (!product?.hasVariants || !product?.variants) return null;

    const matchingVariant = product.variants.find((variant: any) => {
      return Object.entries(selectedAttributes).every(([attrName, attr]) => {
        const variantAttr = variant.attributes.find(
          (va: { name: string; value: string }) => va.name === attrName
        );
        return variantAttr && variantAttr.value === attr.value;
      });
    });

    return matchingVariant;
  }, [product, selectedAttributes]);

  // Update selected variant when attributes change
  useEffect(() => {
    if (product?.hasVariants) {
      const matchingVariant = findMatchingVariant();
      setSelectedVariant(matchingVariant);
      setVariantError(""); // Clear error when selection changes
    }
  }, [selectedAttributes, findMatchingVariant, product]);

  // Get all unique variant options
  const getVariantOptions = useCallback(() => {
    if (!product?.hasVariants || !product?.variants) return {};

    // Sort variants by sequence_no first
    const sortedVariants = [...product.variants].sort(
      (a, b) => a.sequence_no - b.sequence_no
    );

    // Change to use an object instead of Set
    const options: Record<string, { name: string; values: string[] }> = {};

    sortedVariants.forEach((variant: any) => {
      variant.attributes.forEach((attr: { name: string; value: string }) => {
        if (!options[attr.name]) {
          options[attr.name] = { name: attr.name, values: [] };
        }
        // Only add unique values
        if (!options[attr.name].values.includes(attr.value)) {
          options[attr.name].values.push(attr.value);
        }
      });
    });

    return options;
  }, [product]);
  // Render variant selector
  const renderVariantSelector = () => {
    if (!product?.hasVariants) return null;

    const variantOptions = getVariantOptions();
    return (
      <div className="space-y-4">
        {Object.entries(variantOptions).map(([attrName, { name, values }]) => (
          <div key={attrName} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {name}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`px-4 py-2 rounded-md border ${
                    selectedAttributes[attrName]?.value === value
                      ? "border-secondary-600 bg-secondary-50 text-secondary-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() =>
                    setSelectedAttributes((prev) => ({
                      ...prev,
                      [attrName]: {
                        name: attrName,
                        value: value,
                      },
                    }))
                  }
                >
                  {attrName.toLowerCase() === "color" ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: value.toLowerCase() }}
                      />
                      {value}
                    </div>
                  ) : (
                    value
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
        {variantError && (
          <p className="text-red-500 text-sm mt-2">{variantError}</p>
        )}
      </div>
    );
  };

  // Update handleAddToCart function
  const handleAddToCart = () => {
    // if (!isAuthenticated) {
    //   setIsAuthModalOpen(true);
    //   return;
    // }

    // Check if variants are required but not selected
    if (product.hasVariants && !selectedVariant) {
      setVariantError("Please select all variant options");
      return;
    }

    // If size attribute exists and no size is selected
    if (
      product.attributes?.some(
        (attr: ProductAttribute) => attr.type === "size" && !selectedSize
      )
    ) {
      toast.error("Please select a size");
      return;
    }

    // Determine the correct price based on variant and offer status
    const price = selectedVariant
      ? selectedVariant.hasOffer
        ? selectedVariant.salePrice
        : selectedVariant.price
      : product.hasOffer
      ? product.salePrice
      : product.price;

    const itemToAdd = {
      productId: product.id,
      name: product.name,
      price: price,
      quantity: selectedQuantity,
      image: product.images[0],
      selectedOptions: {
        ...selectedAttributes,
        ...(selectedSize ? { size: selectedSize } : {}),
      },
      variantId: selectedVariant?.id,
    };

    addItem(itemToAdd);
    toast.success("Added to cart");
  };

  // Update handleBuyNow function
  const handleBuyNow = () => {
    // if (!isAuthenticated) {
    //   setIsAuthModalOpen(true);
    //   return;
    // }

    if (product.hasVariants && !selectedVariant) {
      setVariantError("Please select all variant options");
      return;
    }

    if (
      product.attributes?.some(
        (attr: ProductAttribute) => attr.type === "size" && !selectedSize
      )
    ) {
      toast.error("Please select a size");
      return;
    }

    // Use the same price determination logic as handleAddToCart
    const price = selectedVariant
      ? selectedVariant.hasOffer
        ? selectedVariant.salePrice
        : selectedVariant.price
      : product.hasOffer
      ? product.salePrice
      : product.price;

    const item = {
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity: selectedQuantity,
      price: price,
      name: product.name,
      thumbnail: product.images[0],
      selectedOptions: {
        ...selectedAttributes,
        ...(selectedSize ? { size: selectedSize } : {}),
      },
    };

    setCheckoutItems([item]);
    setIsCheckoutModalOpen(true);
  };

  // Update only the price display section
  const renderPriceSection = () => {
    if (product.hasVariants && selectedVariant) {
      // Show variant price with discount if applicable
      const displayPrice = selectedVariant.price;
      const hasOffer = selectedVariant.hasOffer;
      const salePrice = selectedVariant.salePrice;
      const discount = selectedVariant.discount;

      return (
        <div className="flex items-center space-x-4">
          {hasOffer ? (
            <>
              <span className="text-3xl font-bold text-gray-900">
                ${Number(salePrice).toFixed(2)}
              </span>
              <span className="text-xl text-gray-500 line-through">
                ${Number(displayPrice).toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-red-500">
                {discount}% OFF
              </span>
            </>
          ) : (
            <span className="text-3xl font-bold text-gray-900">
              ${Number(displayPrice).toFixed(2)}
            </span>
          )}
        </div>
      );
    }

    // Base product price display remains unchanged
    const displayPrice = selectedVariant?.price || product.price;
    const hasOffer = product.hasOffer;
    const salePrice = product.salePrice;
    const discount = product.discount;

    return (
      <div className="flex items-center space-x-4">
        {hasOffer ? (
          <>
            <span className="text-3xl font-bold text-gray-900">
              ${Number(salePrice).toFixed(2)}
            </span>
            <span className="text-xl text-gray-500 line-through">
              ${Number(displayPrice).toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-red-500">
              {discount}% OFF
            </span>
          </>
        ) : (
          <span className="text-3xl font-bold text-gray-900">
            ${Number(displayPrice).toFixed(2)}
          </span>
        )}
      </div>
    );
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    } else if (stock <= 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          In Stock
        </span>
      );
    }
  };
  // Add this section in your JSX where you want to display variant information
  const renderVariantInfo = () => {
    if (!selectedVariant) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Selected Variant</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm">
            <span className="text-gray-500">SKU:</span>{" "}
            <span className="font-medium">{selectedVariant.sku}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Stock:</span>{" "}
            <span className="font-medium">
              {getStockStatus(selectedVariant.stock)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Modify the image gallery section to show variant images or product images
  const getAllImages = useMemo(() => {
    if (!product) return [];

    // If a variant is selected and has images, show only variant images
    if (selectedVariant && selectedVariant.images?.length > 0) {
      return selectedVariant.images;
    }

    // If no variant is selected or variant has no images, show product images
    return product.images;
  }, [product, selectedVariant]);

  // Add this section in your specifications tab
  const renderVariantsTable = () => {
    if (!product?.hasVariants || !product?.variants) return null;

    // Sort variants by sequence_no
    const sortedVariants = [...product.variants].sort(
      (a, b) => a.sequence_no - b.sequence_no
    );

    // Get all unique attribute names from the first variant
    const attributeNames = Object.keys(sortedVariants[0]?.attributes || {});

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Product Variants</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Map through attribute names */}
                {/* {attributeNames.map((attr) => (
                  <th
                    key={attr}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {attr}
                  </th>
                ))} */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attributes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedVariants.map((variant) => (
                <tr
                  key={variant.id}
                  className={
                    selectedVariant?.id === variant.id ? "bg-secondary-50" : ""
                  }
                >
                  {/* Map through attribute names to get values */}
                  {attributeNames.map((attr) => (
                    <td
                      key={attr}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {typeof variant.attributes[attr] === "object"
                        ? variant.attributes[attr].name
                        : String(variant.attributes[attr])}{" "}
                      -{" "}
                      {typeof variant.attributes[attr] === "object"
                        ? variant.attributes[attr].value
                        : String(variant.attributes[attr])}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {variant.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${variant.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStockStatus(variant.stock)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Add a section to display active offers
  // const renderActiveOffers = () => {
  //   if (!product.activeOffers?.length) return null;

  //   return (
  //     <div className="mt-4">
  //       <h4 className="text-lg font-semibold mb-2">Active Offers</h4>
  //       <div className="space-y-2">
  //         {product.activeOffers.map((offer: any) => (
  //           <div
  //             key={offer.id}
  //             className="flex items-center space-x-2 text-red-600"
  //           >
  //             <TagIcon className="w-5 h-5" />
  //             <span>
  //               {offer.title}: {offer.discount}% off
  //             </span>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  if (isLoading || relatedProductsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/products"
            className="mt-4 inline-block text-secondary-600 hover:text-secondary-700"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  // Add this function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderAttributeValue = (attribute: ProductAttribute) => {
    switch (attribute.type) {
      case "size":
        return (
          <div className="flex gap-2">
            {attribute.options?.map((size) => (
              <Button
                key={size}
                className={
                  selectedSize === size ? "bg-primary-600 text-white" : ""
                }
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        );

      case "weight":
        return `${attribute.value}${attribute.unit}`;

      case "technical":
        return attribute.displayValue || attribute.value;

      default:
        return attribute.value;
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${product.id}`);
        toast.success("Removed from wishlist");
      } else {
        await api.post("/wishlist", { productId: product.id });
        toast.success("Added to wishlist");
      }
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  if (!product) return null;

  return (
    <div className="bg-gray-50">
      {/* Breadcrumb & Back Button */}
      <div className="container mx-auto py-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>

      {/* Product Info Section */}
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <Swiper
                modules={[Navigation, Thumbs]}
                thumbs={{
                  swiper:
                    thumbsSwiper && !thumbsSwiper.destroyed
                      ? thumbsSwiper
                      : null,
                }}
                navigation
                className="aspect-square rounded-lg overflow-hidden"
              >
                {getAllImages.map((image: string, idx: number) => (
                  <SwiperSlide key={idx}>
                    <img
                      src={`${BASE_URL}/${image}`}
                      alt={`${product.name} - Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              <Swiper
                modules={[Thumbs]}
                watchSlidesProgress
                onSwiper={setThumbsSwiper}
                slidesPerView={4}
                spaceBetween={10}
                className="thumbs-swiper h-24"
              >
                {getAllImages.map((image: string, idx: number) => (
                  <SwiperSlide key={idx}>
                    <div className="h-24 rounded-lg overflow-hidden cursor-pointer">
                      <img
                        src={`${BASE_URL}/${image}`}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <Link
                  to={`/category/${product.category.id}`}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {product.category.name}
                </Link>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold">
                    {calculateAverageRating(product.reviews)}
                  </div>
                  <div>
                    <Rate
                      disabled
                      allowHalf
                      value={calculateAverageRating(product.reviews)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Based on {product.reviews.length} reviews
                    </p>
                  </div>
                </div>
              </div>

              {/* Price */}
              {renderPriceSection()}

              {/* Description */}
              <p className="text-gray-600">{product.description}</p>

              {/* Brand */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Brand:</span>
                <Link
                  to={`/brand/${product.brand.slug}`}
                  className="text-secondary-600 hover:text-secondary-700 font-medium"
                >
                  {product.brand.name}
                </Link>
              </div>

              {/* Attributes */}
              <div className="space-y-4">
                {product.attributes?.map((attr: ProductAttribute) => (
                  <div key={attr.name} className="flex items-start">
                    <span className="text-gray-600 w-24">{attr.name}:</span>
                    <div className="flex-1">{renderAttributeValue(attr)}</div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    to={`/search?tag=${tag}`}
                    className="px-3 py-1 bg-secondary-100 hover:bg-gray-200 rounded-full text-sm text-secondary-800"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <label className="text-gray-700">Quantity:</label>
                <select
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Buy Now</span>
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="p-3 border rounded-lg hover:bg-gray-50"
                >
                  <HeartIcon className="w-6 h-6 text-secondary-600" />
                </button>
                <button className="p-3 border rounded-lg hover:bg-secondary-50">
                  <ShareIcon className="w-6 h-6 text-secondary-600" />
                </button>
              </div>

              {/* Features */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <TruckIcon className="w-5 h-5 text-secondary-600" />
                  <span>Free shipping on orders over $100</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <ShieldCheckIcon className="w-5 h-5 text-secondary-600" />
                  <span>2 year extended warranty</span>
                </div>
              </div>

              {/* Variant Selector */}
              {renderVariantSelector()}

              {/* Selected Variant Info */}
              {renderVariantInfo()}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Tabs defaultActiveKey="description">
            <TabPane tab="Description" key="description">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold">Product Description</h3>
                <p>{product.description}</p>
                {/* Add more formatted description content here */}
              </div>
            </TabPane>

            <TabPane tab="Specifications" key="specifications">
              {/* Brand Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  Brand Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Brand</span>
                    <span className="font-medium">{product.brand.name}</span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.attributes?.map((attr: ProductAttribute) => (
                    <div
                      key={attr.name}
                      className="flex justify-between py-2 border-b"
                    >
                      <span className="text-gray-600">{attr.name}</span>
                      <span className="font-medium">
                        {renderAttributeValue(attr)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">SKU</span>
                    <span className="font-medium">
                      {product.variants?.[0]?.sku || "N/A"}
                    </span>
                  </div> */}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{product.category.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Subcategory</span>
                    <span className="font-medium">
                      {product.subcategory.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Tags</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {product.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-secondary-100 rounded-full text-sm text-secondary-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Variants Table */}
              {renderVariantsTable()}
            </TabPane>

            <TabPane tab="Reviews" key="reviews">
              {/* Review Statistics */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold">
                    {calculateAverageRating(product.reviews)}
                  </div>
                  <div>
                    <Rate
                      disabled
                      allowHalf
                      defaultValue={calculateAverageRating(product.reviews)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Based on {product.reviews.length} reviews
                    </p>
                  </div>
                </div>
                {/* <button className=" bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition-colors flex items-center justify-center space-x-2">
                  Write a Review
                </button> */}
              </div>

              {/* Review Form */}
              <ReviewForm
                productId={product!.id}
                variantId={(selectedVariant && selectedVariant.id) || ""}
              />

              {/* Reviews List */}
              <div className="space-y-6 mt-8">
                {product.reviews?.map((review: Review) => (
                  <div key={review.id} className="border-b pb-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar src={review.userAvatar} />
                      <div>
                        <h4 className="font-semibold">{review.userName}</h4>
                        <div className="flex items-center space-x-2">
                          <Rate
                            disabled
                            allowHalf
                            defaultValue={review.rating}
                          />
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h5 className="font-medium mb-2">{review.title}</h5>
                    <p className="text-gray-600 mb-3">{review.comment}</p>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="text"
                        icon={<LikeOutlined />}
                        className="text-gray-500 hover:text-secondary-600"
                      >
                        Helpful ({review.helpful})
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Pagination */}
              {product.reviews?.length > 5 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    defaultCurrent={1}
                    total={product.reviews.length}
                    pageSize={5}
                  />
                </div>
              )}
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* Vendor Information */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar
                src={product.seller.logo}
                size={64}
                className="!w-16 !h-16"
              />
              <div>
                <h3 className="text-xl font-semibold">{product.seller.name}</h3>
                <div className="flex items-center space-x-2">
                  <Rate
                    disabled
                    allowHalf
                    defaultValue={product.seller.rating}
                  />
                  <span className="text-sm text-gray-500">
                    ({product.seller.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
            <Button>Visit Store</Button>
          </div>
          {product.seller.verified && (
            <div className="flex items-center space-x-2 text-green-600">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Verified Seller</span>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts?.slice(0, 4).map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <AuthModal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        activeTab="login"
        onLoginSuccess={() => {
          if (checkoutItems.length > 0) {
            setIsCheckoutModalOpen(true);
          }
        }}
      />

      <CheckoutModal
        open={isCheckoutModalOpen}
        onClose={() => {
          setIsCheckoutModalOpen(false);
          setCheckoutItems([]);
        }}
        items={checkoutItems}
      />
    </div>
  );
};

export default ProductDetails;
