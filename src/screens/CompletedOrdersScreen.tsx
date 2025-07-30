import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ApiService from '../services/api';
import { DeliveryAssignment } from '../types';

interface CompletedOrdersScreenProps {
  onGoBack: () => void;
  onSelectOrder: (order: DeliveryAssignment) => void;
}

const CompletedOrdersScreen: React.FC<CompletedOrdersScreenProps> = ({
  onGoBack,
  onSelectOrder,
}) => {
  const [completedOrders, setCompletedOrders] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    loadCompletedOrders();
  }, []);

  const loadCompletedOrders = async () => {
    try {
      setLoading(true);
      // Get completed orders from dedicated endpoint
      const response = await ApiService.getCompletedOrders();
      if (response.success && response.data) {
        setCompletedOrders(response.data);
        setOrderCount(response.data.length);
        setTotalEarnings(response.totalEarnings || 0);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load completed orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCompletedOrders();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getStatusColor = (status: string) => {
    return '#4CAF50'; // Green for completed orders
  };

  const handleReprintReceipt = async (order: DeliveryAssignment) => {
    Alert.alert(
      'Reprint Receipt',
      `Reprint receipt for Order #${order.invoice}?`,
      [
        {
          text: 'Mobile Print',
          onPress: async () => {
            try {
              const response = await ApiService.printBill(order._id, { 
                type: 'mobile',
                format: 'thermal' 
              });
              if (response.success) {
                Alert.alert('Success', 'Print request sent!');
              } else {
                Alert.alert('Error', 'Failed to print');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
        {
          text: 'PDF Receipt',
          onPress: async () => {
            try {
              const response = await ApiService.generateBill(order._id, 'pdf');
              if (response.success && response.data?.pdfUrl) {
                // Share the PDF URL
                await Share.share({
                  title: `Receipt - Order ${order.invoice}`,
                  message: `Download your receipt: ${response.data.pdfUrl}`,
                  url: response.data.pdfUrl,
                });
              } else {
                Alert.alert('Error', 'Failed to generate PDF');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: DeliveryAssignment }) => {
    const orderTotal = item.financial?.total || item.total || 0;
    const currency = item.financial?.currency || '﷼';
    
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => onSelectOrder(item)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>#{item.invoice}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || '') }]}>
              <Text style={styles.statusText}>✅ Delivered</Text>
            </View>
          </View>
          <Text style={styles.orderAmount}>{currency} {orderTotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.orderDetails}>
          <View style={styles.customerInfo}>
            <Icon name="person" size={16} color="#666" />
            <Text style={styles.customerName}>
              {item.customer?.name || item.customerName || 'Unknown Customer'}
            </Text>
          </View>
          
          <View style={styles.deliveryInfo}>
            <Icon name="access-time" size={16} color="#666" />
            <Text style={styles.deliveryTime}>
              {(item as any).deliveredAt ? formatDate((item as any).deliveredAt) : 'Recently'}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleReprintReceipt(item)}
          >
            <Icon name="print" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Reprint</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSelectOrder(item)}
          >
            <Icon name="visibility" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="assignment-turned-in" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Completed Orders</Text>
      <Text style={styles.emptySubtitle}>
        Completed deliveries will appear here
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Completed Orders</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading completed orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Orders</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orderCount}</Text>
          <Text style={styles.statLabel}>Completed Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>﷼ {totalEarnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={completedOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  orderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#666',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default CompletedOrdersScreen; 