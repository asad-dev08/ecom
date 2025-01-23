import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectFade } from "swiper/modules";
import api from "../services/api";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { ProductCard } from "../components/product/ProductCard";
import { Category, Product } from "../types/product";
import { CategoryCard } from "../components/category/CategoryCard";
import { Skeleton } from "antd";
import { BASE_URL } from "../utils/actionTypes";
import { Link } from "react-router-dom";
import { useResolution } from "../hooks/useResolution";

const Home = () => {
  const resolution = useResolution();

  // Fetch banners
  const { data: banners, isLoading: bannersLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const response = await api.get("/banners");
      return response.data.data;
    },
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["featured-categories"],
    queryFn: async () => {
      const response = await api.get("/featured-categories");
      return response.data.data;
    },
  });

  // Fetch top selling products
  const { data: topSelling, isLoading: topSellingLoading } = useQuery({
    queryKey: ["top-selling"],
    queryFn: async () => {
      const response = await api.get("/top-selling");
      return response.data.data;
    },
  });

  // Fetch special offers
  const { data: specialOffers } = useQuery({
    queryKey: ["special-offers"],
    queryFn: async () => {
      const response = await api.get("/special-offers");
      return response.data.data;
    },
  });

  // Fetch recent products
  const { data: recentProducts, isLoading: recentLoading } = useQuery({
    queryKey: ["recent"],
    queryFn: async () => {
      const response = await api.get("/recent");
      return response.data.data;
    },
  });

  // Fetch offered products
  const { data: offeredProducts, isLoading: offeredLoading } = useQuery({
    queryKey: ["offered-products"],
    queryFn: async () => {
      const response = await api.get("/offered-products");
      return response.data.data;
    },
  });

  // Function to calculate remaining time
  const getRemainingTime = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  // Filter active offers and sort by discount
  const activeOffers = specialOffers
    ?.filter((offer: any) => {
      const endDate = new Date(offer.end_date);
      return endDate > new Date() && offer.is_active;
    })
    .sort((a: any, b: any) => b.discount - a.discount);

  const offerBanner = banners?.filter((b: any) => b.type === "offer");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Banner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div
          className={`${
            offerBanner?.length > 0 || activeOffers?.length > 0
              ? " lg:col-span-2"
              : "lg:col-span-3"
          }`}
        >
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{ delay: 5000 }}
            className="rounded-lg overflow-hidden custom-swiper"
          >
            {bannersLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              banners
                ?.filter((b: any) => b.type === "main")
                .map((banner: any) => (
                  <SwiperSlide key={banner.id}>
                    <img
                      src={`${BASE_URL}${banner.image}`}
                      alt={banner.title}
                      className="w-full h-[400px] object-cover"
                    />
                  </SwiperSlide>
                ))
            )}
          </Swiper>
        </div>

        <div className="space-y-4">
          {bannersLoading
            ? Array(2)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    key={i}
                    className={`${
                      activeOffers?.length > 0 ? "h-[190px]" : "h-[400px]"
                    } w-full`}
                  />
                ))
            : offerBanner.map((banner: any) => (
                <div key={banner.id} className="rounded-lg overflow-hidden">
                  <img
                    src={`${BASE_URL}${banner.image}`}
                    alt={banner.title}
                    className={`${
                      activeOffers?.length > 0 ? "h-[190px]" : "h-[400px]"
                    } w-full object-cover`}
                  />
                </div>
              ))}
          <div>
            {/* Special Offers Slider Section */}
            {activeOffers?.length > 0 && (
              <div
                className={`mb-12 ${
                  offerBanner?.length > 0 ? "h-[190px]" : "h-[400px]"
                }`}
              >
                <Swiper
                  modules={[Navigation, Autoplay, EffectFade]}
                  // navigation={{
                  //   prevEl: ".special-offer-prev",
                  //   nextEl: ".special-offer-next",
                  // }}
                  autoplay={{ delay: 5000 }}
                  spaceBetween={20}
                  slidesPerView={1}
                  // breakpoints={{
                  //   640: { slidesPerView: 2 },
                  //   1024: { slidesPerView: 3 },
                  // }}
                  className="special-offers-swiper"
                >
                  {activeOffers.map((offer: any) => {
                    const remainingTime = getRemainingTime(offer.end_date);

                    return (
                      <SwiperSlide key={offer.id}>
                        <div
                          className="bg-white rounded-xl shadow-lg overflow-hidden
                                transform transition-all duration-300 hover:shadow-xl
                                hover:-translate-y-1"
                        >
                          {/* Offer Content */}
                          <div className="">
                            <div
                              className={`relative rounded-lg overflow-hidden ${
                                offer.image
                                  ? offerBanner?.length > 0
                                    ? "min-h-[195px]"
                                    : "min-h-[400px]"
                                  : offerBanner?.length > 0
                                  ? " g-gradient-to-r from-blue-50 to-purple-50 min-h-[195px]"
                                  : "bg-gradient-to-r from-blue-50 to-purple-50 min-h-[400px]"
                              }`}
                            >
                              {/* Background Image or Gradient */}
                              {offer.image && (
                                <>
                                  <img
                                    src={`${BASE_URL}${offer.image}`}
                                    alt={offer.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40"></div>
                                </>
                              )}

                              {/* Content */}
                              <div className="relative z-10 p-2 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                  <div className="mb-3">
                                    <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full font-bold text-lg animate-pulse">
                                      {offer.discount}% OFF
                                    </div>
                                  </div>
                                  <h3
                                    className={`text-lg font-bold mb-2 line-clamp-1 ${
                                      offer.image
                                        ? "text-white"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {offer.title}
                                  </h3>
                                  {offer.subtitle && (
                                    <p
                                      className={`text-sm mb-3 line-clamp-2 ${
                                        offer.image
                                          ? "text-gray-200"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {offer.subtitle}
                                    </p>
                                  )}
                                </div>

                                {/* Timer */}
                                {remainingTime && (
                                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-lg p-1 shadow-lg">
                                    {/* <div className="text-xs text-gray-500 mb-2">
                                      <ClockCircleOutlined /> Ends in:
                                    </div> */}
                                    <div className="flex gap-2 justify-center">
                                      {remainingTime.days > 0 && (
                                        <div className="bg-white px-2 py-0 rounded shadow-sm">
                                          <span className="font-mono font-bold text-lg">
                                            {remainingTime.days}
                                          </span>
                                          <span className="text-xs text-gray-500 ml-1">
                                            d
                                          </span>
                                        </div>
                                      )}
                                      <div className="bg-white px-2 py-0 rounded shadow-sm">
                                        <span className="font-mono font-bold text-lg">
                                          {remainingTime.hours}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-1">
                                          h
                                        </span>
                                      </div>
                                      <div className="bg-white px-2 py-0 rounded shadow-sm">
                                        <span className="font-mono font-bold text-lg">
                                          {remainingTime.minutes}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-1">
                                          m
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <Swiper
          spaceBetween={10} // Space between each slide
          slidesPerView={
            resolution.isMobile
              ? Math.min(categories?.length || 0, 1.8)
              : resolution.isTablet
              ? Math.min(categories?.length || 0, 3.5)
              : resolution.isDesktop
              ? Math.min(categories?.length || 0, 5.2)
              : Math.min(categories?.length || 0, 8)
          }
          slidesOffsetBefore={0}
          slidesOffsetAfter={0}
          centeredSlides={false} // Ensure slides are not centered
        >
          {categoriesLoading
            ? Array(6)
                .fill(0)
                .map((_, i) => (
                  <SwiperSlide key={i}>
                    <Skeleton className="h-[100px] w-full" />
                  </SwiperSlide>
                ))
            : categories?.map((category: Category) => (
                <SwiperSlide key={category.id}>
                  <CategoryCard category={category} />
                </SwiperSlide>
              ))}
        </Swiper>
      </div>

      {/* Top Selling Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Top Selling Products</h2>
          <Link
            to="/products"
            className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            View All Products
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topSellingLoading
            ? Array(8)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-[300px] w-full" />
                ))
            : topSelling?.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>

      {/* Recent Products Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Recent Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recentLoading
            ? Array(8)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-[300px] w-full" />
                ))
            : recentProducts?.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>

      {/* Offered Products Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Offered Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {offeredLoading
            ? Array(8)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-[300px] w-full" />
                ))
            : offeredProducts?.map((offer: any) => (
                <ProductCard key={offer.id} product={offer} />
              ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
