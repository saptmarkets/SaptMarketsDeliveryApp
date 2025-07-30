/**
 * SaptMarkets Delivery App
 * Full-featured delivery management app for drivers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import ApiService from './src/services/api';
import { Driver, DeliveryAssignment, LoginForm, DetailedProductItem } from './src/types';
import DashboardScreen from './src/screens/DashboardScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreenComponent from './src/screens/ProfileScreen';
import EarningsScreen from './src/screens/EarningsScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import ProductChecklistScreen from './src/screens/ProductChecklistScreen';
import CompletedOrdersScreen from './src/screens/CompletedOrdersScreen';

type Screen = 'dashboard' | 'orders' | 'profile' | 'earnings' | 'orderDetails' | 'productChecklist' | 'completedOrders';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<DeliveryAssignment | null>(null);
  const [productChecklist, setProductChecklist] = useState<DetailedProductItem[]>([]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuthenticated = await ApiService.isAuthenticated();
      console.log('Is authenticated:', isAuthenticated);
      
      if (isAuthenticated) {
        const driverData = await ApiService.getStoredDriverData();
        console.log('Stored driver data:', driverData);
        
        if (driverData) {
          setDriver(driverData);
          setIsLoggedIn(true);
        } else {
          console.log('No driver data found, clearing auth');
          await ApiService.logout(); // Clear invalid auth state
        }
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await ApiService.logout(); // Clear auth on error
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (driverData: Driver) => {
    setDriver(driverData);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      setDriver(null);
      setIsLoggedIn(false);
      setCurrentScreen('dashboard');
      setSelectedOrder(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToOrders = () => {
    setCurrentScreen('orders');
  };

  const navigateToProfile = () => {
    setCurrentScreen('profile');
  };

  const navigateToEarnings = () => {
    setCurrentScreen('earnings');
  };

  const navigateToCompletedOrders = () => {
    setCurrentScreen('completedOrders');
  };

  const navigateToOrderDetails = (order: DeliveryAssignment) => {
    setSelectedOrder(order);
    setCurrentScreen('orderDetails');
  };

  const navigateToProductChecklist = (checklist: DetailedProductItem[], orderId: string) => {
    setProductChecklist(checklist);
    if(selectedOrder) {
      setCurrentScreen('productChecklist');
    }
  };

  const navigateBack = () => {
    setCurrentScreen('dashboard');
    setSelectedOrder(null);
  };

  const handleOrderUpdated = () => {
    // Refresh data or navigate back
    setCurrentScreen('dashboard');
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      {isLoggedIn && driver ? (
        <>
          {currentScreen === 'dashboard' && (
            <DashboardScreen 
              driver={driver} 
              onLogout={handleLogout}
              onNavigateToOrders={navigateToOrders}
              onNavigateToProfile={navigateToProfile}
              onNavigateToEarnings={navigateToEarnings}
              onNavigateToOrderDetails={navigateToOrderDetails}
              onNavigateToCompletedOrders={navigateToCompletedOrders}
            />
          )}
          {currentScreen === 'orders' && (
            <OrdersScreen 
              driver={driver}
              onGoBack={navigateBack}
              onOrderSelect={navigateToOrderDetails}
            />
          )}
          {currentScreen === 'profile' && (
            <ProfileScreenComponent 
              driver={driver}
              onLogout={handleLogout}
              onGoBack={navigateBack}
            />
          )}
          {currentScreen === 'earnings' && (
            <EarningsScreen 
              driver={driver}
              onGoBack={navigateBack}
            />
          )}
          {currentScreen === 'orderDetails' && selectedOrder && (
            <OrderDetailsScreen 
              order={selectedOrder}
              onGoBack={navigateBack}
              onOrderUpdated={handleOrderUpdated}
              onNavigateToProductChecklist={navigateToProductChecklist}
            />
          )}
          {currentScreen === 'productChecklist' && selectedOrder && (
            <ProductChecklistScreen
              checklist={productChecklist}
              orderId={selectedOrder._id}
              onUpdateChecklist={setProductChecklist}
              onGoBack={() => setCurrentScreen('orderDetails')}
            />
          )}
          {currentScreen === 'completedOrders' && (
            <CompletedOrdersScreen
              onGoBack={navigateBack}
              onSelectOrder={navigateToOrderDetails}
            />
          )}
        </>
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </SafeAreaView>
  );
};

// Login Screen Component
interface LoginScreenProps {
  onLoginSuccess: (driver: Driver) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [form, setForm] = useState<LoginForm>({
    email: 'driver@saptmarkets.com', // Correct driver email
    password: 'password123', // Correct password
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.login(form);
      
      if (response.success && response.data) {
        Alert.alert('Success', 'Login successful!');
        onLoginSuccess(response.data);
      } else {
        Alert.alert('Error', response.message || 'Login failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.loginContainer}>
      <View style={styles.loginContent}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>🚛</Text>
          </View>
          <Text style={styles.appTitle}>SaptMarkets Delivery</Text>
          <Text style={styles.subtitle}>Driver Portal</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={form.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                value={form.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loginContent: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 50,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  formSection: {},
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  loginButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
