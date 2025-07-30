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
  Dimensions,
  FlatList,
  ActivityIndicator,
  Share,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ApiService from '../services/api';
import { 
  DeliveryAssignment, 
  ProductChecklistItem,
  DetailedProductItem,
  Customer,
  OrderFinancial,
  OrderSummary,
  DeliveryInfo,
  OrderItem,
  User,
} from '../types';

interface OrderDetailsScreenProps {
  order: DeliveryAssignment;
  onGoBack: () => void;
  onOrderUpdated: () => void;
  onNavigateToProductChecklist: (checklist: DetailedProductItem[], orderId: string) => void;
}

// Simplified Icon Component with emoji fallback
const DisplayIcon: React.FC<{
  emoji: string;
  size: number;
  color?: string;
}> = ({ emoji, size, color }) => {
  return (
    <Text style={{ fontSize: size, textAlign: 'center', color: color || '#6b7280' }}>
      {emoji}
    </Text>
  );
};

const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({ 
  order: initialOrder, 
  onGoBack, 
  onOrderUpdated,
  onNavigateToProductChecklist,
}) => {
  const [order, setOrder] = useState<DeliveryAssignment>(initialOrder);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingOrder, setAcceptingOrder] = useState(false);
  const [isOrderAssignedToMe, setIsOrderAssignedToMe] = useState(false);
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [billPrintModalVisible, setBillPrintModalVisible] = useState(false);
  const [billData, setBillData] = useState<any>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [recipientName, setRecipientName] = useState('');
  
  // Product checklist state
  const [productChecklist, setProductChecklist] = useState<DetailedProductItem[]>([]);
  const [collectionProgress, setCollectionProgress] = useState(0);
  
  // Product detail modal state
  const [productDetailVisible, setProductDetailVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DetailedProductItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageZoomVisible, setImageZoomVisible] = useState(false);

  // Safe data extraction
  const orderNumber = order.invoice || order._id?.slice(-6) || 'N/A';
  const orderStatus = order.status || 'Unknown';
  const orderTotal = order.financial?.total || order.orderSummary?.total || order.total || 0;
  const paymentMethod = order.financial?.paymentMethod || order.orderSummary?.paymentMethod || order.paymentMethod || 'Unknown';
  const customerName = order.customer?.name || order.customerName || 'Unknown Customer';
  const customerPhone = order.customer?.phone || order.customer?.contact || order.user?.phone || 'N/A';
  const customerAddress = order.customer?.address || order.shippingAddress || 'Address not available';

  useEffect(() => {
    // This effect runs when the component mounts and when the initialOrder prop changes.
    // It ensures that when a new order is selected, the state is updated and details are fetched.
    setOrder(initialOrder);
    if (initialOrder?._id) {
      loadOrderDetails(initialOrder._id);
    }
  }, [initialOrder]);

  useEffect(() => {
    // This effect is dedicated to calculating the collection progress.
    // It runs whenever the productChecklist state is updated.
    if (productChecklist.length > 0) {
      const collectedCount = productChecklist.filter(p => p.collected).length;
      setCollectionProgress((collectedCount / productChecklist.length) * 100);
    } else {
      setCollectionProgress(0);
    }
  }, [productChecklist]);

  const loadOrderDetails = async (orderId: string) => {
    if (!orderId) {
      console.log('No order ID provided to loadOrderDetails');
      return;
    }
    try {
      setRefreshing(true);
      
      const response = await ApiService.getOrderDetails(orderId);
      console.log('📱 Mobile Order Details Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        // Directly set the order to the fetched data to ensure freshness
        setOrder(response.data);
        
        const checklist = processChecklist(response.data);
        setProductChecklist(checklist);
        
        // Set other details from mobile API structure
        setDeliveryNotes(response.data.delivery?.deliveryNotes || '');
        setRecipientName(response.data.customer?.name || '');
        
        // Check if order is assigned to current driver
        checkOrderAssignment(response.data);
      }
    } catch (error) {
      console.error('❌ Failed to load order details:', error);
      Alert.alert('Error', 'Failed to load order details. Please check your connection and try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const checkOrderAssignment = (orderData: DeliveryAssignment) => {
    // Check if order is assigned to current driver based on API response
    const isAssigned = orderData.delivery?.isAssignedToMe === true;
    
    console.log('🔍 Checking order assignment:', {
      orderId: orderData._id,
      isAssignedToMe: isAssigned,
      requiresAcceptance: orderData.delivery?.requiresAcceptance,
      deliveryInfo: orderData.deliveryInfo,
      rawIsAssignedToMe: orderData.delivery?.isAssignedToMe
    });
    
    setIsOrderAssignedToMe(isAssigned);
  };

  const handleAcceptOrder = async () => {
    try {
      // Check if order can be accepted based on status
      if (['Delivered', 'Completed', 'Cancelled'].includes(order.status)) {
        Alert.alert(
          'Cannot Accept Order',
          `This order cannot be accepted because it is in '${order.status}' status.`
        );
        return;
      }

      setAcceptingOrder(true);
      
      console.log('🔄 Accepting order:', order._id);
      const response = await ApiService.acceptOrder(order._id);
      
      if (response.success) {
        if (response.data?.alreadyAssigned) {
          // Order is already assigned to this driver, just refresh order details
          await loadOrderDetails(order._id);
          Alert.alert('Order Already Assigned', 'This order is already assigned to you.');
          return;
        }
        console.log('✅ Order accepted successfully:', response.data);
        
        // Show success message
        Alert.alert(
          'Order Accepted!', 
          `Order #${order.invoice || order._id?.slice(-6)} has been assigned to you. Status updated to Processing.`,
          [{ text: 'OK', onPress: () => {
            // Refresh the order details
            loadOrderDetails(order._id);
          }}]
        );
        
        // Update local state immediately
        setIsOrderAssignedToMe(true);
        setOrder(prev => ({
          ...prev,
          status: 'Processing',
          delivery: {
            ...prev.delivery,
            isAssignedToMe: true,
            requiresAcceptance: false
          }
        }));
        
        // Call parent callback to refresh data
        onOrderUpdated();
        
        console.log('Order status after update:', order.status);
        console.log('Is order assigned to me:', isOrderAssignedToMe);
      } else {
        Alert.alert('Failed to Accept Order', response.message || 'Unable to accept order. Please try again.');
      }
      
    } catch (error: any) {
      console.error('❌ Accept order error:', error);
      Alert.alert('Error', error.message || 'Failed to accept order. Please check your connection and try again.');
    } finally {
      setAcceptingOrder(false);
    }
  };

  const processChecklist = (sourceOrder: DeliveryAssignment): DetailedProductItem[] => {
    // Look for product checklist in the correct locations
    const checklistSource = sourceOrder.deliveryInfo?.productChecklist || 
                          sourceOrder.delivery?.productChecklist || 
                          sourceOrder.productChecklist || 
                          [];
    
    const orderProducts = sourceOrder.products || [];
    const cartItems = sourceOrder.cart || [];

    if (checklistSource.length === 0) {
      // If no checklist exists, create one from cart items as a fallback
      if (cartItems.length > 0) {
        console.log('📦 No checklist found, creating from cart items');
        return cartItems.map((item: any, index: number) => ({
          productId: item.productId || item.id || item._id || `cart_item_${index}`,
          title: item.title || 'Unknown Product',
          quantity: item.quantity || 1,
          price: item.price || 0,
          unitPrice: item.unitPrice || item.price || 0,
          totalPrice: (item.price || 0) * (item.quantity || 1),
          pricePerBaseUnit: (item.price || 0) / (item.packQty || 1),
          image: getProductImageUrl(item.image),
          collected: false,
          notes: '',
          collectedAt: undefined,
          _id: item._id || item.productId || item.id || `cart_item_${index}`,
          unitName: item.unitName || 'Unit',
          packQty: item.packQty || 1,
          originalPrice: item.originalPrice || item.price || 0,
          description: item.description || '',
          sku: item.sku || '',
          barcode: item.barcode || '',
          arabicTitle: item.arabicTitle || '',
          images: [getProductImageUrl(item.image)].filter(Boolean),
          attributes: item.attributes || {},
          weight: item.weight || 0,
          dimensions: item.dimensions || {},
          unitId: item.unitId,
          selectedUnitId: item.selectedUnitId,
          unitType: item.unitType || 'multi',
          unitValue: item.unitValue || 1,
          unitCalculation: item.unitCalculation,
        }));
      }
      return [];
    }

    console.log('📦 Processing checklist with', checklistSource.length, 'items');

    return checklistSource.map((item: any) => {
      // Find the corresponding full product details from the main products array
      const productDetail = orderProducts.find(p => p._id === item.productId || p.productId === item.productId);

      // If details are not found in the main product list, use what's in the checklist item
      const title = item.title || productDetail?.title || 'Unknown Product';
      const image = getProductImageUrl(item.image || productDetail?.image);
      const sku = item.sku || productDetail?.sku;
      const price = item.price || item.unitPrice || productDetail?.price || 0;
      const quantity = item.quantity || productDetail?.quantity || 1;

      return {
        productId: item.productId || item._id,
        title: title,
        quantity: quantity,
        price: price,
        unitPrice: item.unitPrice || price,
        totalPrice: item.totalPrice || (price * quantity),
        pricePerBaseUnit: item.pricePerBaseUnit || (price / (item.packQty || 1)),
        image: image,
          collected: item.collected || false,
          notes: item.notes || '',
          collectedAt: item.collectedAt,
        _id: item._id || item.productId,
        unitName: item.unitName || productDetail?.unitName || 'Unit',
        packQty: item.packQty || productDetail?.packQty || 1,
        originalPrice: item.originalPrice || productDetail?.originalPrice || price,
        description: item.description || productDetail?.description || '',
        sku: sku,
        barcode: item.barcode || productDetail?.barcode || '',
        arabicTitle: item.arabicTitle || productDetail?.arabicTitle || productDetail?.title?.ar || '',
        images: Array.isArray(item.image || productDetail?.image) 
                  ? (item.image || productDetail?.image).map(getProductImageUrl) 
                  : [getProductImageUrl(item.image || productDetail?.image)].filter(Boolean),
        attributes: item.attributes || productDetail?.attributes || {},
        weight: item.weight || productDetail?.weight || 0,
        dimensions: item.dimensions || productDetail?.dimensions || {},
        unitId: item.unitId || productDetail?.unitId || item.selectedUnitId,
        selectedUnitId: item.selectedUnitId || productDetail?.selectedUnitId,
        unitType: item.unitType || productDetail?.unitType || 'multi',
        unitValue: item.unitValue || productDetail?.unitValue || 1,
        unitCalculation: item.unitCalculation || productDetail?.unitCalculation,
      };
    });
  }

  const getProductImageUrl = (image: any) => {
    if (!image) return 'https://via.placeholder.com/100x100?text=No+Image';
    if (image.startsWith('http')) return image;
    return `https://via.placeholder.com/100x100?text=Image`;
  };

  const getStatusColor = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'processing': return '#f59e0b';
      case 'out for delivery': return '#3b82f6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const toggleProductCollection = async (productId: string, collected: boolean) => {
    if (!isOrderAssignedToMe) {
      Alert.alert('Order Not Accepted', 'Please accept the order first before managing product collection.');
      return;
    }

    try {
      setLoading(true);
      
      // Call API to save the collection status
      const response = await ApiService.toggleProductCollection(order._id, productId, collected);
      
      if (response.success) {
        // Update local state
        const updatedChecklist = productChecklist.map(item => 
          (item.productId === productId || item._id === productId) 
            ? { ...item, collected, collectedAt: collected ? new Date().toISOString() : undefined }
            : item
        );
        setProductChecklist(updatedChecklist);
        
        // Call parent update callback
        onOrderUpdated();
        
        // Show success feedback
        console.log(`✅ Product ${collected ? 'collected' : 'uncollected'} successfully`);
      } else {
        Alert.alert('Error', response.message || 'Failed to update product status');
      }
    } catch (error: any) {
      console.error('❌ Failed to toggle product collection:', error);
      Alert.alert('Error', error.message || 'Failed to update product status. Please try again.');
    } finally {
      setLoading(false);
    }

    console.log('Order status after update:', order.status);
    console.log('Is order assigned to me:', isOrderAssignedToMe);
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      // This would be an API call to update order status
      // For now, we'll update local state
      setOrder(prev => ({ ...prev, status: newStatus }));
      console.log(`📊 Order status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  const handleMarkOutForDelivery = async () => {
    try {
      setLoading(true);
      const response = await ApiService.markAsOutForDelivery(order._id);
      if (response.success) {
        setOrder(prev => ({ ...prev, status: 'Out for Delivery' }));
        Alert.alert('Success', 'Order marked as out for delivery');
        onOrderUpdated();
      } else {
        Alert.alert('Error', response.message || 'Failed to update order status');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark order as out for delivery');
    } finally {
      setLoading(false);
    }

    console.log('Order status after update:', order.status);
    console.log('Is order assigned to me:', isOrderAssignedToMe);
  };

  const handleCompleteDelivery = () => {
    setVerificationModalVisible(true);
  };

  const submitDeliveryCompletion = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.completeDeliveryWithCode(order._id, verificationCode);
      if (response.success) {
        setOrder(prev => ({ ...prev, status: 'Delivered' }));
        setVerificationModalVisible(false);
        setVerificationCode('');
        
        // Show print options after successful completion
        showPrintOptionsAfterCompletion();
        onOrderUpdated();
      } else {
        Alert.alert('Error', response.message || 'Failed to complete delivery');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete delivery');
    } finally {
      setLoading(false);
    }
  };

  const showPrintOptionsAfterCompletion = () => {
    Alert.alert(
      'Delivery Completed!',
      'Would you like to print or share the receipt?',
      [
        {
          text: 'Mobile Print',
          onPress: () => handleMobilePrint(),
        },
        {
          text: 'PDF Receipt',
          onPress: () => handlePDFReceipt(),
        },
        {
          text: 'Skip',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleMobilePrint = async () => {
    try {
      setLoading(true);
      const response = await ApiService.printBill(order._id, { 
        type: 'mobile',
        format: 'thermal' 
      });
      if (response.success) {
        Alert.alert('Success', 'Print request sent to mobile printer!');
      } else {
        Alert.alert('Error', response.message || 'Failed to send print request');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Mobile print failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePDFReceipt = async () => {
    try {
      setLoading(true);
      const response = await ApiService.generateBill(order._id, 'pdf');
      if (response.success && response.data?.pdfUrl) {
        // Share the PDF URL
        await Share.share({
          title: `Receipt - Order ${order.invoice}`,
          message: `Download your receipt: ${response.data.pdfUrl}`,
          url: response.data.pdfUrl,
        });
      } else {
        Alert.alert('Error', 'Failed to generate PDF receipt');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'PDF generation failed');
    } finally {
      setLoading(false);
    }
  };

  const showBillPrintModal = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getOrderBill(order._id);
      if (response.success) {
        setBillData(response.data);
        setBillPrintModalVisible(true);
      } else {
        Alert.alert('Error', 'Could not fetch bill details.');
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
      Alert.alert('Error', 'An error occurred while fetching the bill.');
    } finally {
      setLoading(false);
    }
  };

  const printBill = async () => {
    Alert.alert('Print Feature', 'Printing functionality is not yet implemented.');
  };

  const shareBill = async () => {
    if (!billData) {
      Alert.alert('No Bill Data', 'Could not find bill data to share.');
      return;
    }
    
    let billText = `*SaptMarkets Delivery Receipt*\n`;
    billText += `========================\n`;
    billText += `Order #: ${order.invoice}\n`;
    billText += `Customer: ${customerName}\n`;
    billText += `Date: ${new Date().toLocaleString()}\n`;
    billText += `------------------------\n`;
    billData.items?.forEach((item: any) => {
      billText += `${item.title} x${item.quantity}\n  Total: ${order.financial.currency || '﷼'} ${item.total?.toFixed(2)}\n`;
    });
    billText += `------------------------\n`;
    billText += `Subtotal: ${order.financial.currency || '﷼'} ${billData.subtotal?.toFixed(2)}\n`;
    billText += `Delivery: ${order.financial.currency || '﷼'} ${billData.delivery?.toFixed(2)}\n`;
    billText += `*Total: ${order.financial.currency || '﷼'} ${billData.total?.toFixed(2)}*\n`;
    billText += `========================\n`;
    billText += `Payment: ${order.paymentMethod}\n`;
    billText += `Status: Delivered\n\n`;
    billText += `_Thank you for your order!_`;

    try {
      await Share.share({
        title: `Order Receipt ${order.invoice}`,
        message: billText,
      });
    } catch (error: any) {
      Alert.alert('Share Error', error.message);
    }
  };

  const callCustomer = () => {
    if (customerPhone && customerPhone !== 'N/A') {
      Alert.alert(
        'Contact Customer',
        `How would you like to contact ${customerName || 'the customer'}?`,
        [
          {
            text: 'Call',
            onPress: () => {
              const phoneNumber = Platform.OS === 'android' ? `tel:${customerPhone}` : `telprompt:${customerPhone}`;
              Linking.canOpenURL(phoneNumber)
                .then(supported => {
                  if (!supported) {
                    Alert.alert('Error', 'Phone dialer is not available.');
      } else {
                    Linking.openURL(phoneNumber);
                  }
                })
                .catch(err => console.error('An error occurred while trying to call:', err));
            }
          },
          {
            text: 'WhatsApp',
            onPress: () => {
              // WhatsApp requires number without +, and only digits
              const formattedPhone = customerPhone.replace(/[^0-9]/g, '');
              const whatsappUrl = `whatsapp://send?phone=${formattedPhone}`;

              Linking.canOpenURL(whatsappUrl)
        .then(supported => {
          if (!supported) {
                    Alert.alert('Error', 'WhatsApp is not installed on your device.');
          } else {
                    Linking.openURL(whatsappUrl);
          }
        })
                .catch(err => console.error('An error occurred while trying to open WhatsApp:', err));
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert('No Phone Number', 'No phone number is available for this customer.');
    }
  };

  const openNavigation = () => {
    if (customerAddress) {
      const url = Platform.select({
        ios: `maps:?q=${customerAddress}`,
        android: `geo:?q=${customerAddress}`,
      });
      if (url) {
        Linking.openURL(url).catch(err => console.warn("Couldn't open maps", err));
      }
      } else {
      Alert.alert('No Address', 'No address available for navigation.');
      }
  };

  const showProductDetails = (product: DetailedProductItem) => {
    setSelectedProduct(product);
    setProductDetailVisible(true);
  };

  const showImageZoom = (index: number) => {
    setSelectedImageIndex(index);
    setImageZoomVisible(true);
  };

  const getNextAction = () => {
    // Debugging current state before determining action
    console.log('--- getNextAction Debugging ---');
    console.log('Current orderStatus:', orderStatus);
    console.log('Is order assigned to me (isOrderAssignedToMe):', isOrderAssignedToMe);
    const allItemsCollectedCheck = productChecklist.length > 0 && productChecklist.every(item => item.collected);
    console.log('All items collected (derived from checklist):', allItemsCollectedCheck);
    console.log('Product Checklist Length:', productChecklist.length);
    console.log('-----------------------------');

    if (acceptingOrder) {
      return {
        text: 'Accepting Order...',
        color: '#fbbf24',
        onPress: () => {},
        disabled: true
      };
    }

    if (!isOrderAssignedToMe && orderStatus === 'Received') {
        return {
          text: 'Accept Order',
          color: '#10b981',
          onPress: handleAcceptOrder,
          disabled: false
        };
    }

    switch (orderStatus) {
      case 'Processing':
        const allItemsCollected = productChecklist.length > 0 && 
          productChecklist.every(item => item.collected);
        
        if (productChecklist.length === 0) {
          return {
            text: 'Mark as Ready for Delivery',
            color: '#3b82f6',
            onPress: handleMarkOutForDelivery,
            disabled: false
          };
        } else if (allItemsCollected) {
          return {
            text: 'Mark as Out for Delivery',
            color: '#3b82f6',
            onPress: handleMarkOutForDelivery,
            disabled: false
          };
        } else {
          const collectedCount = productChecklist.filter(p => p.collected).length;
          const totalCount = productChecklist.length;
          return {
            text: `Collect Items (${collectedCount}/${totalCount})`,
            color: '#f59e0b',
            onPress: () => onNavigateToProductChecklist(productChecklist, order._id),
            disabled: false
          };
        }

      case 'Out for Delivery':
        return {
          text: 'Complete Delivery',
          color: '#10b981',
          onPress: handleCompleteDelivery,
          disabled: false
        };

      case 'Delivered':
        return {
          text: 'Order Completed ✓',
          color: '#6b7280',
          onPress: () => {},
          disabled: true
        };

      default:
        return {
          text: 'Processing...',
          color: '#6b7280',
          onPress: () => {},
          disabled: true
        };
    }
  };

  const renderProductItem = ({ item }: { item: DetailedProductItem }) => (
    <View style={styles.productItemContainer}>
      <TouchableOpacity onPress={() => toggleProductCollection(item.productId || item._id || '', !item.collected)} style={styles.checkboxContainer}>
        <DisplayIcon 
          emoji={item.collected ? '☑️' : '☐'} 
          size={24} 
          color={item.collected ? '#10b981' : '#6b7280'} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.productDetailsContainer} onPress={() => showProductDetails(item)}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/100x100?text=No+Image' }}
          style={styles.productImage}
          resizeMode="contain"
        />
      <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title || 'Unknown Product'}
          </Text>
          {item.sku && (
            <Text style={styles.productSku}>SKU: {item.sku}</Text>
          )}
          
          <Text style={styles.productQuantity}>
            Qty: {item.quantity || 1} {item.unitName ? `× ${item.unitName}` : '× Unit'}
          </Text>
          
          <View style={styles.productPriceContainer}>
          <Text style={styles.productPrice}>
              {order.financial?.currency || '﷼'}{((item.price || 0)).toFixed(2)}
          </Text>
            {item.originalPrice && item.originalPrice > (item.price || 0) && (
              <Text style={styles.originalPrice}>
                {order.financial?.currency || '﷼'}{item.originalPrice.toFixed(2)}
          </Text>
          )}
            <Text style={styles.totalPrice}>
              Total: {order.financial?.currency || '﷼'}{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
          </Text>
        </View>
          </View>
          </TouchableOpacity>
      
      <TouchableOpacity style={styles.viewDetailsButton} onPress={() => showProductDetails(item)}>
        <Text style={styles.viewDetailsButtonText}>View</Text>
      </TouchableOpacity>
        </View>
    );

  const renderImageGallery = () => {
    if (!selectedProduct || !selectedProduct.images || selectedProduct.images.length === 0) {
    return (
        <View style={styles.noImageContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/300x300?text=No+Image' }}
            style={styles.galleryImage}
            resizeMode="contain"
          />
        </View>
      );
    }

    return (
      <View>
      <FlatList
        horizontal
          pagingEnabled
          data={selectedProduct.images}
          keyExtractor={(img, index) => `${img}-${index}`}
        renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => showImageZoom(index)}>
            <Image
              source={{ uri: getProductImageUrl(item) }}
              style={styles.galleryImage}
                resizeMode="contain"
            />
          </TouchableOpacity>
        )}
          showsHorizontalScrollIndicator={false}
          onScroll={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
            setSelectedImageIndex(index);
          }}
        />
        <View style={styles.imageIndicatorContainer}>
          {selectedProduct.images.map((_, index) => (
                <View 
              key={index}
              style={[
                styles.imageIndicator, 
                index === selectedImageIndex && styles.imageIndicatorActive
              ]} 
            />
          ))}
              </View>
                </View>
    );
  };
  
  const renderProductDetailModal = () => (
      <Modal
        animationType="slide"
        transparent={false}
        visible={productDetailVisible}
        onRequestClose={() => setProductDetailVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setProductDetailVisible(false)}
              style={styles.modalCloseButton}
            >
              <DisplayIcon emoji="✕" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Product Details</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedProduct && (
              <>
                  {renderImageGallery()}

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>English Name:</Text>
                    <Text style={styles.detailValue}>{selectedProduct.title}</Text>
                  </View>
                  {selectedProduct.arabicTitle && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Arabic Name:</Text>
                      <Text style={styles.detailValue}>{selectedProduct.arabicTitle}</Text>
                    </View>
                  )}
                  {selectedProduct.description && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailValue}>{selectedProduct.description}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Unit & Quantity</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Order Quantity:</Text>
                    <Text style={styles.detailValue}>{selectedProduct.quantity} × {selectedProduct.unitName}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Unit Price:</Text>
                    <Text style={styles.detailValue}>
                    {order.financial?.currency || '﷼'}{(selectedProduct.price || selectedProduct.unitPrice || 0).toFixed(2)}
                    </Text>
                  </View>
                {selectedProduct.originalPrice && selectedProduct.originalPrice > (selectedProduct.price || 0) &&
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Original Price:</Text>
                    <Text style={[styles.detailValue, styles.originalPrice]}>
                      {order.financial?.currency || '﷼'}{selectedProduct.originalPrice.toFixed(2)}
                    </Text>
                  </View>
                }
                </View>

                {(selectedProduct.sku || selectedProduct.barcode) && (
                  <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Codes</Text>
                    {selectedProduct.sku && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>SKU:</Text>
                        <Text style={styles.detailValue}>{selectedProduct.sku}</Text>
                      </View>
                    )}
                    {selectedProduct.barcode && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Barcode:</Text>
                        <Text style={styles.detailValue}>{selectedProduct.barcode}</Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
  );

  const renderImageZoomModal = () => (
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageZoomVisible}
        onRequestClose={() => setImageZoomVisible(false)}
      >
        <View style={styles.imageZoomOverlay}>
          <TouchableOpacity 
            style={styles.imageZoomCloseButton}
            onPress={() => setImageZoomVisible(false)}
          >
            <DisplayIcon emoji="✕" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedProduct?.images && selectedProduct.images[selectedImageIndex] && (
            <Image
              source={{ uri: getProductImageUrl(selectedProduct.images[selectedImageIndex]) }}
              style={styles.zoomedImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
  );

  const renderVerificationModal = () => (
      <Modal
        animationType="slide"
        transparent={true}
        visible={verificationModalVisible}
        onRequestClose={() => setVerificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.verificationModalContent}>
          <Text style={styles.modalTitle}>Complete Delivery</Text>
          <Text style={styles.modalSubtitle}>Enter the customer's 6-digit verification code.</Text>
          
              <TextInput
                style={styles.verificationInput}
                placeholder="000000"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="numeric"
                maxLength={6}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setVerificationModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={submitDeliveryCompletion} disabled={loading}>
              <Text style={styles.submitButtonText}>{loading ? 'Verifying...' : 'Complete Delivery'}</Text>
            </TouchableOpacity>
            </View>
        </View>
      </View>
    </Modal>
  );
  
  const renderIssueModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={issueModalVisible}
      onRequestClose={() => setIssueModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Report an Issue</Text>
            <TextInput
            style={styles.issueInput}
            placeholder="Describe the issue with the order..."
            value={issueDescription}
            onChangeText={setIssueDescription}
              multiline
            />
            <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIssueModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={() => Alert.alert('Reported', 'Issue has been reported.')}>
              <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  );

  const renderBillPrintModal = () => (
      <Modal
        animationType="slide"
        transparent={true}
        visible={billPrintModalVisible}
        onRequestClose={() => setBillPrintModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.billModalContent}>
          <Text style={styles.modalTitle}>Print Bill</Text>
            
          {billData ? (
              <ScrollView style={styles.billPreview}>
              {/* Bill content here */}
              </ScrollView>
          ) : <Text>No bill data</Text>}
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setBillPrintModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={printBill}>
              <Text style={styles.submitButtonText}>Print</Text>
              </TouchableOpacity>
            </View>
        </View>
      </View>
    </Modal>
  );

  // Debug log for customerPhone just before rendering
  console.log('📱 OrderDetailsScreen - customerPhone value:', customerPhone);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      <View style={styles.header}>
                <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <DisplayIcon emoji="←" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>Order #{orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderStatus) }]}>
            <Text style={styles.statusBadgeText}>{orderStatus}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
                      <TouchableOpacity onPress={() => loadOrderDetails(order._id)} style={styles.headerButton}>
              <DisplayIcon emoji="🔄" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIssueModalVisible(true)} style={styles.headerButton}>
              <DisplayIcon emoji="⚠️" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadOrderDetails(order._id)} />
        }
      >
        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <DisplayIcon emoji="👤" size={20} />
              </View>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <DisplayIcon emoji="📞" size={20} />
              </View>
              <Text style={styles.infoLabel}>Phone:</Text>
              <TouchableOpacity onPress={callCustomer}>
                <Text style={[styles.infoValue, styles.linkText]}>{customerPhone}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <DisplayIcon emoji="🏠" size={20} />
              </View>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue} numberOfLines={2}>{customerAddress}</Text>
            </View>
            <TouchableOpacity style={styles.navigationButton} onPress={openNavigation}>
              <View style={styles.iconContainer}>
                <DisplayIcon emoji="🧭" size={20} color="#fff" />
              </View>
              <Text style={styles.navigationButtonText}>Open Navigation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Collection Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Collection</Text>
          <View style={styles.card}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{`${collectionProgress.toFixed(0)}% Complete`}</Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarForeground, { width: `${collectionProgress}%` }]} />
              </View>
            </View>
            
            {productChecklist.length === 0 && !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No products in this order's checklist</Text>
              </View>
            ) : (
              <View>
                <View style={styles.productSummaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Products:</Text>
                    <Text style={styles.summaryValue}>{productChecklist.length}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Collected:</Text>
                    <Text style={[styles.summaryValue, { color: '#10b981' }]}>
                      {productChecklist.filter(p => p.collected).length}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Remaining:</Text>
                    <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
                      {productChecklist.filter(p => !p.collected).length}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.checklistButton}
                  onPress={() => onNavigateToProductChecklist(productChecklist, order._id)}
                >
                  <Text style={styles.checklistButtonText}>📋 View Product Checklist</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <DisplayIcon emoji="💳" size={20} />
              </View>
              <Text style={styles.infoLabel}>Payment Method:</Text>
              <Text style={styles.infoValue}>{paymentMethod}</Text>
            </View>
            {order.financial && order.financial.total ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>{order.financial.currency || '﷼'}{(order.financial.subTotal || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.summaryLabel}>Shipping Cost:</Text>
                  <Text style={styles.summaryValue}>{order.financial.currency || '﷼'}{(order.financial.shippingCost || 0).toFixed(2)}</Text>
                </View>
                {(order.financial.discount || 0) > 0 && (
                  <View style={styles.infoRow}>
                    <Text style={styles.summaryLabel}>Discount:</Text>
                    <Text style={[styles.summaryValue, styles.discountValue]}>
                      -{order.financial.currency || '﷼'}{(order.financial.discount || 0).toFixed(2)}
                    </Text>
                  </View>
                )}
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.totalLabel}>Total Amount:</Text>
                  <Text style={styles.totalValue}>{order.financial.currency || '﷼'}{(order.financial.total || 0).toFixed(2)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No financial details available.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {(() => {
            const action = getNextAction();
            return (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: action.color }, action.disabled && styles.actionButtonDisabled]}
                onPress={action.onPress}
                disabled={action.disabled}
              >
                <Text style={[styles.actionButtonText, action.disabled && styles.actionButtonTextDisabled]}>
                  {action.text}
                </Text>
              </TouchableOpacity>
            );
          })()}
        </View>
      </ScrollView>

      {/* Modals and Overlays */}
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Please wait...</Text>
        </View>
      ) : null}
      
      {renderVerificationModal()}
      {renderIssueModal()}
      {renderBillPrintModal()}
      {renderProductDetailModal()}
      {renderImageZoomModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#4b5563',
    width: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  linkText: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  navigationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
    textAlign: 'right',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  progressBarForeground: {
    height: 8,
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  productItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  checkboxContainer: {
    padding: 8,
  },
  productDetailsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  productSku: {
    fontSize: 12,
    color: '#6b7280',
  },
  productQuantity: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  originalPrice: {
    fontSize: 12,
    color: '#6b7280',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  totalPrice: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  viewDetailsButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  checklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  checklistButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productSummaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginLeft: 'auto',
  },
  discountValue: {
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 'auto',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  primaryActionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalHeaderSpacer: {
    width: 28,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
  },
  galleryImage: {
    width: Dimensions.get('window').width,
    height: 300,
  },
  noImageContainer: {
    width: Dimensions.get('window').width,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  imageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  imageIndicatorActive: {
    backgroundColor: '#3b82f6',
  },
  imageZoomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageZoomCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  zoomedImage: {
    width: '100%',
    height: '80%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  verificationModalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  verificationInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  issueInput: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  billModalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
  },
  billPreview: {
    marginVertical: 16,
  },
  statusProgressButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusProgressButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusProgressButtonTextDisabled: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusProgressSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  acceptOrderButton: {
    backgroundColor: '#f59e0b',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  actionButtonTextDisabled: {
    color: '#6b7280',
  },
});

export default OrderDetailsScreen;