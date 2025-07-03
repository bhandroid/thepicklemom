/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Type definitions for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthData {
  user: {
    _id: string;
    email: string;
    fullName?: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

interface User {
  _id: string;
  email: string;
  fullName?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<AuthData>> {
    return this.request<ApiResponse<AuthData>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, fullName?: string): Promise<ApiResponse<AuthData>> {
    return this.request<ApiResponse<AuthData>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/auth/me');
  }

  // Products endpoints
  async getProducts(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>('/products');
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/products/${id}`);
  }

  async createProduct(productData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getFeaturedProducts(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>('/products?featured=true');
  }

  async getProductsByCategory(category: string): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/products/category/${category}`);
  }

  // Orders endpoints
  async getOrders(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>('/orders');
  }

  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/orders/${id}`);
  }

  // Categories endpoint
  async getCategories(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>('/categories');
  }
}

export const api = new ApiClient(API_BASE_URL);
