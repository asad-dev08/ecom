import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { secureLocalStorage } from "../utils/secureStorage";

class JwtService {
  constructor() {
    this.listeners = new Map();
  }

  init() {
    this.setInterceptors();
    this.handleAuthentication();
  }

  setInterceptors() {
    axios.interceptors.response.use(
      (response) => response,
      (err) => {
        return new Promise((resolve, reject) => {
          if (
            err.response?.status === 401 &&
            err.config &&
            !err.config.__isRetryRequest
          ) {
            console.log("401 error detected, logging out");
            this.emit("onAutoLogout", "Token expired");
            this.setSession(null);
          }
          throw err;
        });
      }
    );
  }

  handleAuthentication() {
    const access_token = this.getAccessToken();
    console.log(
      "Handling authentication, token:",
      access_token ? "exists" : "does not exist"
    );

    if (!access_token) {
      console.log("No access token found, emitting onNoAccessToken");
      this.emit("onNoAccessToken");
      return;
    }

    if (this.isAuthTokenValid(access_token)) {
      console.log("Token is valid, setting session and emitting onAutoLogin");
      this.setSession(access_token);
      this.emit("onAutoLogin", true);
    } else {
      console.log(
        "Token is invalid, clearing session and emitting onAutoLogout"
      );
      this.setSession(null);
      this.emit("onAutoLogout", "access_token expired");
    }
  }

  createSession(access_token) {
    if (access_token) {
      console.log("Creating session with token");
      this.setSession(access_token);
      this.emit("onLogin", access_token);
    } else {
      console.log(
        "No token provided for createSession, emitting onNoAccessToken"
      );
      this.emit("onNoAccessToken");
    }
  }

  setSession(access_token) {
    if (access_token) {
      console.log("Setting session with token");
      secureLocalStorage.setItem("access_token", access_token);
      axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    } else {
      console.log("Clearing session");
      secureLocalStorage.removeItem("access_token");
      delete axios.defaults.headers.common.Authorization;
    }
  }

  logout() {
    console.log("Logging out");
    this.setSession(null);
    this.emit("onLogout", "Logged out");
  }

  isAuthTokenValid(access_token) {
    if (!access_token) {
      console.log("No token provided for validation");
      return false;
    }
    try {
      const decoded = jwtDecode(access_token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.warn("Access token expired");
        return false;
      }
      console.log("Token is valid");
      return true;
    } catch (err) {
      console.error("Token validation error:", err);
      return false;
    }
  }

  getAccessToken() {
    return secureLocalStorage.getItem("access_token");
  }

  isTokenValid(token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        console.log("Token is expired");
        return false;
      }

      console.log("Token is valid");
      return true;
    } catch (error) {
      console.error("Error decoding token:", error);
      return false;
    }
  }

  getUserDataFromToken(token) {
    try {
      const decodedToken = jwtDecode(token);

      return {
        id: decodedToken.id,
        email: decodedToken.email,
        company_id: decodedToken.company_id,
        username: decodedToken.username,
        is_admin: decodedToken.is_admin || false,
        fullname: decodedToken.fullname,
        phone: decodedToken.phone,
        address: decodedToken.address,
      };
    } catch (error) {
      console.error("Error getting user data from token:", error);
      return null;
    }
  }

  on(event, callback) {
    this.off(event);
    this.listeners.set(event, callback);
  }

  off(event) {
    this.listeners.delete(event);
  }

  emit(event, data) {
    const listener = this.listeners.get(event);
    if (listener) {
      listener(data);
    }
  }
}

const instance = new JwtService();
export default instance;
