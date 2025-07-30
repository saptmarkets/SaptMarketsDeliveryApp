// User/Driver types
export interface Driver {
  _id: string;
  email: string;
  name: string | { [key: string]: string };
  phone?: string;
  address?: string;
  role: string;
  vehicleType?: string;
  licenseNumber?: string;
  deliveryInfo?: {
    isOnDuty: boolean;
    availability: 'available' | 'busy' | 'offline';
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

// Order types
export interface Order {
  _id: string;
  user: string;
  products: OrderProduct[];
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  paymentMethod: string;
  total: number;
  address: {
    street: string;
    city: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  phone: string;
  email: string;
  orderDate: Date;
  deliveryDate?: Date;
  instructions?: string;
  deliveryFee: number;
  verificationCode?: string;
}

export interface OrderProduct {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Delivery Assignment types (actual backend response format)
export interface DeliveryAssignment {
  _id: string;
  invoice?: string;
  orderNumber?: string;
  status: string;
  user?: User;
  customer?: Customer;
  customerName?: string;
  shippingAddress?: string;
  items?: OrderItem[];
  cart?: OrderItem[];
  total?: number;
  orderSummary?: OrderSummary;
  financial?: OrderFinancial;
  paymentMethod?: string;
  deliveryInfo?: DeliveryInfo;
  verificationCode?: string;
  verificationCodeUsed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Additional fields for enhanced order information
  subTotal?: number;
  shippingCost?: number;
  discount?: number;
  loyaltyDiscount?: number;
  user_info?: {
    name?: string;
    contact?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    zipCode?: string;
    deliveryLocation?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  timestamps?: {
    orderPlaced?: string;
    lastUpdated?: string;
  };
  delivery?: DeliveryInfo;
  productChecklist?: ProductChecklistItem[];
  productCount?: number;
  // Order acceptance fields
  isAssignedToMe?: boolean;
}

// Product checklist item for delivery workflow
export interface ProductChecklistItem {
  productId: string;
  _id?: string;
  title: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  totalPrice?: number;
  pricePerBaseUnit?: number;
  image?: string;
  collected: boolean;
  notes?: string;
  collectedAt?: string;
  collectedBy?: string;
  // Multi-unit information
  unitName?: string;
  packQty?: number;
  originalPrice?: number;
  description?: string;
  sku?: string;
  barcode?: string;
  arabicTitle?: string;
  images?: string[];
  attributes?: any;
  weight?: number;
  dimensions?: any;
  unitId?: string;
  selectedUnitId?: string;
  unitType?: string;
  unitValue?: number;
  costPrice?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  tags?: string[];
  bulkPricing?: Array<{
    minQuantity: number;
    price: number;
  }>;
  isComboItem?: boolean;
  parentComboId?: string;
  parentComboTitle?: string;
  unitCalculation?: string;
  // New fields for order acceptance workflow
  isAssigned?: boolean;
  isAssignedToMe?: boolean;
  requiresAcceptance?: boolean;
  assignedDriverId?: string;
  assignedDriverName?: string;
  deliveryProof?: {
    recipientName?: string;
    recipientSignature?: string;
    deliveryPhoto?: string;
    notes?: string;
  };
  deliveryAttempts?: Array<{
    attemptedAt: string;
    reason: string;
    notes?: string;
  }>;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
  };
}

// Legacy interface for backward compatibility
export interface DeliveryAssignmentLegacy {
  _id: string;
  orderId: string;
  driverId: string;
  assignedAt: Date;
  status: 'assigned' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'failed' | 'cancelled';
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  pickupTime?: Date;
  outForDeliveryTime?: Date;
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  orderDetails: {
    products: OrderProduct[];
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    specialInstructions?: string;
  };
  deliveryProof?: {
    signature?: string;
    photo?: string;
    verificationCode?: string;
    timestamp: Date;
  };
  failureReason?: string;
  distance?: number;
  earnings?: number;
}

// API Response types
export interface LoginResponse {
  success: true;
  message: string;
  driver: Driver;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  debug?: any;
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

// Statistics types
export interface DeliveryStats {
  totalDeliveries: number;
  completedToday: number;
  averageRating: number;
  successRate: number;
  averageDeliveryTime: number;
  totalEarnings: number;
  earningsToday: number;
}

// Earnings types
export interface EarningsBreakdown {
  baseAmount: number;
  tips: number;
  bonuses: number;
  total: number;
  date: Date;
}

export interface DailyEarnings {
  date: string;
  deliveries: number;
  earnings: number;
  hours: number;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  OrderDetails: { order: DeliveryAssignment };
  ProductChecklist: { 
    checklist: DetailedProductItem[];
    orderId: string;
    onUpdateChecklist: (updatedChecklist: DetailedProductItem[]) => void;
  };
  Profile: undefined;
  Statistics: undefined;
  Earnings: undefined;
};

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'blocked' | 'unavailable';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Customer {
  _id?: string;
  name: string;
  email?: string;
  contact?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  deliveryLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface OrderFinancial {
  subTotal: number;
  shippingCost?: number;
  discount?: number;
  loyaltyDiscount?: number;
  total: number;
  paymentMethod: string;
  needsPaymentCollection?: boolean;
  // Additional financial details for driver
  amountToCollect?: number;
  currency?: string;
  taxAmount?: number;
  serviceCharge?: number;
  promoDiscount?: number;
  couponDiscount?: number;
  // Breakdown for transparency
  breakdown?: {
    itemsTotal: number;
    delivery: number;
    discount: number;
    tax: number;
    service: number;
    finalTotal: number;
  };
}

export interface OrderSummary {
  total: number;
  paymentMethod: string;
  subTotal?: number;
  shippingCost?: number;
  discount?: number;
  loyaltyDiscount?: number;
}

export interface DeliveryInfo {
  assignedDriver?: string;
  assignedAt?: string;
  productChecklist?: ProductChecklistItem[];
  allItemsCollected?: boolean;
  collectionCompletedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  deliveryNotes?: string;
  verificationCode?: string;
  verificationCodeUsed?: boolean;
  estimatedDistance?: string;
  // New fields for order acceptance workflow
  isAssignedToMe?: boolean;
  requiresAcceptance?: boolean;
  assignedDriverId?: string;
  assignedDriverName?: string;
  deliveryProof?: {
    recipientName?: string;
    recipientSignature?: string;
    deliveryPhoto?: string;
    notes?: string;
  };
  deliveryAttempts?: Array<{
    attemptedAt: string;
    reason: string;
    notes?: string;
  }>;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
  };
}

export interface OrderItem {
  id: string;
  productId?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  barcode?: string;
  // Multi-unit information for order items
  unitName?: string;
  packQty?: number;
  originalPrice?: number;
  description?: string;
  arabicTitle?: string;
  images?: string[];
  attributes?: any;
  weight?: number;
  dimensions?: any;
  unitId?: string;
  selectedUnitId?: string;
  unitType?: string;
  unitValue?: number;
  unit?: {
    _id: string;
    name: string;
    shortCode: string;
    type: string;
    packValue?: number;
  };
  total?: number;
  // Combo product information
  isCombo?: boolean;
  comboDetails?: {
    productBreakdown?: Array<{
      productId: string;
      productTitle: string;
      title: string;
      quantity: number;
      image?: string;
    }>;
  };
}

export interface OrderListResponse {
  success: boolean;
  data: DeliveryAssignment[];
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface OrderDetailsResponse {
  success: boolean;
  data?: DeliveryAssignment;
  message?: string;
  error?: string;
}

export interface ToggleProductResponse {
  success: boolean;
  message: string;
  productChecklist?: ProductChecklistItem[];
  allItemsCollected?: boolean;
  collectionCompletedAt?: string;
}

export interface ChecklistRegenerateResponse {
  success: boolean;
  message: string;
  productChecklist: ProductChecklistItem[];
  checklistLength: number;
  orderInvoice?: string;
  debug?: any;
}

export interface OrderAssignmentCheckResponse {
  success?: boolean;
  data?: {
    orderId: string;
    invoice: string;
    status: string;
    assignedDriver: string;
    currentDriver: string;
    isAssignedToCurrentDriver: boolean;
    hasCart: boolean;
    cartItemCount: number;
    hasProductChecklist: boolean;
    checklistItemCount: number;
  };
  message?: string;
  error?: string;
}

export interface DetailedProductItem extends ProductChecklistItem {
  // This can be extended in the future if the detailed view needs more properties
  // than the standard checklist item. For now, it inherits everything.
} 