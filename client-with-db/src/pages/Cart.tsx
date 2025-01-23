import { useEffect, useState } from "react";
import { useCartStore } from "../store/useCartStore";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BASE_URL } from "../utils/actionTypes";
import api from "../services/api";
import { useQuery } from "@tanstack/react-query";
import { Radio, Select } from "antd";
import { useCustomerAuth } from "../hooks/useCustomerAuth";

interface OrderResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
  };
}

export const Cart = () => {
  const { items, removeItem, updateQuantity } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "paypal" | "cod" | "sslcommerz"
  >("cod");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  // const [orderData, setOrderData] = useState<Partial<OrderData>>({});
  const [selectedShippingCharge, setSelectedShippingCharge] =
    useState<any>(null);
  const clearCart = useCartStore((state) => state.clearCart);
  const { isAuthenticated } = useCustomerAuth();
  const [guestShippingInfo, setGuestShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  // Fetch addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await api.get("/addresses");
      return response.data.data;
    },
  });

  // Fetch shipping charges
  const { data: shippingCharges = [] } = useQuery({
    queryKey: ["shipping-charges"],
    queryFn: async () => {
      const response = await api.get("/shipping-charges");
      return response.data.data;
    },
  });

  // useEffect(() => {
  //   if (shippingCharges.length > 0) {
  //     setSelectedShippingCharge(shippingCharges[0]);
  //   }
  // }, [shippingCharges]);

  // Use selected shipping charge amount or default to first available
  const shippingCost = selectedShippingCharge
    ? Number(selectedShippingCharge.amount)
    : shippingCharges[0]?.amount || 0;

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = (subtotal * appliedDiscount) / 100;
  const total = subtotal + parseFloat(shippingCost) - discount;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };
  useEffect(() => {
    if (total > 0) {
      const shippingCharge =
        shippingCharges &&
        shippingCharges.length > 0 &&
        shippingCharges.find(
          (charge: any) =>
            total >= parseFloat(charge.min_amount) &&
            total <= parseFloat(charge.max_amount)
        );
      if (shippingCharge) {
        setSelectedShippingCharge(shippingCharge);
      }
    }
  }, [total]);

  const handleApplyCoupon = async () => {
    try {
      const response = await api.post("/coupons/validate", {
        code: couponCode,
      });
      setAppliedDiscount(response.data.data.discount);
      toast.success("Coupon applied successfully!");
    } catch (error) {
      toast.error("Invalid coupon code");
    }
  };

  const handleProceedToPayment = async () => {
    if (isAuthenticated && !selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    if (!isAuthenticated && !validateGuestInfo()) {
      return;
    }

    if (paymentMethod === "cod") {
      try {
        toast.loading("Processing your order...");
        const orderData = {
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            selectedOptions: item.selectedOptions,
          })),
          addressId: isAuthenticated ? selectedAddressId : null,
          guestInfo: !isAuthenticated
            ? JSON.stringify(guestShippingInfo)
            : null,
          shippingChargeId:
            (selectedShippingCharge && selectedShippingCharge.id) || "",
          paymentMethod: "cod",
          couponCode: couponCode || undefined,
          subtotal,
          shippingCost: Number(
            (selectedShippingCharge && selectedShippingCharge.amount) || 0
          ),
          discount: (subtotal * appliedDiscount) / 100,
          total,
        };

        const response = await api.post<OrderResponse>(
          "/orders/create-cod",
          orderData
        );
        toast.dismiss();

        if (response.data?.statusCode === 200) {
          // setOrderData(response.data.data);
          toast.success(response.data.message);
          clearCart();
          localStorage.removeItem("cart");
        }
      } catch (error: any) {
        toast.dismiss();
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to create order"
        );
      }
    }
  };

  const handleSSLCommerzPayment = async () => {
    // if (!selectedShippingCharge) {
    //   toast.error("Please select a shipping method");
    //   return;
    // }

    if (isAuthenticated && !selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    if (!isAuthenticated && !validateGuestInfo()) {
      return;
    }

    try {
      const response = await api.post("/orders/create-sslcommerz", {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          selectedOptions: item.selectedOptions,
        })),
        addressId: isAuthenticated ? selectedAddressId : null,
        guestInfo: !isAuthenticated ? guestShippingInfo : null,
        shippingChargeId:
          (selectedShippingCharge && selectedShippingCharge.id) || "",
        couponCode: couponCode || undefined,
      });

      // Redirect to SSLCommerz payment page
      window.location.href = response.data.data.redirectUrl;
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create order"
      );
    }
  };

  // const createOrder = async () => {
  //   try {
  //     const response = await api.post("/orders/create-paypal", {
  //       items,
  //       addressId: selectedAddressId,
  //       couponCode: couponCode || undefined,
  //     });
  //     return response.data.data.id;
  //   } catch (error) {
  //     toast.error("Failed to create PayPal order");
  //     throw error;
  //   }
  // };

  // const onApprove = async (data: any) => {
  //   try {
  //     const response = await api.post("/orders/capture-paypal", {
  //       orderId: data.orderID,
  //     });
  //     setOrderData(response.data.data);
  //   } catch (error) {
  //     toast.error("Failed to complete payment");
  //   }
  // };

  const validateGuestInfo = () => {
    if (!guestShippingInfo.phone) {
      toast.error("Please provide a phone number");
      return false;
    }
    return true;
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link
          to="/products"
          className="text-secondary-600 hover:text-secondary-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center p-4 border-b"
              >
                <img
                  src={`${BASE_URL}/${item.image}`}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1 ml-4">
                  <h3 className="font-medium">{item.name}</h3>
                  <div className="text-gray-500 text-sm space-y-1">
                    {Object.entries(item.selectedOptions).map(
                      ([key, option]: [string, any]) => (
                        <div key={key}>
                          {option.name}:{" "}
                          <span className="font-medium">{option.value}</span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity - 1)
                      }
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity + 1)
                      }
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 hover:text-red-600 mt-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            {/* Coupon Code */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700"
              >
                Apply
              </button>
            </div>

            {/* Shipping Method Selection */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Shipping Method</h3>
              <Select
                disabled
                className="w-full"
                placeholder="Select shipping method"
                value={selectedShippingCharge?.id}
                onChange={(value) =>
                  setSelectedShippingCharge(
                    shippingCharges.find((charge: any) => charge.id === value)
                  )
                }
              >
                {shippingCharges.map((charge: any) => (
                  <Select.Option key={charge.id} value={charge.id}>
                    {charge.name} - ${Number(charge.amount).toFixed(2)}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Price Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${parseFloat(shippingCost).toFixed(2)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Guest Checkout Form */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Shipping Information</h3>
              {isAuthenticated ? (
                <Select
                  className="w-full"
                  placeholder="Select an address"
                  value={selectedAddressId}
                  onChange={setSelectedAddressId}
                >
                  {addresses.map((address: any) => (
                    <Select.Option key={address.id} value={address.id}>
                      {address.label} - {address.address}, {address.city}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={guestShippingInfo.firstName}
                      onChange={(e) =>
                        setGuestShippingInfo((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={guestShippingInfo.lastName}
                      onChange={(e) =>
                        setGuestShippingInfo((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={guestShippingInfo.email}
                    onChange={(e) =>
                      setGuestShippingInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="tel"
                    placeholder="Phone *"
                    value={guestShippingInfo.phone}
                    onChange={(e) =>
                      setGuestShippingInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={guestShippingInfo.address}
                    onChange={(e) =>
                      setGuestShippingInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Apartment"
                    value={guestShippingInfo.apartment}
                    onChange={(e) =>
                      setGuestShippingInfo((prev) => ({
                        ...prev,
                        apartment: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={guestShippingInfo.city}
                      onChange={(e) =>
                        setGuestShippingInfo((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={guestShippingInfo.state}
                      onChange={(e) =>
                        setGuestShippingInfo((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Country"
                      value={guestShippingInfo.country}
                      onChange={(e) =>
                        setGuestShippingInfo((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={guestShippingInfo.postalCode}
                      onChange={(e) =>
                        setGuestShippingInfo((prev) => ({
                          ...prev,
                          postalCode: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full space-y-2"
              >
                <Radio value="cod" className="block">
                  Cash on Delivery
                </Radio>
                {/* <Radio value="paypal" className="block">
                  PayPal
                </Radio> */}
                <Radio value="sslcommerz" className="block">
                  SSLCommerz
                </Radio>
              </Radio.Group>
            </div>

            {/* Payment Buttons */}
            {paymentMethod === "cod" ? (
              <button
                onClick={handleProceedToPayment}
                className="w-full py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
              >
                Place Order
              </button>
            ) : (
              // : paymentMethod === "paypal" ? (
              //   <PayPalScriptProvider
              //     options={{
              //       clientId: "test",
              //       currency: "USD",
              //     }}
              //   >
              //     <PayPalButtons
              //       createOrder={createOrder}
              //       onApprove={onApprove}
              //       style={{ layout: "horizontal" }}
              //     />
              //   </PayPalScriptProvider>
              // )
              <button
                onClick={handleSSLCommerzPayment}
                className="w-full py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
              >
                Pay with SSLCommerz
              </button>
            )}
          </div>
        </div>
      </div>

      {/* OrderModal */}
      {/* <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          // Redirect to orders page after closing modal
          window.location.href = "/orders";
        }}
        orderData={orderData}
      /> */}
    </div>
  );
};
