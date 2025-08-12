import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Order, OrderItem } from "../types";
import apiService from "../services/api";

interface OrderContextType {
  orderItems: OrderItem[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: number) => Promise<Order | null>;
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  clearError: () => void;
}

const OrderContext = createContext<OrderContextType>({} as OrderContextType);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch all orders and flatten to OrderItem[]
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setOrderItems([]);
        return;
      }

      const orders: Order[] = await apiService.getOrders(); // returns Order[]
      const allItems: OrderItem[] = Array.isArray(orders)
        ? orders.flatMap(order => order.items || [])
        : [];

      setOrderItems(allItems);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError(err.message || "Failed to load orders");
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single order by ID
  const fetchOrderById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      return await apiService.getOrderById(id);
    } catch (err: any) {
      console.error("Failed to fetch order by ID:", err);
      setError(err.message || "Failed to load order");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new order
  const createOrder = useCallback(async (orderData: Partial<Order>) => {
    try {
      setLoading(true);
      setError(null);
      return await apiService.createOrder(orderData);
    } catch (err: any) {
      console.error("Failed to create order:", err);
      setError(err.message || "Failed to create order");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load orders on mount if user logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchOrders();
    }
  }, [fetchOrders]);

  return (
    <OrderContext.Provider
      value={{
        orderItems,
        loading,
        error,
        fetchOrders,
        fetchOrderById,
        createOrder,
        clearError,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

// Hook for using the Order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};
