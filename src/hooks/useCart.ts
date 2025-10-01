import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToCart, clearCart, listCartItems, removeFromCart, removeSoldItemsFromCart, updateCartItemQuantity } from '../api/cart';

// Types for cart items
export interface CartItem {
  product_id: string;
  qty: number;
  price_snapshot_cents: number;
  products: {
    title: string;
    photos: string[];
    stock: number;
  } | null;
}

// Centralized cart query configuration
export const CART_QUERY_KEY = ['cart'];
export const CART_STALE_TIME = 2 * 60 * 1000; // 2 minutes - balance between performance and freshness
export const CART_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export function useCartQuery() {
  return useQuery<CartItem[]>({
    queryKey: CART_QUERY_KEY,
    queryFn: listCartItems,
    staleTime: CART_STALE_TIME,
    cacheTime: CART_CACHE_TIME,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches on focus
    refetchOnMount: 'always', // Always refetch when component mounts
  });
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, qty, price_cents }: { productId: string; qty: number; price_cents: number }) =>
      addToCart(productId, qty, price_cents),
    onSuccess: () => {
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useRemoveFromCartMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useUpdateCartQuantityMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, qty }: { productId: string; qty: number }) =>
      updateCartItemQuantity(productId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useClearCartMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useRemoveSoldItemsMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeSoldItemsFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

// Helper hook for cart item count
export function useCartItemCount() {
  const { data: cartItems = [] } = useCartQuery();
  return cartItems.reduce((total: number, item: CartItem) => total + item.qty, 0);
}

// Helper hook for cart total
export function useCartTotal() {
  const { data: cartItems = [] } = useCartQuery();
  const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.qty * item.price_snapshot_cents), 0);
  const shipping = subtotal > 10000 ? 0 : 999; // Free shipping over $100
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const total = subtotal + shipping + tax;
  
  return { subtotal, shipping, tax, total };
}
