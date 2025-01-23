import CryptoJS from "crypto-js";

// Using a constant for the encryption key
// Note: In a production environment, this should be stored more securely
export const ENCRYPTION_KEY = "your-secure-encryption-key-2024";

export const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

export const decryptData = (encryptedData: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return null;
  }
};
