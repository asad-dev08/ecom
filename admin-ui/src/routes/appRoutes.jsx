import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginForm from "../components/Auth/LoginForm";
import ErrorPage from "../pages/ErrorPage";
import PermissionDenied from "../pages/PermissionDenied";
import MainLayout from "../components/Layout/MainLayout";
import { useAuth } from "../components/Auth/AuthContext";
import Dashboard from "../pages/dashboard/Dashboard";
import SecurityRuleList from "../pages/security-rule/security-rule-list/SecurityRuleList";
import SecurityGroupList from "../pages/security-group/security-group-list/SecurityGroupList";
import CompanyList from "../pages/company/company-list/CompanyList";
import UserList from "../pages/users/user-list/UserList";
import FullScreenLoader from "../components/loader/FullScreenLoader";
import ProjectList from "../pages/projects/project-list/ProjectList";
import CategoryList from "../pages/category/category-list/CategoryList";
import NewsList from "../pages/news/news-list/NewsList";
import PageBuilderLayout from "../components/Layout/PageBuilderLayout";
import ProductList from "../pages/products/product-list/ProductList";
import SellerList from "../pages/sellers/seller-list/SellerList";
import SubcategoryList from "../pages/subcategory/subcategory-list/SubcategoryList";
import BrandList from "../pages/brand/brand-list/BrandList";
import BannerList from "../pages/banner/banner-list/BannerList";
import SpecialOfferList from "../pages/special-offer/special-offer-list/SpecialOfferList";
import CouponList from "../pages/coupon/coupon-list/CouponList";
import ShippingChargeList from "../pages/shipping-charge/shipping-charge-list/ShippingChargeList";
import PageList from "../pages/page/page-list/PageList";

const PrivateRoute = ({ element, requiredPermission }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return element;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated === null) {
    return <FullScreenLoader />;
  }

  // Separate page builder route
  const pageBuilderRoute = {};

  const privateRoutes = [
    {
      path: "/dashboard",
      element: <PrivateRoute element={<Dashboard />} />,
    },
    {
      path: "/security-rule/security-rule-list",
      element: <PrivateRoute element={<SecurityRuleList />} />,
    },
    {
      path: "/security-group/security-group-list",
      element: <PrivateRoute element={<SecurityGroupList />} />,
    },
    {
      path: "/company",
      element: <PrivateRoute element={<CompanyList />} />,
    },
    {
      path: "/users",
      element: <PrivateRoute element={<UserList />} />,
    },
    {
      path: "/projects/project-list",
      element: <PrivateRoute element={<ProjectList />} />,
    },
    {
      path: "/category/category-list",
      element: <PrivateRoute element={<CategoryList />} />,
    },
    {
      path: "/news/news-list",
      element: <PrivateRoute element={<NewsList />} />,
    },
    {
      path: "/products/product-list",
      element: <PrivateRoute element={<ProductList />} />,
    },
    {
      path: "/sellers/seller-list",
      element: <PrivateRoute element={<SellerList />} />,
    },
    {
      path: "/subcategory/subcategory-list",
      element: <PrivateRoute element={<SubcategoryList />} />,
    },
    {
      path: "/brand/brand-list",
      element: <PrivateRoute element={<BrandList />} />,
    },
    {
      path: "/banners",
      element: <PrivateRoute element={<BannerList />} />,
    },
    {
      path: "/special-offers",
      element: <PrivateRoute element={<SpecialOfferList />} />,
    },
    {
      path: "/coupons/coupon-list",
      element: <PrivateRoute element={<CouponList />} />,
    },
    {
      path: "/shipping-charges/shipping-charge-list",
      element: <PrivateRoute element={<ShippingChargeList />} />,
    },
    {
      path: "/pages",
      element: <PrivateRoute element={<PageList />} />,
    },
    {
      path: "*",
      element: <PermissionDenied />,
    },
  ];

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={location.state?.from?.pathname || "/"} replace />
          ) : (
            <LoginForm />
          )
        }
      />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/permission-denied" element={<PermissionDenied />} />

      {isAuthenticated && (
        <>
          {/* Page Builder Layout */}
          <Route element={<PageBuilderLayout />}>
            <Route
              path={pageBuilderRoute.path}
              element={pageBuilderRoute.element}
            />
          </Route>

          {/* Main Layout */}
          <Route path="/" element={<MainLayout />}>
            {privateRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <PrivateRoute
                    element={route.element}
                    requiredPermission={route.permission}
                  />
                }
              />
            ))}
          </Route>
        </>
      )}

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/error" : "/login"} replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
