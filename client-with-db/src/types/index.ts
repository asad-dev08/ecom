export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "VENDOR" | "CUSTOMER";
  avatar?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions: {
    size?: string;
    [key: string]: any;
  };
}
