import { useEffect, useState } from "react";
import { useCustomerAuth } from "./useCustomerAuth";
import api from "../services/api";

interface CustomerData {
  compareListCount: number;
  orderCount: number;
}

export const useCustomerData = () => {
  const { isAuthenticated, tokens } = useCustomerAuth();
  const [customerData, setCustomerData] = useState<CustomerData>({
    compareListCount: 0,
    orderCount: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCustomerData = async () => {
    if (!isAuthenticated || !tokens?.accessToken) return;

    try {
      setLoading(true);
      const response = await api.get('/customer-dashboard');
      setCustomerData(response.data.data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [isAuthenticated, tokens?.accessToken]);

  return {
    ...customerData,
    loading,
    refetch: fetchCustomerData,
  };
};
