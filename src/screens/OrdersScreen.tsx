import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import ApiService from '../services/api';
import { DeliveryAssignment } from '../types';

interface OrdersScreenProps {
  driver: any;
  onGoBack: () => void;
  onOrderSelect: (order: DeliveryAssignment) => void;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ driver, onGoBack, onOrderSelect }) => {
  const [orders, setOrders] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      console.log('Fetching mobile orders...');
      const response = await ApiService.getMobileOrders();
      console.log('Mobile orders response:', JSON.stringify(response, null, 2));
      
      if (response.success && Array.isArray(response.data)) {
        const assignedOrders = response.data.filter(order => 
          order.delivery?.isAssignedToMe || 
          order.delivery?.requiresAcceptance
        );
        console.log(`Successfully fetched ${response.data.length} orders, ${assignedOrders.length} relevant for driver.`);
        setOrders(assignedOrders);
      } else {
        console.warn('Failed to fetch orders or no orders returned:', response.message);
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', error.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return '#f59e0b'; // Amber
      case 'Out for Delivery': return '#3b82f6'; // Blue
      case 'Delivered': return '#10b981'; // Emerald
      case 'Received': return '#22c55e'; // Green
      default: return '#6b7280'; // Gray
    }
  };

  const renderOrderItem = ({ item }: { item: DeliveryAssignment }) => {
    const delivery = (item as any).delivery || {};
    const isAssigned = delivery.isAssigned || false;
    const isAssignedToMe = delivery.isAssignedToMe || false;
    const isAssignedToOther = isAssigned && !isAssignedToMe;
    const cardStyle = isAssignedToOther ? [styles.orderCard, styles.disabledCard] : styles.orderCard;

    const renderStatus = () => {
      if (isAssignedToOther) {
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#a1a1aa' }]}>
            <Text style={styles.statusText}>
              Assigned: {delivery.assignedDriverName || 'Other'}
            </Text>
          </View>
        );
      }

      const statusText = item.status === 'Received' ? 'Ready for Pickup' : item.status;
      return (
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      );
    };

    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={() => onOrderSelect(item)}
        disabled={isAssignedToOther}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>#{item.orderNumber || item.invoice}</Text>
          {renderStatus()}
      </View>
      
      <View style={styles.orderInfo}>
        <Text style={styles.customerName}>{item.customer?.name || 'N/A'}</Text>
        <Text style={styles.customerPhone}>{item.customer?.contact || 'N/A'}</Text>
        <Text style={styles.address} numberOfLines={2}>
          {item.customer?.address || 'N/A'}, {item.customer?.city || 'N/A'}
        </Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>﷼ {item.total?.toFixed(2) || '0.00'}</Text>
        <Text style={styles.itemCount}>
            {(item as any).productCount ?? 0} items
        </Text>
      </View>
    </TouchableOpacity>
    );
  };

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No active orders found</Text>
      <Text style={styles.emptySubtext}>New orders will appear here when they are available.</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>Tap to Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ flex: 1 }} />
      ) : (
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
          keyExtractor={(item) => String(item._id || item.invoice)}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007bff"]} tintColor={"#007bff"} />
        }
          contentContainerStyle={orders.length === 0 ? styles.emptyListContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
          ListEmptyComponent={ListEmptyComponent}
      />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  placeholder: {
    width: 30,
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    backgroundColor: '#e5e7eb',
    opacity: 0.8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  itemCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 16,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrdersScreen; 