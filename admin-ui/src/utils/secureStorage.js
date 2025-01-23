import CryptoJS from "crypto-js";
import { SECURE_STORAGE_KEY } from "./actionTypes";

const SECRET_KEY = SECURE_STORAGE_KEY || "your-fallback-secret-key";

export const secureLocalStorage = {
  setItem(key, value) {
    const encryptedValue = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      SECRET_KEY
    ).toString();
    localStorage.setItem(key, encryptedValue);
  },

  getItem(key) {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;

    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedValue,
        SECRET_KEY
      ).toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error("Error decrypting value:", error);
      return null;
    }
  },

  removeItem(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  },
};
