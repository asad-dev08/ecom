import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dropdown,
  Menu,
  message,
  Modal,
  Form,
  Input,
  Button,
  Upload,
} from "antd";
import {
  DownOutlined,
  AppstoreOutlined,
  ReloadOutlined,
  InboxOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
//import { useCartStore } from "../../store/useCartStore";
import {
  Phone,
  ShoppingCart,
  User,
  LogOut,
  ShoppingBag,
  MapPin,
  LogIn,
} from "lucide-react";

import { useScrollPosition } from "../../hooks/useScrollPosition";
import { useScreenSize } from "../../hooks/useScreenSize";
import { useQuery } from "@tanstack/react-query";
import { Category } from "../../types/product";
// import { BD, US, ES, FR } from "country-flag-icons/react/3x2";
import AuthModal from "../auth/AuthModal";
import { useCustomerAuth } from "../../hooks/useCustomerAuth";
import { useCustomerData } from "../../hooks/useCustomerData";
import { BASE_URL } from "../../utils/actionTypes";
import { useCartStore } from "../../store/useCartStore";
import axios from "axios";
import api from "../../services/api";
import toast from "react-hot-toast";
import { CompanyInfo } from "./Footer";

// Add this interface for search results
interface SearchResult {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  category: {
    name: string;
    slug: string;
  };
}

export const Navbar = () => {
  //const { items } = useCartStore();
  const [form] = Form.useForm();
  const { isScrolled } = useScrollPosition();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMobile, isTablet } = useScreenSize();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState<"login" | "register">(
    "login"
  );
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false); // State for modal visibility
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { customer, isAuthenticated, logout, tokens } = useCustomerAuth();
  const { compareListCount, orderCount } = useCustomerData();
  const { items } = useCartStore();
  const cartItemsCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await api.get("/company-info");
        setCompanyInfo(response.data.data);
      } catch (error) {
        console.error("Error fetching company info:", error);
      }
    };

    fetchCompanyInfo();
  }, []);
  // Add debouncing for search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term) {
        handleSearch(term);
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  const handleLogout = async () => {
    try {
      if (!tokens?.refreshToken) {
        message.error("No active session found");
        return;
      }

      await logout()
        .unwrap()
        .then(() => {
          message.success("Logged out successfully");
        })
        .catch((error) => {
          message.error(error || "Failed to logout");
        });
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Failed to logout");
    }
  };
  // Separate search handler
  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    // setIsLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/customer/products/search?query=${term}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );
      setSearchResults(response.data.data.products);
    } catch (error) {
      console.error("Error fetching search results:", error);
      toast.error("Failed to fetch search results");
    } finally {
      // setIsLoading(false);
    }
  };

  // Update search effect
  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]); // Remove currentPage from dependencies

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  // Add this query to fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/customer/categories`, {
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
      });
      const data = await response.data;
      return data.data;
    },
  });

  const { data: coupon } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const response = await api.get("/coupon");
      return response.data.data;
    },
  });
  // Transform categories into menu items with links
  const categoryMenuOverlay = (
    <Menu className="max-h-[400px] overflow-y-auto">
      {/* All Categories Link */}
      <Menu.Item key="all-categories">
        <Link
          to="/products"
          className="flex items-center gap-2 font-medium text-gray-800"
        >
          <AppstoreOutlined />
          <span>All Categories</span>
        </Link>
      </Menu.Item>

      <Menu.Divider />

      {categories?.map((category: Category) => (
        <Menu.SubMenu
          key={category.id}
          title={
            <Link
              to={`/products?category=${category.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between w-full hover:text-secondary-600"
            >
              <span className="flex items-center gap-2">
                {/* Add icon if available */}
                {category.icon && (
                  <img
                    src={category.icon}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span>{category.name}</span>
              </span>
              <span className="text-xs text-gray-500">
                ({category.productCount})
              </span>
            </Link>
          }
          popupClassName="category-submenu"
        >
          {/* View All Link for Category */}
          <Menu.Item key={`${category.id}-all`}>
            <Link
              to={`/products?category=${category.slug}`}
              className="flex items-center justify-between text-secondary-600 font-medium"
            >
              <span>View All {category.name}</span>
              <span className="text-xs">({category.productCount})</span>
            </Link>
          </Menu.Item>

          <Menu.Divider />

          {/* Subcategories */}
          {category.subcategories?.map((subcat) => (
            <Menu.Item key={subcat.id}>
              <Link
                to={`/products?category=${category.slug}&subcategory=${subcat.slug}`}
                className="flex items-center justify-between hover:text-secondary-600"
              >
                <span>{subcat.name}</span>
                <span className="text-xs text-gray-500">
                  ({subcat.productCount})
                </span>
              </Link>
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      ))}
    </Menu>
  );
  // Add some custom styles to your CSS file

  // Add these menu items
  // const currencyMenu = (
  //   <Menu className="min-w-[120px]">
  //     <Menu.Item key="usd">
  //       <div className="flex items-center gap-2">
  //         <span>USD ($)</span>
  //       </div>
  //     </Menu.Item>
  //     <Menu.Item key="eur">
  //       <div className="flex items-center gap-2">
  //         <span>EUR (€)</span>
  //       </div>
  //     </Menu.Item>
  //     <Menu.Item key="gbp">
  //       <div className="flex items-center gap-2">
  //         <span>GBP (£)</span>
  //       </div>
  //     </Menu.Item>
  //   </Menu>
  // );

  // const languageMenu = (
  //   <Menu className="min-w-[140px]">
  //     <Menu.Item key="bd">
  //       <div className="flex items-center gap-2">
  //         <BD className="w-4 h-4" />
  //         <span>Bangla</span>
  //       </div>
  //     </Menu.Item>
  //     <Menu.Item key="en">
  //       <div className="flex items-center gap-2">
  //         <US className="w-4 h-4" />
  //         <span>English</span>
  //       </div>
  //     </Menu.Item>
  //     <Menu.Item key="es">
  //       <div className="flex items-center gap-2">
  //         <ES className="w-4 h-4" />
  //         <span>Español</span>
  //       </div>
  //     </Menu.Item>
  //     <Menu.Item key="fr">
  //       <div className="flex items-center gap-2">
  //         <FR className="w-4 h-4" />
  //         <span>Français</span>
  //       </div>
  //     </Menu.Item>
  //   </Menu>
  // );

  const accountMenuOverlay = (
    <Menu className="w-64">
      {!isAuthenticated ? (
        <>
          <Menu.Item
            key="login"
            onClick={() => {
              setActiveAuthTab("login");
              setIsAuthModalOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </div>
          </Menu.Item>
          <Menu.Item
            key="register"
            onClick={() => {
              setActiveAuthTab("register");
              setIsAuthModalOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Register</span>
            </div>
          </Menu.Item>
        </>
      ) : (
        <>
          {/* User Info Header */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <img
                src={
                  //customer?.avatar ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
                }
                alt={`${customer?.firstName} ${customer?.lastName}`}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {`${customer?.firstName} ${customer?.lastName}`}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {customer?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <Menu.Item key="profile">
            <Link to="/profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </Link>
          </Menu.Item>

          <Menu.Item key="orders">
            <Link to="/profile?tab=orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>My Orders {orderCount > 0 && `(${orderCount})`}</span>
            </Link>
          </Menu.Item>

          <Menu.Item key="compare">
            <Link to="/compare" className="flex items-center gap-2">
              <ReloadOutlined className="w-4 h-4" />
              <span>
                Compare List {compareListCount > 0 && `(${compareListCount})`}
              </span>
            </Link>
          </Menu.Item>

          <Menu.Item key="addresses">
            <Link
              to="/profile?tab=addresses"
              className="flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>My Addresses</span>
            </Link>
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item key="logout" onClick={handleLogout} danger>
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </div>
          </Menu.Item>
        </>
      )}
    </Menu>
  );
  const [loading, setLoading] = useState(false);

  const handleSellerSubmit = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const sellerData = {
        ...values,
        rating: 0,
        reviewCount: 0,
      };

      formData.append("data", JSON.stringify(sellerData));

      const response = await api.post("/seller-reg", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.statusCode === 200) {
        toast.success("Seller created successfully");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to save seller");
    } finally {
      setLoading(false);
      // Add your form submission logic here
      setIsSellerModalOpen(false);
    }
  };

  const validateImage = (file: any) => {
    const isAllowedType = ["image/jpeg", "image/png", "image/webp"].includes(
      file.type
    );
    if (!isAllowedType) {
      message.error("You can only upload JPG/PNG/WebP files!");
      return false;
    }
    return true;
  };

  const handleLogoChange = (info: any) => {
    if (info.file.status === "removed") {
      setLogoFile(null);
      setLogoUrl("");
      return;
    }

    const file = info.file;
    if (file && validateImage(file)) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoUrl(previewUrl);
    }
  };

  // Handle product click
  const handleProductClick = (id: string) => {
    setSearchResults([]);
    setSearchTerm("");
    navigate(`/product/${id}`);
  };

  // Handle show all click
  const handleShowAll = () => {
    navigate(`/products?search=${searchTerm}`);
    setSearchResults([]);
    setSearchTerm("");
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle mobile search close
  const handleMobileSearchClose = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
  };

  // Add click outside handler for mobile search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
        setSearchTerm("");
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  return (
    <div
      className={`fixed w-full top-0 z-40 bg-white transition-all duration-300 ${
        isScrolled ? "shadow-md h-16" : "h-20"
      }`}
    >
      {/* Top Banner - Hidden on mobile and when scrolled */}
      {!isMobile && !isTablet && !isScrolled && coupon?.code && (
        <div className="bg-secondary-600 text-white py-2 transition-all duration-300">
          <div className="container mx-auto h-6 flex justify-between items-center text-sm">
            <p className="text-center flex-1">
              Welcome to eCom! Claim your coupon code{" "}
              <span className="font-semibold">{coupon?.code}</span>
            </p>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="bg-white border-b transition-all duration-300">
        <div className="container mx-auto">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              isScrolled ? "h-20" : "h-20"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              {(isMobile || isTablet) && (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="py-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              )}

              {/* Logo */}
              <Link to="/" className="flex items-center">
                <span className="text-2xl md:text-2xl font-bold">
                  <span className="text-secondary-600">S</span>
                  <span className="text-secondary-600">erenity</span>
                </span>
              </Link>
            </div>

            {/* Category and Search Section - Only show on larger screens */}
            {!isMobile && !isTablet && (
              <div className="flex-1 max-w-2xl mx-8 relative">
                <div className="flex gap-2">
                  {/* Category Dropdown */}
                  <Dropdown
                    overlay={categoryMenuOverlay}
                    trigger={["hover"]}
                    placement="bottomLeft"
                  >
                    <button className="min-w-[200px] px-4 py-2.5 bg-gray-50 border rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors">
                      <span className="flex items-center gap-2">
                        <AppstoreOutlined />
                        <span>All Categories</span>
                      </span>
                      <DownOutlined className="text-xs" />
                    </button>
                  </Dropdown>

                  {/* Search Input */}
                  <div className="flex-1 relative" ref={searchRef}>
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={handleInputChange}
                      className="w-full h-12"
                    />
                    {/* Search Results Mega Menu */}
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg z-50 mt-1">
                        <div className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 mb-3">
                            Search Results
                          </h3>
                          <div className="space-y-4">
                            {searchResults.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                                onClick={() => handleProductClick(product.id)}
                              >
                                <img
                                  src={`${BASE_URL}/${product.thumbnail}`}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {product.category.name}
                                  </p>
                                  <p className="text-sm font-medium text-primary-600">
                                    ${product.price}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Show All Button */}
                          <button
                            onClick={handleShowAll}
                            className="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium border-t border-gray-100"
                          >
                            Show All Results
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-4 gap-4">
              {/* Contact - Hidden on mobile */}
              {(isMobile || isTablet) && (
                <button onClick={() => setIsSearchOpen(true)} className="p-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              )}
              <div className="flex items-center space-x-2">
                <Phone className="h-6 w-6 text-gray-600" />
                {!isMobile && !isTablet && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">24/7 Delivery</span>
                    <span className="text-sm font-medium">
                      {companyInfo?.phone}
                    </span>
                  </div>
                )}
              </div>

              {/* Cart & User */}
              <Link to="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* User - Simplified on mobile */}
              <Dropdown
                overlay={accountMenuOverlay}
                trigger={["hover"]}
                placement="bottomRight"
              >
                <div className="flex items-center space-x-2 cursor-pointer">
                  {isAuthenticated ? (
                    <>
                      <img
                        src={
                          //customer?.avatar ||
                          "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
                        }
                        alt={`${customer?.firstName} ${customer?.lastName}`}
                        className="w-8 h-8 rounded-full border-2 border-secondary-600"
                      />
                      {!isMobile && !isTablet && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">
                            Welcome back,
                          </span>
                          <span className="text-sm font-medium truncate max-w-[120px]">
                            {`${customer?.firstName} ${customer?.lastName}`}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <User className="h-6 w-6 text-gray-600" />
                      {!isMobile && !isTablet && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Welcome</span>
                          <span className="text-sm font-medium">
                            My Account
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Modal */}
      <Modal
        title="Search Products"
        open={isSearchOpen}
        onCancel={handleMobileSearchClose}
        footer={null}
        className="mobile-search-modal"
      >
        <div className="relative" ref={mobileSearchRef}>
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full mb-4"
            autoFocus
          />

          {/* Mobile Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-white rounded-lg">
              <div className="space-y-4">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                    onClick={() => {
                      handleProductClick(product.id);
                      handleMobileSearchClose();
                    }}
                  >
                    <img
                      src={`${BASE_URL}/${product.thumbnail}`}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {product.category.name}
                      </p>
                      <p className="text-sm font-medium text-primary-600">
                        ${product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Show All Button */}
              <button
                onClick={() => {
                  handleShowAll();
                  handleMobileSearchClose();
                }}
                className="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium border-t border-gray-100"
              >
                Show All Results
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Mobile Menu Overlay */}
      {(isMobile || isTablet) && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 transform transition-transform duration-300">
          {/* ... mobile menu content ... */}
        </div>
      )}

      <AuthModal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        activeTab={activeAuthTab}
      />

      <Modal
        title="Register as a seller"
        visible={isSellerModalOpen}
        onCancel={() => {
          setIsSellerModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSellerSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please enter your phone number" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="logo" label="Logo">
            <Upload.Dragger
              accept=".jpg,.jpeg,.png,.webp"
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleLogoChange}
              showUploadList={false}
            >
              {logoUrl ? (
                <div style={{ padding: "20px" }}>
                  <img
                    src={logoUrl}
                    alt="logo"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ) : (
                <>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag logo to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for JPG, PNG, WebP. Max size: 2MB
                  </p>
                </>
              )}
            </Upload.Dragger>
            {logoUrl && (
              <Button
                type="text"
                danger
                onClick={() => {
                  setLogoFile(null);
                  setLogoUrl("");
                }}
                icon={<DeleteOutlined />}
                style={{ marginTop: 8 }}
              >
                Remove Logo
              </Button>
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout;

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced as T & { cancel: () => void };
}

// Add these styles to your CSS
// const mobileSearchStyles = `
// .mobile-search-modal .ant-modal-content {
//   margin: 0 12px;
// }

// .mobile-search-modal .ant-modal-body {
//   padding: 16px;
// }

// .mobile-search-modal .ant-modal-close {
//   top: 12px;
// }
// `;
