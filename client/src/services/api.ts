import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  User,
  Product,
  Category,
  Cart,
  CartItem,
  Order,
  // OrderItem,
  // Review,
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
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );
    return response.data;
  }

  async register(
    userData: Partial<User> & { password: string }
  ): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/register",
      userData
    );
    return response.data;
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get("/users");
    return response.data;
  }

  async getUserProfile(userId: number): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(
      `/users/${userId}`
    );
    return response.data;
  }

  async updateUserProfile(
    userId: number,
    userData: Partial<User>
  ): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(
      `/users/${userId}`,
      userData
    );
    return response.data;
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    const response: AxiosResponse<Product[]> = await this.api.get("/products");
    return response.data;
  }

  async getProductById(id: number): Promise<Product> {
    const response: AxiosResponse<Product> = await this.api.get(
      `/products/${id}`
    );
    return response.data;
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response: AxiosResponse<Product> = await this.api.post(
      "/products",
      productData
    );
    return response.data;
  }

  async updateProduct(
    id: number,
    productData: Partial<Product>
  ): Promise<Product> {
    const response: AxiosResponse<Product> = await this.api.put(
      `/products/${id}`,
      productData
    );
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await this.api.delete(`/products/${id}`);
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<Category[]> = await this.api.get(
      "/categories"
    );
    return response.data;
  }

  async getCategoryById(id: number): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.get(
      `/categories/${id}`
    );
    return response.data;
  }

  // Cart endpoints
  async getCart(): Promise<Cart> {
    const response: AxiosResponse<Cart> = await this.api.get("/cart");
    return response.data;
  }

  async getCartItems(): Promise<CartItem[]> {
    const response: AxiosResponse<CartItem[]> = await this.api.get(
      "/cart-items"
    );
    return response.data;
  }

  async addToCart(cartItemData: Partial<CartItem>): Promise<CartItem> {
    const response: AxiosResponse<CartItem> = await this.api.post(
      "/cart-items",
      cartItemData
    );
    return response.data;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const response: AxiosResponse<CartItem> = await this.api.put(
      `/cart-items/${id}`,
      { quantity }
    );
    return response.data;
  }

  async removeFromCart(id: number): Promise<void> {
    await this.api.delete(`/cart-items/${id}`);
  }

  async clearCart(): Promise<void> {
    await this.api.delete("/cart/clear");
  }

  async getCartItemById(id: number): Promise<CartItem> {
    const response: AxiosResponse<CartItem> = await this.api.get(
      `/cart-items/${id}`
    );
    return response.data;
  }

  // Order endpoints
  async getOrders(): Promise<Order[]> {
    const response: AxiosResponse<Order[]> = await this.api.get("/orders");
    return response.data;
  }

  async getOrderById(id: number): Promise<Order> {
    const response: AxiosResponse<Order> = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const response: AxiosResponse<Order> = await this.api.post(
      "/orders",
      orderData
    );
    return response.data;
  }

  // Review endpoints
  // async getReviewsByProduct(productId: number): Promise<Review[]> {
  //   const response: AxiosResponse<Review[]> = await this.api.get(`/reviews/product/${productId}`);
  //   return response.data;
  // }

  // async addReview(reviewData: Partial<Review>): Promise<Review> {
  //   const response: AxiosResponse<Review> = await this.api.post('/reviews', reviewData);
  //   return response.data;
  // }

  // Wishlist endpoints
  async getWishlist(): Promise<Wishlist[]> {
    const response: AxiosResponse<Wishlist[]> = await this.api.get("/wishlist");
    return response.data;
  }

  async addToWishlist(wishlistData: Partial<Wishlist>): Promise<Wishlist> {
    const response: AxiosResponse<Wishlist> = await this.api.post(
      "/wishlist",
      wishlistData
    );
    return response.data;
  }

  async removeFromWishlist(id: number): Promise<void> {
    await this.api.delete(`/wishlist/${id}`);
  }

  // Payment endpoints
  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    const response: AxiosResponse<Payment> = await this.api.post(
      "/payments",
      paymentData
    );
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
