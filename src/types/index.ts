export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  address?: string;
  phone_number?: string;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  images?: string;
  description?: string;
  category_id: number;
  stock_quantity: number;
  specifications?: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_category_id?: number;
  created_at: string;
  updated_at?: string;
}

// export interface Cart {
//   id: number;
//   user_id: number;
//   created_at: string;
//   updated_at?: string;
//   items?: CartItem[];
// }

// export interface CartItem {
//   id: number;
//   cart_id: number;
//   product_id: number;
//   quantity: number;
//   created_at: string;
//   updated_at?: string;
//   product?: Product;
// }

// types/index.ts
export interface CartItem {
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
  created_at?: string;
  updated_at?: string;
}

export interface Cart {
  id: number;
  user_id: number;
  created_at: string;
  items?: CartItem[];
}

export interface Wishlist {
  id: number;
  user_id: number;
  product_id: number;
  name: string;
  price: number;
  images: string;
  description: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_total: number;
  payment_method: string;
  order_status: string;
  shipping_address?: string;
  ordered_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  user_id: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
