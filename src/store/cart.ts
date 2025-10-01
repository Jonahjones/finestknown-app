// Simple cart store stub - TODO: implement full cart functionality
import { create } from 'zustand';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  metal?: string;
  weight?: number;
}

interface CartStore {
  items: CartItem[];
  totalItems: () => number;
  totalPrice: () => number;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  totalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
  
  totalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  
  updateQuantity: (id: string, quantity: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter((item) => item.quantity > 0),
    }));
  },
  
  removeItem: (id: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
}));

