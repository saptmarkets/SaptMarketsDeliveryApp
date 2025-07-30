# SaptMarkets Delivery App 🚛

A React Native mobile application for delivery drivers to manage orders, track deliveries, and monitor performance.

## 📱 Features

### ✅ Currently Implemented
- **Driver Authentication** - Secure login with JWT tokens
- **Dashboard Overview** - Real-time status, today's summary, and assigned orders
- **Shift Management** - Clock in/out functionality with duty status tracking
- **Order Management** - View assigned orders with customer details
- **Driver Profile** - Display vehicle information and contact details
- **Real-time Updates** - Refresh dashboard data with pull-to-refresh
- **Responsive UI** - Modern design with proper styling and user experience

### 🚧 Coming Soon
- **Order Details Screen** - Complete order information with product lists
- **GPS Navigation** - Integrated maps and turn-by-turn directions
- **Delivery Actions** - Mark orders as picked up, out for delivery, or delivered
- **Verification System** - Customer verification codes for secure delivery
- **Earnings Tracking** - Detailed earnings breakdown and history
- **Performance Analytics** - Delivery statistics and ratings
- **Push Notifications** - Real-time order assignments and updates
- **Photo Capture** - Delivery proof with camera integration
- **Offline Support** - Work without internet connectivity

## 🔧 Technology Stack

- **React Native 0.80** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **Axios** - HTTP client for API communication
- **AsyncStorage** - Local data persistence
- **React Hooks** - Modern React patterns

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main application screens
├── services/           # API and business logic
│   ├── api.ts         # Backend API service
│   └── locationService.ts # GPS and location handling
├── types/             # TypeScript type definitions
├── utils/             # Helper functions
└── navigation/        # App navigation setup
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- React Native CLI
- Android Studio / Xcode for device testing

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Backend URL**
   Edit `src/services/api.ts` and update the baseURL:
   ```typescript
   private baseURL: string = 'http://YOUR_BACKEND_IP:5055/api';
   ```

3. **Run on Android**
   ```bash
   npm run android
   ```

4. **Run on iOS**
   ```bash
   npm run ios
   ```

## 🔐 Test Credentials

Use these credentials to test the app:

- **Email:** `driver@saptmarkets.com`
- **Password:** `driver123`

These credentials are for the driver account created in your backend system.

## 📊 Backend Integration

The app integrates with the SaptMarkets backend delivery system:

### API Endpoints Used
- `POST /api/delivery-personnel/login` - Driver authentication
- `GET /api/delivery-personnel/profile` - Driver profile information
- `POST /api/delivery-personnel/clock-in` - Start shift
- `POST /api/delivery-personnel/clock-out` - End shift
- `PUT /api/delivery-personnel/location` - Update GPS location
- `GET /api/delivery-orders/assigned` - Get assigned orders
- `GET /api/delivery-personnel/statistics` - Performance stats
- `GET /api/delivery-personnel/earnings` - Earnings data

### Data Flow
1. **Authentication** - Driver logs in with email/password
2. **Token Storage** - JWT token stored in AsyncStorage
3. **Auto-Login** - App checks for valid token on startup
4. **Real-time Updates** - Dashboard refreshes data every pull
5. **Location Tracking** - GPS location sent to backend when on duty

## 🎨 UI Components

### Login Screen
- Clean, professional login interface
- Email and password validation
- Show/hide password toggle
- Loading states and error handling

### Dashboard Screen
- Driver status with visual indicators
- Today's summary (deliveries, earnings, rating)
- Assigned orders preview
- Quick action buttons
- Clock in/out functionality

### Design System
- **Primary Color:** `#007bff` (Blue)
- **Success Color:** `#28a745` (Green)
- **Danger Color:** `#dc3545` (Red)
- **Background:** `#f8f9fa` (Light Gray)
- **Cards:** White with subtle shadows
- **Typography:** System fonts with proper hierarchy

## 🔧 Development Notes

### Current Limitations
- Location service uses mock data for web compatibility
- Navigation between screens is basic (no React Navigation yet)
- Some features show "coming soon" alerts
- Real-time notifications not implemented

### Next Steps
1. **Add React Navigation** for proper screen navigation
2. **Implement real geolocation** using react-native-geolocation-service
3. **Add push notifications** with Firebase
4. **Create order detail screens** with full CRUD operations
5. **Implement camera functionality** for delivery proof
6. **Add offline data synchronization**
7. **Enhance error handling and retry logic**

### Code Quality
- TypeScript for type safety
- Proper error boundaries
- Consistent naming conventions
- Modular architecture
- Separation of concerns

## 📱 Screenshots

```
[Login Screen]     [Dashboard]        [Order List]
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  🚛 Logo    │   │ Hello John! │   │ Order #123  │
│             │   │ On Duty 🟢  │   │ 📍 Address  │
│ [Email]     │   │             │   │ 💰 $45.50   │
│ [Password]  │   │ Today: 3    │   │ Order #124  │
│             │   │ Deliveries  │   │ 📍 Address  │
│ [Sign In]   │   │ $67.50      │   │ 💰 $32.25   │
│             │   │             │   │ ────────────│
└─────────────┘   └─────────────┘   └─────────────┘
```

## 🤝 Contributing

This app is part of the SaptMarkets delivery system. For contributing:

1. Follow TypeScript best practices
2. Maintain consistent UI/UX patterns
3. Add proper error handling
4. Write meaningful commit messages
5. Test on both iOS and Android

## 📞 Support

For technical support or questions:
- Backend API: See `DELIVERY_API_DOCUMENTATION.md`
- System Overview: See `DELIVERY_SYSTEM_SUMMARY.md`
- Contact: support@saptmarkets.com

---

**Status:** ✅ **Ready for Development**

The delivery app foundation is complete and ready for enhanced features. The backend integration is fully functional, and the UI provides a solid foundation for building advanced delivery management features. 