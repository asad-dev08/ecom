import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  clearError,
} from "../store/slices/customerAuthSlice";

export const useCustomerAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { customer, isAuthenticated, loading, error, tokens } = useSelector(
    (state: RootState) => state.customerAuth
  );

  const login = (credentials: { email: string; password: string }) => {
    return dispatch(loginCustomer(credentials));
  };

  const register = (userData: {
    first_name: string | undefined;
    last_name: string | undefined;
    email: string;
    phone?: string | undefined;
    password: string;
  }) => {
    return dispatch(registerCustomer(userData as any));
  };

  const logout = () => {
    return dispatch(logoutCustomer());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    customer,
    isAuthenticated,
    loading,
    error,
    tokens,
    login,
    register,
    logout,
    clearAuthError,
  };
};
