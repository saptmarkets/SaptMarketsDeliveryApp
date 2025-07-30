import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { DetailedProductItem } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ApiService from '../services/api';

// Consistent Icon Component
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

interface ProductChecklistScreenProps {
  checklist: DetailedProductItem[];
  orderId: string;
  onUpdateChecklist: (checklist: DetailedProductItem[]) => void;
  onGoBack: () => void;
}

const ProductChecklistScreen: React.FC<ProductChecklistScreenProps> = ({
  checklist,
  orderId,
  onUpdateChecklist,
  onGoBack,
}) => {

  const [products, setProducts] = useState<DetailedProductItem[]>(checklist);
  const [productDetailVisible, setProductDetailVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DetailedProductItem | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggleCollect = async (productId: string) => {
    const product = products.find(p => p.productId === productId);
    if (!product) {
      Alert.alert('Error', 'Product not found in checklist');
      return;
    }

    const newCollectedStatus = !product.collected;

    try {
      setLoading(true);
      
      console.log('🔄 Toggling product collection:', {
        orderId,
        productId,
        newCollectedStatus,
        productTitle: product.title
      });
      
      // Debug: Check API configuration
      console.log('🔧 API Configuration:', {
        baseURL: 'http://10.0.2.2:5055/api', // From config
        endpoint: `orders/${orderId}/toggle-product`
      });
      
      // Debug: Check authentication
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const authToken = await AsyncStorage.getItem('authToken'); 
      console.log('🔐 Auth Token Status:', {
        hasToken: !!authToken,
        tokenLength: authToken ? authToken.length : 0,
        tokenStart: authToken ? authToken.substring(0, 10) + '...' : 'None'
      });
      
      // Call API to save the collection status
      const response = await ApiService.toggleProductCollection(orderId, productId, newCollectedStatus);
      
      console.log('📱 Toggle response:', response);
      
      if (response.success) {
        // Update local state
        const updatedProducts = products.map(p =>
          p.productId === productId ? { 
            ...p, 
            collected: newCollectedStatus, 
            collectedAt: newCollectedStatus ? new Date().toISOString() : undefined 
          } : p
        );
        setProducts(updatedProducts);
        onUpdateChecklist(updatedProducts);
        
        console.log(`✅ Product ${newCollectedStatus ? 'collected' : 'uncollected'} successfully`);
      } else {
        console.log('❌ API returned error:', response.message);
        Alert.alert('Error', response.message || 'Failed to update product status');
      }
    } catch (error: any) {
      console.error('❌ Failed to toggle product collection:', error);
      
      // Enhanced error logging
      console.log('🚨 Detailed Error Information:', {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        requestURL: error.config?.url,
        requestMethod: error.config?.method,
        requestHeaders: error.config?.headers
      });
      
      // More detailed error handling
      let errorMessage = 'Failed to update product status. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Network Error') || error.message.includes('timeout')) {
          errorMessage = 'Network connection issue. Please check your internet connection and try again.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Order or product not found. Please refresh and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showProductDetails = (product: DetailedProductItem) => {
    setSelectedProduct(product);
    setProductDetailVisible(true);
  };
  
  const renderProductItem = ({ item }: { item: DetailedProductItem }) => (
    <View style={styles.productCard}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleToggleCollect(item.productId)}
        disabled={loading}
      >
        <DisplayIcon
          emoji={item.collected ? '☑️' : '☐'}
          size={30}
          color={item.collected ? '#4CAF50' : '#ccc'}
        />
      </TouchableOpacity>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title || 'Unknown Product'}</Text>
        <Text style={styles.productQuantity}>
          Qty: {item.quantity || 1} × {item.unitName || 'Unit'}
        </Text>
        {item.sku && (
          <Text style={styles.productSku}>SKU: {item.sku}</Text>
        )}
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => showProductDetails(item)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const collectedCount = products.filter(p => p.collected).length;
  const totalCount = products.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <DisplayIcon emoji="←" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Product Checklist</Text>
          <Text style={styles.headerSubtitle}>Order #{orderId.slice(-6)}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.progressText}>{collectedCount}/{totalCount}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarForeground, 
              { width: `${totalCount > 0 ? (collectedCount / totalCount) * 100 : 0}%` }
            ]} 
          />
        </View>
        <View style={styles.progressLabelContainer}>
          <Text style={styles.progressLabel}>
            {collectedCount} of {totalCount} items collected
          </Text>
          {loading && (
            <Text style={styles.savingIndicator}>Saving...</Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {products.map(p => (
          <View key={p.productId}>{renderProductItem({ item: p })}</View>
        ))}
      </ScrollView>

      {/* Product Detail Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={productDetailVisible}
        onRequestClose={() => setProductDetailVisible(false)}
      >
        {selectedProduct && (
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
              {/* Product Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: selectedProduct.image || 'https://via.placeholder.com/300x300?text=No+Image' }}
                  style={styles.productDetailImage}
                  resizeMode="contain"
                />
              </View>

              {/* Basic Information */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedProduct.title}</Text>
                </View>
                {selectedProduct.arabicTitle && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Arabic Name:</Text>
                    <Text style={styles.detailValue}>{selectedProduct.arabicTitle}</Text>
                  </View>
                )}
                {selectedProduct.sku && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>SKU:</Text>
                    <Text style={styles.detailValue}>{selectedProduct.sku}</Text>
                  </View>
                )}
                {selectedProduct.description && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailValue}>{selectedProduct.description}</Text>
                  </View>
                )}
              </View>

              {/* Quantity & Unit */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Quantity & Unit</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={styles.detailValue}>{selectedProduct.quantity} × {selectedProduct.unitName}</Text>
                </View>
              </View>

              {/* Pricing */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Unit Price:</Text>
                  <Text style={styles.detailValue}>﷼{(selectedProduct.price || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Price:</Text>
                  <Text style={styles.detailValue}>
                    ﷼{((selectedProduct.price || 0) * (selectedProduct.quantity || 1)).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Collection Status */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Collection Status</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[
                    styles.detailValue, 
                    { color: selectedProduct.collected ? '#10b981' : '#ef4444' }
                  ]}>
                    {selectedProduct.collected ? '✅ Collected' : '❌ Not Collected'}
                  </Text>
                </View>
                {selectedProduct.collectedAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Collected At:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedProduct.collectedAt).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
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
  headerSubtitle: {
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 2,
  },
  headerRight: {
    padding: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  progressContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarForeground: {
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  savingIndicator: {
    fontSize: 12,
    color: '#3b82f6',
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  checkboxContainer: {
    padding: 8,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginHorizontal: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  productSku: {
    fontSize: 12,
    color: '#888',
  },
  viewDetailsButton: {
    marginTop: 8,
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  productDetailImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  detailSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
    fontWeight: '500',
  },
});

export default ProductChecklistScreen; 