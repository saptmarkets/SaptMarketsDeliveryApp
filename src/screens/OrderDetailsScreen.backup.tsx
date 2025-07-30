import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Linking,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import ApiService from '../services/api';
import { DeliveryAssignment, ProductChecklistItem } from '../types';
import LocationService from '../services/locationService';

interface OrderDetailsScreenProps {
  order: DeliveryAssignment;
  onGoBack: () => void;
  onOrderUpdated: () => void;
}

const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({ 
  order: initialOrder, 
  onGoBack, 
  onOrderUpdated 
}) => {
  const [order, setOrder] = useState<DeliveryAssignment>(initialOrder);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  
  // Safe fallback for product checklist
  const [productChecklist, setProductChecklist] = useState<ProductChecklistItem[]>(
    order.cart?.map(item => ({
      productId: item._id || item.productId || '',
      title: item.title || 'Unknown Product',
      quantity: item.quantity || 1,
      image: item.image || '',
      collected: false,
      notes: ''
    })) || []
  );

  useEffect(() => {
    loadOrderDetails();
  }, []);

  const loadOrderDetails = async () => {
    try {
      setRefreshing(true);
      const response = await ApiService.getOrderDetails(order._id);
      if (response.success && response.data) {
        setOrder(response.data);
        // Update product checklist with safe fallbacks
        if (response.data.cart && Array.isArray(response.data.cart)) {
          setProductChecklist(response.data.cart.map(item => ({
            productId: item._id || item.productId || '',
            title: item.title || 'Unknown Product',
            quantity: item.quantity || 1,
            image: item.image || '',
            collected: false,
            notes: ''
          })));
        }
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'pending': return '#fbbf24';
      case 'processing': return '#3b82f6';
      case 'out for delivery': return '#f59e0b';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleStartProcessing = async () => {
    if (!order._id) {
      Alert.alert('Error', 'Order ID is missing');
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.startOrderProcessing(order._id);
      if (response.success) {
        Alert.alert('Success', 'Order processing started');
        await loadOrderDetails();
        onOrderUpdated();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start processing');
    } finally {
      setLoading(false);
    }
  };

  const handleProductToggle = async (productId: string, collected: boolean) => {
    if (!order._id || !productId) return;

    try {
      const response = await ApiService.markProductCollected(order._id, productId, collected);
      if (response.success) {
        setProductChecklist(prev => prev.map(item => 
          item.productId === productId ? { ...item, collected } : item
        ));
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update product status');
    }
  };

  const handleMarkOutForDelivery = async () => {
    if (!order._id) {
      Alert.alert('Error', 'Order ID is missing');
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.markAsPickedUp(order._id);
      if (response.success) {
        Alert.alert('Success', 'Order marked as out for delivery');
        await loadOrderDetails();
        onOrderUpdated();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark as out for delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDelivery = () => {
    setVerificationModalVisible(true);
  };

  const submitDeliveryCompletion = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code provided by the customer');
      return;
    }

    if (!order._id) {
      Alert.alert('Error', 'Order ID is missing');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.completeDeliveryWithCode(order._id, verificationCode);
      if (response.success) {
        setVerificationModalVisible(false);
        setVerificationCode('');
        Alert.alert('Success', 'Order delivered successfully!');
        await loadOrderDetails();
        onOrderUpdated();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleReportIssue = () => {
    setIssueModalVisible(true);
  };

  const submitIssueReport = async () => {
    if (!issueDescription.trim()) {
      Alert.alert('Error', 'Please describe the issue');
      return;
    }

    if (!order._id) {
      Alert.alert('Error', 'Order ID is missing');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.reportDeliveryIssue(order._id, issueDescription);
      if (response.success) {
        setIssueModalVisible(false);
        setIssueDescription('');
        Alert.alert('Success', 'Issue reported successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  const openNavigation = () => {
    const destinationLat = 23.8103; // Mock coordinates - replace with actual customer location
    const destinationLng = 90.4125;
    LocationService.openMapsWithDirections(destinationLat, destinationLng);
  };

  const callCustomer = () => {
    const phoneNumber = order.customer?.contact || order.customer?.phone || '';
    if (phoneNumber) {
      Alert.alert('Call Customer', `Would you like to call ${phoneNumber}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Would open phone dialer') }
      ]);
    } else {
      Alert.alert('Error', 'Customer phone number not available');
    }
  };

  const getCollectedCount = () => {
    return productChecklist.filter(item => item.collected).length;
  };

  const getTotalCount = () => {
    return productChecklist.length;
  };

  const getProgressPercentage = () => {
    const total = getTotalCount();
    if (total === 0) return 0;
    return Math.round((getCollectedCount() / total) * 100);
  };

  const canProceedToDelivery = () => {
    return order.status === 'Processing' && getCollectedCount() === getTotalCount() && getTotalCount() > 0;
  };

  const renderActionButton = () => {
    const status = order.status || '';
    
    switch (status) {
      case 'Pending':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
            onPress={handleStartProcessing}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>
              {loading ? 'Processing...' : 'Start Processing'}
            </Text>
          </TouchableOpacity>
        );

      case 'Processing':
        return (
          <TouchableOpacity
            style={[
              styles.actionButton, 
              { backgroundColor: canProceedToDelivery() ? '#10b981' : '#9ca3af' }
            ]}
            onPress={handleMarkOutForDelivery}
            disabled={loading || !canProceedToDelivery()}
          >
            <Text style={styles.actionButtonText}>
              {loading ? 'Processing...' : 'Mark as Out for Delivery'}
            </Text>
          </TouchableOpacity>
        );

      case 'Out for Delivery':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#22c55e' }]}
            onPress={handleCompleteDelivery}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>
              {loading ? 'Processing...' : 'Complete Delivery'}
            </Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  // Safe data extraction with fallbacks
  const orderNumber = order.invoice || order._id?.slice(-6) || 'N/A';
  const orderStatus = order.status || 'Unknown';
  const orderTotal = order.orderSummary?.total || order.total || 0;
  const paymentMethod = order.paymentMethod || 'Unknown';
  const customerName = order.customer?.name || order.customerName || 'Unknown Customer';
  const customerPhone = order.customer?.contact || order.customer?.phone || 'N/A';
  const customerAddress = order.customer?.address || order.shippingAddress || 'Address not available';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity style={styles.reportButton} onPress={handleReportIssue}>
          <Text style={styles.reportButtonText}>Report Issue</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadOrderDetails} />
        }
      >
        {/* Order Info Card */}
        <View style={styles.card}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #{orderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderStatus) }]}>
                <Text style={styles.statusText}>{orderStatus}</Text>
              </View>
            </View>
            <View style={styles.orderAmount}>
              <Text style={styles.amountText}>${orderTotal.toFixed(2)}</Text>
              <Text style={styles.paymentMethod}>{paymentMethod.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Customer Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Information</Text>
          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <TouchableOpacity onPress={callCustomer}>
                <Text style={[styles.infoValue, styles.phoneLink]}>{customerPhone}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{customerAddress}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.navigationButton} onPress={openNavigation}>
            <Text style={styles.navigationButtonText}>🗺️ Open Navigation</Text>
          </TouchableOpacity>
        </View>

        {/* Product Checklist Card (for Processing status) */}
        {orderStatus === 'Processing' && (
          <View style={styles.card}>
            <View style={styles.checklistHeader}>
              <Text style={styles.cardTitle}>Product Checklist</Text>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {getCollectedCount()}/{getTotalCount()} collected
                </Text>
                <Text style={styles.progressPercentage}>({getProgressPercentage()}%)</Text>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: getProgressPercentage() === 100 ? '#22c55e' : '#3b82f6'
                  }
                ]} 
              />
            </View>

            {productChecklist.map((item, index) => (
              <View key={item.productId || index} style={styles.checklistItem}>
                <View style={styles.productInfo}>
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                  )}
                  <View style={styles.productDetails}>
                    <Text style={styles.productTitle}>{item.title}</Text>
                    <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.collectButton,
                    item.collected ? styles.collectButtonActive : styles.collectButtonInactive
                  ]}
                  onPress={() => handleProductToggle(item.productId, !item.collected)}
                  disabled={loading}
                >
                  <Text style={[
                    styles.collectButtonText,
                    item.collected ? styles.collectButtonTextActive : styles.collectButtonTextInactive
                  ]}>
                    {item.collected ? '✓ Collected' : 'Collect'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {getTotalCount() === 0 && (
              <View style={styles.emptyChecklist}>
                <Text style={styles.emptyChecklistText}>No products to collect</Text>
              </View>
            )}
          </View>
        )}

        {/* Delivery Instructions (for Out for Delivery status) */}
        {orderStatus === 'Out for Delivery' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Instructions</Text>
            <View style={styles.instructionsList}>
              <Text style={styles.instruction}>✓ Verify customer identity</Text>
              <Text style={styles.instruction}>✓ Confirm delivery address</Text>
              <Text style={styles.instruction}>✓ Check order items</Text>
              {paymentMethod.toLowerCase() === 'cod' && (
                <Text style={styles.instruction}>💰 Collect payment (COD)</Text>
              )}
              <Text style={styles.instruction}>🔐 Get verification code from customer</Text>
            </View>
            
            {order.verificationCode && (
              <View style={styles.verificationInfo}>
                <Text style={styles.verificationText}>
                  🔐 Customer has a verification code for delivery completion
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        {renderActionButton()}
      </ScrollView>

      {/* Verification Code Modal */}
      <Modal
        visible={verificationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVerificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Verification Code</Text>
            <Text style={styles.modalDescription}>
              Ask the customer for their verification code to complete the delivery
            </Text>
            <TextInput
              style={styles.codeInput}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Enter code here"
              autoCapitalize="characters"
              maxLength={10}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setVerificationModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={submitDeliveryCompletion}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Verifying...' : 'Complete Delivery'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Issue Report Modal */}
      <Modal
        visible={issueModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIssueModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Issue</Text>
            <Text style={styles.modalDescription}>
              Describe any issues with this delivery
            </Text>
            <TextInput
              style={[styles.codeInput, { height: 100 }]}
              value={issueDescription}
              onChangeText={setIssueDescription}
              placeholder="Describe the issue..."
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIssueModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={submitIssueReport}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Reporting...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  reportButton: {
    padding: 8,
  },
  reportButtonText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  customerInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  phoneLink: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  navigationButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navigationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressInfo: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  productQuantity: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  collectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  collectButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  collectButtonInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  collectButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  collectButtonTextActive: {
    color: '#ffffff',
  },
  collectButtonTextInactive: {
    color: '#6b7280',
  },
  emptyChecklist: {
    padding: 20,
    alignItems: 'center',
  },
  emptyChecklistText: {
    fontSize: 14,
    color: '#6b7280',
  },
  instructionsList: {
    marginBottom: 16,
  },
  instruction: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 8,
    paddingLeft: 8,
  },
  verificationInfo: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  verificationText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#f9fafb',
  },
  issueInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrderDetailsScreen;