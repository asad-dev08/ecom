import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useNavigate } from "react-router-dom";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
}

// Dummy user data
const DUMMY_USER = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  phone: "01234567890",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (credentials) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check against dummy credentials
        if (
          credentials.email === "john@example.com" &&
          credentials.password === "password123"
        ) {
          set({ user: DUMMY_USER, isAuthenticated: true });
          return true;
        }
        throw new Error("Invalid credentials");
      },

      register: async (userData) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In a real app, you would send this to your backend
        const newUser = {
          ...DUMMY_USER,
          ...userData,
        };

        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        const navigate = useNavigate();
        navigate("/");
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
