import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../config/apiConfig';
import { 
  LoginResponse, 
  ApiResponse, 
  Driver, 
  DeliveryAssignment, 
  LocationUpdate,
  DeliveryStats,
  DailyEarnings,
  ToggleProductResponse 
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Add request interceptor to add token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh token
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              if (response.success) {
                // Update token in storage and headers
                await AsyncStorage.setItem('auth_token', response.data.token);
                this.api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                // Retry the original request
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear auth data on refresh failure
            await this.clearAuthData();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async clearAuthData() {
    await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'driver_data']);
  }

  private async refreshToken(refreshToken: string): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginForm): Promise<ApiResponse<Driver>> {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
        API_ENDPOINTS.LOGIN,
        {
          email: credentials.email?.trim(),
          password: credentials.password
        }
      );

      console.log('Login response:', { success: response.data.success });

      if (response.data.success) {
        // Store token
        await AsyncStorage.setItem('auth_token', response.data.token);
        
        // Store driver data
        const driverData = response.data.driver;
        await AsyncStorage.setItem('driver_data', JSON.stringify(driverData));
        
        // Set default auth header
        this.api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return {
          success: true,
          data: driverData,
          message: response.data.message || 'Login successful'
        };
      }
      
      return {
        success: false,
        data: null,
        message: response.data.message || 'Login failed'
      };
    } catch (error: any) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Even if logout fails on server, clear local data
    } finally {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('driverData');
    }
  }

  // Profile methods
  async getProfile(): Promise<ApiResponse<Driver>> {
    try {
      const response: AxiosResponse<ApiResponse<Driver>> = await this.api.get(API_ENDPOINTS.PROFILE);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  async updateProfile(profileData: Partial<Driver>): Promise<ApiResponse<Driver>> {
    try {
      // Note: No 'update' endpoint in mobile-delivery, this will likely fail if used.
      // This is a placeholder until a proper endpoint is defined.
      const response: AxiosResponse<ApiResponse<Driver>> = await this.api.put(API_ENDPOINTS.PROFILE, profileData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  // Shift management
  async clockIn(locationData?: any): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(API_ENDPOINTS.CLOCK_IN, locationData || {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to clock in');
    }
  }

  async clockOut(): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(API_ENDPOINTS.CLOCK_OUT);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to clock out');
    }
  }

  async breakIn(): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(API_ENDPOINTS.BREAK_IN);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to start break');
    }
  }

  async breakOut(): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(API_ENDPOINTS.BREAK_OUT);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to end break');
    }
  }

  // Location updates - This endpoint does not exist in mobile-delivery routes.
  // This will fail if called. It should be removed or implemented in the backend.
  async updateLocation(location: LocationUpdate): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/delivery-personnel/location', location);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update location');
    }
  }

  // Order management
  // Get Mobile Orders - Simplified structure for mobile app
  async getMobileOrders(): Promise<ApiResponse<DeliveryAssignment[]>> {
    try {
      const response: AxiosResponse<ApiResponse<DeliveryAssignment[]>> = await this.api.get(API_ENDPOINTS.GET_ORDERS);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  }

  async getOrderDetails(orderId: string): Promise<ApiResponse<DeliveryAssignment>> {
    try {
      const response: AxiosResponse<ApiResponse<DeliveryAssignment>> = await this.api.get(`${API_ENDPOINTS.GET_ORDER_DETAILS}/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order details');
    }
  }

  async acceptOrder(orderId: string): Promise<ApiResponse<any>> {
    try {
      console.log('🔄 API: Accepting order:', orderId);
      
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`${API_ENDPOINTS.GET_ORDERS}/${orderId}/accept`);
      
      console.log('✅ API: Order accepted:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ API: Accept order error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 409) {
        throw new Error(error.response.data?.message || 'Order is already assigned to another driver');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to accept order');
    }
  }

  // Delivery actions
  async markAsOutForDelivery(orderId: string): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`${API_ENDPOINTS.MARK_OUT_FOR_DELIVERY}/${orderId}/out-for-delivery`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark order as out for delivery');
    }
  }

  async completeDeliveryWithCode(orderId: string, verificationCode: string): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`${API_ENDPOINTS.COMPLETE_DELIVERY}/${orderId}/complete`, {
        verificationCode,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to complete delivery');
    }
  }

  async toggleProductCollection(orderId: string, productId: string, collected: boolean): Promise<ToggleProductResponse> {
    try {
      console.log('🔄 API: Toggling product collection:', {
        orderId,
        productId,
        collected,
        endpoint: `${API_ENDPOINTS.TOGGLE_PRODUCT}/${orderId}/toggle-product`
      });
      
      const response: AxiosResponse<ToggleProductResponse> = await this.api.post(
        `${API_ENDPOINTS.TOGGLE_PRODUCT}/${orderId}/toggle-product`,
        {
          productId,
          collected
        }
      );
      
      console.log('✅ API: Toggle response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ API: Toggle product error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Check if it's a network connectivity issue
      if (!error.response) {
        throw new Error('Network Error: Cannot connect to server. Please check your internet connection.');
      }
      
      // Check for specific HTTP errors
      if (error.response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.response.status === 404) {
        throw new Error('Order or product not found. Please refresh and try again.');
      }
      
      if (error.response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to toggle product status');
    }
  }

  // Earnings
  async getTodayEarnings(): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get(API_ENDPOINTS.GET_TODAY_EARNINGS);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch today earnings');
    }
  }

  async getEarnings(): Promise<ApiResponse<any>> {
    try {
      // Since there's no specific earnings endpoint, we'll use today's earnings
      // and create mock data structure for demo purposes
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get(API_ENDPOINTS.GET_TODAY_EARNINGS);
      
      // Create earnings structure expected by EarningsScreen
      const earningsData = {
        today: response.data?.data?.todayEarnings || 0,
        thisWeek: (response.data?.data?.todayEarnings || 0) * 7, // Mock weekly
        thisMonth: (response.data?.data?.todayEarnings || 0) * 30, // Mock monthly
        total: (response.data?.data?.todayEarnings || 0) * 365, // Mock total
        avgPerDelivery: 12.50,
        deliveriesCount: {
          today: response.data?.data?.todayDeliveries || 0,
          thisWeek: (response.data?.data?.todayDeliveries || 0) * 7,
          thisMonth: (response.data?.data?.todayDeliveries || 0) * 30,
          total: (response.data?.data?.todayDeliveries || 0) * 365,
        },
      };

      return {
        success: true,
        data: earningsData,
        message: 'Earnings retrieved successfully'
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch earnings');
    }
  }

  async getCompletedOrders(): Promise<ApiResponse<DeliveryAssignment[]> & { totalEarnings?: number }> {
    try {
      const response: AxiosResponse<any> = await this.api.get(API_ENDPOINTS.GET_COMPLETED_ORDERS);
      const orders = response.data?.orders || [];
      return {
        success: true,
        data: orders,
        message: response.data?.message || 'Completed orders retrieved successfully',
        totalEarnings: response.data?.totalEarnings || 0
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch completed orders');
    }
  }

  // Billing
  async generateBill(orderId: string, format: 'json' | 'pdf' = 'json'): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`${API_ENDPOINTS.GENERATE_BILL}/${orderId}/bill?format=${format}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate bill');
    }
  }

  async getOrderBill(orderId: string): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`${API_ENDPOINTS.GENERATE_BILL}/${orderId}/bill`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get order bill');
    }
  }

  async printBill(orderId: string, printerSettings?: any): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`${API_ENDPOINTS.PRINT_BILL}/${orderId}/print-bill`, {
        printerSettings: printerSettings || {}
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to print bill');
    }
  }

  // Utility methods
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  async getStoredDriverData(): Promise<Driver | null> {
    try {
      const driverData = await AsyncStorage.getItem('driverData');
      return driverData ? JSON.parse(driverData) : null;
    } catch (error) {
      console.error('Error getting stored driver data:', error);
      return null;
    }
  }

  // Payment history
  async getPaymentHistory(): Promise<ApiResponse<any[]>> {
    try {
      const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/delivery-personnel/payments');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }

  // Report delivery issue
  async reportDeliveryIssue(orderId: string, description: string): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`/mobile-delivery/orders/${orderId}/issue`, {
        description,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to report delivery issue');
    }
  }

  // Set base URL for different environments
  setBaseURL(url: string): void {
    this.api.defaults.baseURL = url;
  }

  // Enhanced Delivery Workflow Methods - Using mobile delivery endpoints
  async getOrderForDelivery(orderId: string): Promise<ApiResponse<DeliveryAssignment>> {
    try {
      const response: AxiosResponse<ApiResponse<DeliveryAssignment>> = await this.api.get(`/mobile-delivery/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order for delivery');
    }
  }

  async startOrderProcessing(orderId: string): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`/mobile-delivery/orders/${orderId}/start-processing`, {
        driverId: null
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to start order processing');
    }
  }

  async markProductCollected(orderId: string, productId: string, collected: boolean, notes?: string): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`/mobile-delivery/orders/${orderId}/toggle-product`, {
        productId,
        collected,
        notes: notes || ''
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update product collection status');
    }
  }

  // Additional missing methods used in OrderDetailsScreen
  async checkOrderAssignment(orderId: string): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/delivery-orders/${orderId}/check-assignment`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check order assignment');
    }
  }

  async regenerateProductChecklist(orderId: string): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`/delivery-orders/${orderId}/regenerate-checklist`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to regenerate product checklist');
    }
  }

  // Get assigned orders for dashboard
  async getAssignedOrders(): Promise<ApiResponse<DeliveryAssignment[]>> {
    try {
      const response: AxiosResponse<ApiResponse<DeliveryAssignment[]>> = await this.api.get(API_ENDPOINTS.GET_ORDERS);
      if (response.data.success && Array.isArray(response.data.data)) {
        // Filter only assigned orders
        const assignedOrders = response.data.data.filter((order: DeliveryAssignment) => 
          order.delivery?.isAssignedToMe === true || 
          (order.deliveryInfo?.isAssignedToMe === true)
        );
        return {
          success: true,
          data: assignedOrders,
          message: 'Assigned orders retrieved successfully'
        };
      }
      return {
        success: false,
        data: [],
        message: 'No assigned orders found'
      };
    } catch (error: any) {
      console.error('Failed to fetch assigned orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch assigned orders');
    }
  }
}

export default new ApiService(); 