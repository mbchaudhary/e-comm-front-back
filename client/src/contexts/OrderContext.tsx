import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Order, OrderItem } from "../types";
import apiService from "../services/api";

interface OrderContextType {
  orders: Order[];
  orderItems: OrderItem[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchOrdersByUser: (userId: number) => Promise<void>;
  fetchOrderById: (id: number) => Promise<Order | null>;
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  clearError: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// ✅ Helper to guarantee we always get an array of orders
const normalizeOrders = (data: any): Order[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.orders && Array.isArray(data.orders)) return data.orders;
  return [];
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getOrders();
      const ordersArray = normalizeOrders(data);
      setOrders(ordersArray);
      setOrderItems(ordersArray.flatMap(order => order.items || []));
    } catch (err: any) {
      setError(err.message || "Failed to fetch orders");
      setOrders([]);
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrdersByUser = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getOrdersByUser(userId);
      const ordersArray = normalizeOrders(data);
      setOrders(ordersArray);
      setOrderItems(ordersArray.flatMap(order => order.items || []));
    } catch (err: any) {
      setError(err.message || "Failed to fetch orders for user");
      setOrders([]);
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      return await apiService.getOrderById(id);
    } catch (err: any) {
      setError(err.message || "Failed to fetch order");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (orderData: Partial<Order>) => {
    try {
      setLoading(true);
      setError(null);
      return await apiService.createOrder(orderData);
    } catch (err: any) {
      setError(err.message || "Failed to create order");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch orders if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = Number(localStorage.getItem("UserID"));
    if (token && userId) {
      fetchOrdersByUser(userId);
    }
  }, [fetchOrdersByUser]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        orderItems,
        loading,
        error,
        fetchOrders,
        fetchOrdersByUser,
        fetchOrderById,
        createOrder,
        clearError,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within an OrderProvider");
  return ctx;
};
