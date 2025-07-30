import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from 'react-native';

import ApiService from '../services/api';
import LocationService from '../services/locationService';
import { Driver, DeliveryAssignment, Location } from '../types';

// Helper function to safely extract driver name
const getDriverName = (driver: Driver): string => {
  if (typeof driver.name === 'string') {
    return driver.name;
  } else if (typeof driver.name === 'object' && driver.name) {
    // Try to get English name first, then any available name
    return driver.name.en || driver.name.english || Object.values(driver.name)[0] || 'Driver';
  }
  return 'Driver';
};

interface DashboardScreenProps {
  driver: Driver;
  onNavigateToOrders: () => void;
  onNavigateToProfile: () => void;
  onNavigateToEarnings: () => void;
  onNavigateToOrderDetails: (order: DeliveryAssignment) => void;
  onNavigateToCompletedOrders: () => void;
  onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  driver,
  onNavigateToOrders,
  onNavigateToProfile,
  onNavigateToEarnings,
  onNavigateToOrderDetails,
  onNavigateToCompletedOrders,
  onLogout,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [driverData, setDriverData] = useState<Driver>(driver);
  const [todayStats, setTodayStats] = useState({
    deliveries: 0,
    earnings: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Only manage location tracking if duty status changes
    if (isOnDuty) {
      LocationService.startLocationTracking();
    } else {
      LocationService.stopLocationTracking();
    }

    return () => {
      LocationService.stopLocationTracking();
    };
  }, [isOnDuty]);

  const loadDashboardData = async () => {
    setRefreshing(true);
    
    // Fetch profile and duty status first, as it's critical for UI state
    try {
      const profileResponse = await ApiService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        const newDriverData = profileResponse.data;
        console.log('📱 Dashboard: Profile response received:', JSON.stringify(newDriverData.deliveryInfo, null, 2));
        setIsOnDuty(newDriverData.deliveryInfo?.isOnDuty || false);
        if (newDriverData.deliveryInfo?.currentLocation) {
          setCurrentLocation(newDriverData.deliveryInfo.currentLocation);
        }
        // Update the driver state with the latest data
        setDriverData(newDriverData);
        // Also update the original driver prop for compatibility
        Object.assign(driver, newDriverData);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
      Alert.alert('Error', 'Failed to load your profile. Please try again.');
    }

    // Fetch assigned orders
    try {
      const ordersResponse = await ApiService.getMobileOrders();
      if (ordersResponse.success && ordersResponse.data) {
        // Show all available orders on dashboard (both assigned and unassigned)
        // This allows drivers to see new orders they can accept
        setAssignments(ordersResponse.data);
      } else {
        setAssignments([]);
      }
      } catch (error) {
      console.error('Failed to load assigned orders:', error);
      setAssignments([]); // Clear assignments on error
      }

    // Fetch today's earnings
    try {
      const earningsResponse = await ApiService.getTodayEarnings();
      if (earningsResponse.success) {
        setTodayStats(prev => ({
          ...prev,
          earnings: earningsResponse.data?.todayEarnings || 0,
          deliveries: earningsResponse.data?.todayDeliveries || 0
        }));
      }
    } catch (error) {
      console.error('Failed to load earnings data:', error);
      setTodayStats(prev => ({ ...prev, earnings: 0, deliveries: 0 }));
    }
    
    setRefreshing(false);
  };

  const handleClockInOut = async () => {
    try {
      if (isOnDuty) {
        // Clock out
        const response = await ApiService.clockOut();
        if (response.success) {
          setIsOnDuty(false);
          // Location tracking will be stopped by useEffect
          Alert.alert('Success', 'You have clocked out successfully');
          // Reload dashboard to get updated status
          loadDashboardData();
        }
      } else {
        // Check location permission first
        const hasLocationPermission = await LocationService.requestLocationPermission();
        if (!hasLocationPermission) {
          Alert.alert('Location Required', 'Please enable location services to clock in');
          return;
        }

        // Get current location for clock-in
        let locationData = {};
        try {
          const location = await LocationService.getCurrentLocation();
          locationData = {
            latitude: location.latitude,
            longitude: location.longitude
          };
        } catch (error) {
          console.log('Location error during clock-in:', error);
        }

        // Clock in with location
        const response = await ApiService.clockIn(locationData);
        if (response.success) {
          setIsOnDuty(true);
          // Location tracking will be started by useEffect
          Alert.alert('Success', 'You have clocked in successfully');
          // Reload dashboard to get updated status
          loadDashboardData();
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update duty status');
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      await ApiService.clockOut();
      setIsOnDuty(false);
      Alert.alert('Success', 'Clocked out successfully');
      loadDashboardData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBreakIn = async () => {
    try {
      setLoading(true);
      console.log('📱 Dashboard: Starting break...');
      const response = await ApiService.breakIn();
      console.log('📱 Dashboard: Break response:', response);
      Alert.alert('Success', 'Break started successfully');
      await loadDashboardData(); // Add await to ensure profile is reloaded
    } catch (error: any) {
      console.error('📱 Dashboard: Break error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBreakOut = async () => {
    try {
      setLoading(true);
      console.log('📱 Dashboard: Ending break...');
      const response = await ApiService.breakOut();
      console.log('📱 Dashboard: Break out response:', response);
      Alert.alert('Success', response.message || 'Break ended successfully');
      await loadDashboardData(); // Add await to ensure profile is reloaded
    } catch (error: any) {
      console.error('📱 Dashboard: Break out error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              LocationService.stopLocationTracking();
              await ApiService.logout();
              onLogout();
            } catch (error) {
              console.error('Logout error:', error);
              onLogout(); // Still logout on error
            }
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (!isOnDuty) return '#6c757d';
    if (driverData.deliveryInfo?.isOnBreak) return '#ffc107';
    return driverData.deliveryInfo?.availability === 'available' ? '#28a745' : '#ffc107';
  };

  const getStatusText = () => {
    if (!isOnDuty) return 'Off Duty';
    if (driverData.deliveryInfo?.isOnBreak) return 'On Break';
    return driverData.deliveryInfo?.availability === 'available' ? 'Available' : 'Busy';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEarnings = (amount: number) => {
    return `﷼ ${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {getDriverName(driverData)}!</Text>
          <Text style={styles.date}>{new Date().toDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadDashboardData} />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.dutyButton,
                isOnDuty ? styles.dutyButtonOn : styles.dutyButtonOff,
              ]}
              onPress={handleClockInOut}
            >
              <Text style={styles.dutyButtonText}>
                {isOnDuty ? 'Clock Out' : 'Clock In'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Break Management - Only show when on duty */}
          {isOnDuty && (
            <View style={styles.breakControls}>
              {driverData.deliveryInfo?.isOnBreak ? (
                <TouchableOpacity
                  style={[styles.breakButton, styles.breakButtonActive]}
                  onPress={handleBreakOut}
                  disabled={loading}
                >
                  <Text style={styles.breakButtonText}>🔴 End Break</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.breakButton, styles.breakButtonInactive]}
                  onPress={handleBreakIn}
                  disabled={loading}
                >
                  <Text style={styles.breakButtonText}>⏸️ Take Break</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {isOnDuty && (
            <View style={styles.workingHours}>
              <Text style={styles.workingHoursText}>
                Status: On Duty {driverData.deliveryInfo?.shiftStartTime ? 
                  `since ${formatTime(new Date(driverData.deliveryInfo.shiftStartTime))}` : ''}
              </Text>
              {currentLocation && (
                <Text style={styles.locationText}>
                  📍 Lat: {currentLocation.latitude?.toFixed(4)}, Lng: {currentLocation.longitude?.toFixed(4)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Today's Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Today's Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todayStats.deliveries}</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatEarnings(todayStats.earnings)}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5.0</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Assigned Orders */}
        <View style={styles.assignmentList}>
          <Text style={styles.sectionTitle}>Current Assignments</Text>
          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <TouchableOpacity 
                key={assignment._id} 
                onPress={() => onNavigateToOrderDetails(assignment)}
              >
                <View style={styles.assignmentCard}>
                  <View style={styles.assignmentHeader}>
                    <Text style={styles.assignmentId}>
                      Order #{assignment.invoice}
                    </Text>
                    <Text style={[
                      styles.assignmentStatus,
                      {
                        color: getOrderStatusColor(assignment.status),
                        backgroundColor: `${getOrderStatusColor(assignment.status)}20`,
                      }
                    ]}>
                      {assignment.status}
                    </Text>
                  </View>
                  <View style={styles.assignmentBody}>
                    <Text style={styles.assignmentAddress}>
                      {assignment.shippingAddress?.address || 'No address provided'}
                      {assignment.shippingAddress?.city ? `, ${assignment.shippingAddress.city}` : ''}
                  </Text>
                    <Text style={styles.assignmentTime}>
                      Due by: {formatTime(new Date(assignment.deliveryInfo?.expectedDeliveryTime || assignment.createdAt))}
                    </Text>
                  </View>
                  <View style={styles.assignmentFooter}>
                    <Text style={styles.assignmentTotal}>
                      {formatEarnings(assignment.total)}
                    </Text>
                    <View style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>View Details</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No active assignments.</Text>
          )}
        </View>

        {/* Navigation Grid */}
        <View style={styles.navGrid}>
          <TouchableOpacity style={styles.navButton} onPress={onNavigateToOrders}>
            <Text style={styles.navIcon}>📦</Text>
            <Text style={styles.navText}>View Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={onNavigateToCompletedOrders}>
            <Text style={styles.navIcon}>✅</Text>
            <Text style={styles.navText}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={onNavigateToEarnings}>
            <Text style={styles.navIcon}>💰</Text>
            <Text style={styles.navText}>Earnings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={onNavigateToProfile}>
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getOrderStatusColor = (status: any): string => {
  const statusStr = typeof status === 'string' ? status : '';
  switch (statusStr) {
    case 'Pending': return '#6c757d';
    case 'Processing': return '#007bff';
    case 'Out for Delivery': return '#fd7e14';
    case 'Delivered': return '#28a745';
    case 'Cancel': return '#dc3545';
    // Legacy status support
    case 'assigned': return '#007bff';
    case 'picked_up': return '#ffc107';
    case 'out_for_delivery': return '#fd7e14';
    case 'delivered': return '#28a745';
    case 'failed': return '#dc3545';
    default: return '#6c757d';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#dc3545',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dutyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 1,
  },
  dutyButtonOn: {
    backgroundColor: '#dc3545',
  },
  dutyButtonOff: {
    backgroundColor: '#28a745',
  },
  dutyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  workingHours: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  workingHoursText: {
    fontSize: 14,
    color: '#666',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  assignmentList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  assignmentCard: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  assignmentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  assignmentBody: {
    marginBottom: 8,
  },
  assignmentAddress: {
    fontSize: 14,
    color: '#666',
  },
  assignmentTime: {
    fontSize: 12,
    color: '#666',
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentTotal: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  viewButton: {
    padding: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  navIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  navText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  breakControls: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakButton: {
    padding: 12,
    borderRadius: 20,
    elevation: 1,
  },
  breakButtonActive: {
    backgroundColor: '#dc3545',
  },
  breakButtonInactive: {
    backgroundColor: '#28a745',
  },
  breakButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DashboardScreen; 