import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import jwtService from "../../services/jwtService";
import {
  logout,
  setUser,
  setToken,
  setAuthenticated,
} from "../../store/auth/authSlice";
import { message } from "antd";
import FullScreenLoader from "../loader/FullScreenLoader";

const AuthContext = createContext(null);

export const AuthProvider = ({ children, navigate }) => {
  const dispatch = useDispatch();
  const { token, user, isAuthenticated } = useSelector((state) => state.auth);
  const [waitAuthCheck, setWaitAuthCheck] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

    const initAuth = async () => {
      const storedToken = jwtService.getAccessToken();
      if (storedToken && jwtService.isTokenValid(storedToken)) {
        const userData = jwtService.getUserDataFromToken(storedToken);
        dispatch(setToken(storedToken));
        dispatch(setUser(userData));
        dispatch(setAuthenticated(true));
      }

      jwtService.on("onAutoLogin", async () => {
        if (isSubscribed) {
          const token = jwtService.getAccessToken();
          if (token && jwtService.isTokenValid(token)) {
            const userData = jwtService.getUserDataFromToken(token);
            dispatch(setUser(userData));
            dispatch(setToken(token));
            dispatch(setAuthenticated(true));
          } else {
            dispatch(logout());
            navigate("/login");
          }
          setWaitAuthCheck(false);
        }
      });

      jwtService.on("onAutoLogout", (msg) => {
        if (isSubscribed) {
          if (msg) message.error(msg);
          dispatch(logout());
          navigate("/login");
          setWaitAuthCheck(false);
        }
      });

      jwtService.on("onNoAccessToken", () => {
        if (isSubscribed) {
          dispatch(logout());
          navigate("/login");
          setWaitAuthCheck(false);
        }
      });

      jwtService.init();
    };

    initAuth();

    return () => {
      isSubscribed = false;
      jwtService.off("onAutoLogin");
      jwtService.off("onAutoLogout");
      jwtService.off("onNoAccessToken");
    };
  }, [dispatch, navigate]);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      user,
      token,
      logout: () => {
        jwtService.logout();
        dispatch(logout());
        navigate("/login");
      },
    }),
    [isAuthenticated, user, token, dispatch, navigate]
  );

  if (waitAuthCheck) {
    return <FullScreenLoader />;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
