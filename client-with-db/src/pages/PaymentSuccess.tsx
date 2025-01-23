import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import toast from "react-hot-toast";

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const clearCart = useCartStore((state) => state.clearCart);
  const orderId = new URLSearchParams(location.search).get("orderId");

  useEffect(() => {
    try {
      // Force clear the cart
      clearCart();
      localStorage.removeItem("cart"); // Directly clear localStorage as well
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 text-secondary-600" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-4">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
        )}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/profile?tab=orders`)}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            View Order
          </button>
          <button
            onClick={() => navigate("/products")}
            className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
