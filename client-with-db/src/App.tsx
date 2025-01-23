import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./components/layout/Navbar";
import { useScrollPosition } from "./hooks/useScrollPosition";
import ProductDetails from "./pages/ProductDetails";
import { Newsletter } from "./components/common/Newsletter";
import { Footer } from "./components/layout/Footer";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ScrollRestoration } from "./components/common/ScrollRestoration";
import { Cart } from "./pages/Cart";
import { Products } from "./pages/Products";
import Home from "./pages/Home";
import Profile from "./pages/profile/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useCartStore } from "./store/useCartStore";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PaymentFailed } from "./pages/PaymentFailed";
import { OrderSuccess } from "./pages/OrderSuccess";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Shipping } from "./pages/Shipping";
import { Returns } from "./pages/Returns";
import { FAQ } from "./pages/FAQ";
import { Terms } from "./pages/Terms";

const queryClient = new QueryClient();

function App() {
  const { isScrolled } = useScrollPosition();
  const loadCart = useCartStore((state) => state.loadCart);

  useEffect(() => {
    loadCart(); // Load cart from local storage on app start
  }, [loadCart]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollRestoration />
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main
            className={`${
              isScrolled ? "main-content-scrolled" : "main-content"
            }`}
          >
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route
                  path="/cart"
                  element={
                    // <ProtectedRoute>
                    <Cart />
                    // </ProtectedRoute>
                  }
                />
                <Route path="/products" element={<Products />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />
                <Route
                  path="/order-success/:orderNumber"
                  element={<OrderSuccess />}
                />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/returns-exchange" element={<Returns />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </React.Suspense>
          </main>
          <Newsletter />
          <Footer />
        </div>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
