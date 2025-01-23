export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions: {
    size?: string;
    color?: string;
    [key: string]: string | undefined;
  };
} 