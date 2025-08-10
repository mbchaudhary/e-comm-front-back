import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../types";
import apiService from "../services/api";

interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  // Product details from JOIN
  name: string;
  price: number;
  images: string | string[];
  stock_quantity?: number;
  brand?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateCartItem: (id: number, quantity: number) => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's cart with items
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setCartItems([]);
        return;
      }

      // Get cart items using the correct API method
      const items = await apiService.getCartItems();
      setCartItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setError('Failed to load cart items');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart
  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!product || !product.id) {
        throw new Error('Invalid product');
      }

      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      await apiService.addToCart({
        product_id: product.id,
        quantity
      });
      
      // Refresh cart items after adding
      await fetchCart();
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      setError(error.message || 'Failed to add item to cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (id: number) => {
    try {
      setError(null);
      await apiService.removeFromCart(id);
      
      // Update local state immediately for better UX
      setCartItems(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('Failed to remove from cart:', error);
      setError(error.message || 'Failed to remove item from cart');
      
      // Refresh cart to sync with server state
      await fetchCart();
      throw error;
    }
  };

  // Update cart item quantity
  const updateCartItem = async (id: number, quantity: number) => {
    try {
      setError(null);
      
      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      await apiService.updateCartItem(id, quantity);
      
      // Update local state immediately
      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    } catch (error: any) {
      console.error('Failed to update cart item:', error);
      setError(error.message || 'Failed to update item quantity');
      
      // Refresh cart to sync with server state
      await fetchCart();
      throw error;
    }
  };

  // Calculate cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  // Get total number of items in cart
  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => {
      return total + (Number(item.quantity) || 0);
    }, 0);
  };

  // Clear cart (call API to clear on server)
  const clearCart = async () => {
    try {
      setError(null);
      await apiService.clearCart();
      setCartItems([]);
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      setError(error.message || 'Failed to clear cart');
      throw error;
    }
  };

  // Load cart on mount if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCart();
    }
  }, []);

  // Listen for storage changes (user login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (token) {
        fetchCart();
      } else {
        setCartItems([]);
        setError(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateCartItem,
      getCartTotal,
      getCartItemCount,
      loading,
      error,
      fetchCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
