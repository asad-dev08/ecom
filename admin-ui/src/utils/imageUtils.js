import { BASE_DOC_URL } from "./actionTypes";

export const getImageUrl = (path) => {
  if (!path) return "";

  // If it's already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Otherwise, prepend your API base URL
  return `${process.env.REACT_APP_API_URL}/${path}`;
};

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateImage = (file) => {
  const isAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type);
  if (!isAllowedType) {
    return {
      valid: false,
      error: "You can only upload JPG/PNG/WebP/GIF files!",
    };
  }

  const isLt5M = file.size <= MAX_IMAGE_SIZE;
  if (!isLt5M) {
    return {
      valid: false,
      error: "Image must be smaller than 5MB!",
    };
  }

  return { valid: true };
};
