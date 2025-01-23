export const BASE_URL = "http://localhost:5000/api/admin";
export const BASE_URLL = "https://live.com/api/admin";
export const BASE_DOC_URL = "http://localhost:5000";
export const BASE_DOC_URLL = "https://live.com";
export const SECURE_STORAGE_KEY = "this is secure storage key";

export const UserTypeList = [
  { value: "admin", label: "ADMIN" },
  { value: "user", label: "USER" },
  { value: "visitor", label: "VISITOR" },
];

export const USER_CONTROLLER = "users";
export const SECURITY_RULE_CONTROLLER = "security-rules";
export const SECURITY_GROUP_CONTROLLER = "security-groups";
export const COMPANY_CONTROLLER = "companies";
export const MENU_CONTROLLER = "menus";
export const PAGINATION_API = "pagination";
export const CHECK_AVAILABLE_USERNAME_API = "check-available-username";
export const PROJECT_CONTROLLER = "projects";
export const CATEGORY_CONTROLLER = "category";
export const NEWS_CONTROLLER = "news";
export const PRODUCT_CONTROLLER = "products";
export const SELLER_CONTROLLER = "sellers";
export const BRAND_CONTROLLER = "brands";
export const SUBCATEGORY_CONTROLLER = "subcategories";
export const DASHBOARD_CONTROLLER = "dashboard";
export const ORDER_CONTROLLER = "orders";
export const BANNER_CONTROLLER = "banners";
export const SPECIAL_OFFER_CONTROLLER = "special-offers";
export const COUPON_CONTROLLER = "coupons";
export const SHIPPING_CHARGE_CONTROLLER = "shipping-charges";
export const PAGE_CONTROLLER = "pages";

export const DEFAULT_SORTING = [{ field: "created_at", order: "desc" }];

export const newsTypeList = [
  { label: "News", value: "news" },
  { label: "Blog", value: "blog" },
];

export const ProjectStatusList = [
  { label: "Not Started", value: "NOT_STARTED" },
  { label: "Planning", value: "PLANNING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "On Hold", value: "ON_HOLD" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export const ProjectStatusColors = {
  NOT_STARTED: "#808080", // Gray
  PLANNING: "#87CEEB", // Sky Blue
  IN_PROGRESS: "#1E90FF", // Dodger Blue
  ON_HOLD: "#FFA500", // Orange
  UNDER_REVIEW: "#9370DB", // Medium Purple
  COMPLETED: "#32CD32", // Lime Green
  CANCELLED: "#FF0000", // Red
  DELAYED: "#FF6347", // Tomato
  TESTING: "#FFD700", // Gold
  MAINTENANCE: "#20B2AA", // Light Sea Green
};

export const ProjectStatusDescriptions = {
  NOT_STARTED: "Project has been created but work hasn't begun",
  PLANNING: "Project is in the planning and preparation phase",
  IN_PROGRESS: "Project is actively being worked on",
  ON_HOLD: "Project has been temporarily paused",
  UNDER_REVIEW: "Project is being reviewed by stakeholders",
  COMPLETED: "Project has been successfully completed",
  CANCELLED: "Project has been terminated before completion",
  DELAYED: "Project is behind schedule",
  TESTING: "Project is in the testing phase",
  MAINTENANCE: "Project is in maintenance mode",
};
