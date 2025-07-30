export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  stats?: {
    deliveriesCount: number;
    totalEarnings: number;
    averagePerDelivery: number;
  };
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface Driver {
  _id: string;
  name: string | { [key: string]: string };
  email: string;
  phone: string;
  deliveryInfo?: {
    isOnDuty: boolean;
    availability: 'available' | 'busy';
    currentLocation?: Location;
    shiftStartTime?: string;
    assignedDriver?: string;
    clockInTime?: string;
    clockOutTime?: string;
    isOnBreak?: boolean;
    breakStartTime?: string;
    breakEndTime?: string;
    breakHistory?: Array<{
      startTime: string;
      endTime: string;
      duration: number;
    }>;
  };
}

export interface DeliveryAssignment {
  _id: string;
  invoice: string;
  status: string;
  total: number;
  items: any[];
  createdAt: string;
  shippingAddress: {
    address: string;
    city?: string;
  };
  deliveryInfo: {
    address: string;
    assignedDriver?: string;
    deliveredAt?: string;
    expectedDeliveryTime?: string;
  };
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface DeliveryStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  rating: number;
}

export interface DailyEarnings {
  amount: number;
  deliveries: number;
  date: string;
}

export interface ToggleProductResponse {
  success: boolean;
  message: string;
  data?: {
    collected: boolean;
    collectedCount: number;
    totalCount: number;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
} 