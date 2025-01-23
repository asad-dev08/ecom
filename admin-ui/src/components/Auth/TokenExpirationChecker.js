import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import jwtService from "../../services/jwtService";
import { logout, verifyToken } from "../../store/auth/authSlice";

export default function TokenExpirationChecker({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const token = jwtService.getAccessToken();
      if (token) {
        if (isFirstRender.current) {
          // Page was refreshed, verify token with the server
          isFirstRender.current = false;
          try {
            await dispatch(verifyToken()).unwrap();
          } catch (error) {
            console.error("Token verification failed:", error);
            dispatch(logout());
            navigate("/login");
          }
        } else {
          // Not a page refresh, check token locally
          if (!jwtService.isTokenValid(token)) {
            console.log("Token is invalid, logging out");
            dispatch(logout());
            navigate("/login");
          }
        }
      }
    };

    checkTokenExpiration();

    // const intervalId = setInterval(() => {
    //   if (!isFirstRender.current) {
    //     checkTokenExpiration();
    //   }
    // }, 5 * 60 * 1000);

    // return () => clearInterval(intervalId);
  }, [dispatch, navigate]);

  return <>{children}</>;
}
