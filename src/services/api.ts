import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  User,
  Product,
  Category,
  Cart,
  CartItem,
  Order,
  Wishlist,
  Payment,
  AuthResponse,
} from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 seconds timeout
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }

        // Handle network errors
        if (error.code === "NETWORK_ERROR" || !error.response) {
          throw new Error("Network error. Please check your connection.");
        }

        // Handle API errors
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "An error occurred";
        throw new Error(message);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async register(
    userData: Partial<User> & { password: string }
  ): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post(
        "/auth/register",
        userData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> = await this.api.get("/users");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserProfile(userId: number): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.api.get(
        `/users/${userId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(
    userId: number,
    userData: Partial<User>
  ): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.api.put(
        `/users/${userId}`,
        userData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    try {
      const response: AxiosResponse<Product[]> = await this.api.get(
        "/products"
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getProductById(id: number): Promise<Product> {
    try {
      const response: AxiosResponse<Product> = await this.api.get(
        `/products/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const response: AxiosResponse<Product> = await this.api.post(
        "/products",
        productData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(
    id: number,
    productData: Partial<Product>
  ): Promise<Product> {
    try {
      const response: AxiosResponse<Product> = await this.api.put(
        `/products/${id}`,
        productData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await this.api.delete(`/products/${id}`);
    } catch (error) {
      throw error;
    }
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    try {
      const response: AxiosResponse<Category[]> = await this.api.get(
        "/categories"
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      const response: AxiosResponse<Category> = await this.api.get(
        `/categories/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cart endpoints
  async getCart(): Promise<Cart> {
    try {
      const response: AxiosResponse<Cart> = await this.api.get("/cart");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCartItems(): Promise<CartItem[]> {
    try {
      const response: AxiosResponse<CartItem[]> = await this.api.get(
        "/cart-items"
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addToCart(cartItemData: Partial<CartItem>): Promise<CartItem> {
    try {
      const response: AxiosResponse<CartItem> = await this.api.post(
        "/cart-items",
        cartItemData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    try {
      const response: AxiosResponse<CartItem> = await this.api.put(
        `/cart-items/${id}`,
        { quantity }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async removeFromCart(id: number): Promise<void> {
    try {
      await this.api.delete(`/cart-items/${id}`);
    } catch (error) {
      throw error;
    }
  }

  // Fix the clearCart endpoint to match backend
  async clearCart(): Promise<void> {
    try {
      await this.api.delete("/cart-items/clear/all");
    } catch (error) {
      throw error;
    }
  }

  async getCartItemById(id: number): Promise<CartItem> {
    try {
      const response: AxiosResponse<CartItem> = await this.api.get(
        `/cart-items/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Order endpoints
  async getOrders(): Promise<Order[]> {
    try {
      const response: AxiosResponse<Order[]> = await this.api.get("/orders");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(id: number): Promise<Order> {
    try {
      const response: AxiosResponse<Order> = await this.api.get(
        `/orders/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      const response: AxiosResponse<Order> = await this.api.post(
        "/orders",
        orderData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Wishlist endpoints
  async getWishlist(): Promise<Wishlist[]> {
    try {
      const response: AxiosResponse<Wishlist[]> = await this.api.get(
        "/wishlist"
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addToWishlist(wishlistData: Partial<Wishlist>): Promise<Wishlist> {
    try {
      const response: AxiosResponse<Wishlist> = await this.api.post(
        "/wishlist",
        wishlistData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getWishlistByUser(userId: number): Promise<Wishlist[]> {
    const response: AxiosResponse<Wishlist[]> = await this.api.get(
      `/wishlist/user/${userId}`,
    );
    return response.data;
  }

  async removeFromWishlist(id: number): Promise<void> {
    try {
      await this.api.delete(`/wishlist/${id}`);
    } catch (error) {
      throw error;
    }
  }

  // Payment endpoints
  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    try {
      const response: AxiosResponse<Payment> = await this.api.post(
        "/payments",
        paymentData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
