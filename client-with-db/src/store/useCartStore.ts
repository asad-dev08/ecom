import { create } from "zustand";

interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loadCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const updatedItems = [...state.items, item];
      localStorage.setItem("cart", JSON.stringify(updatedItems));
      return { items: updatedItems };
    }),
  removeItem: (productId) =>
    set((state) => {
      const updatedItems = state.items.filter(
        (item) => item.productId !== productId
      );
      localStorage.setItem("cart", JSON.stringify(updatedItems));
      return { items: updatedItems };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedItems));
      return { items: updatedItems };
    }),
  clearCart: () => {
    set({ items: [] });
  },
  loadCart: () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      set({ items: JSON.parse(savedCart) });
    }
  },
}));
