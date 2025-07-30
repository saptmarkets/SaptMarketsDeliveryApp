/**
 * Debug Script for Product Checklist Issue
 * Run this to test the API endpoints and identify the problem
 */

const API_BASE_URL = 'http://10.0.2.2:5055/api';

// Test function to debug the API
async function debugProductChecklistAPI() {
  console.log('🔍 Starting Product Checklist Debug Session');
  console.log('📍 API Base URL:', API_BASE_URL);
  
  // Replace these with actual values from your app
  const TEST_ORDER_ID = '646625'; // Use the order ID from your screenshot
  const TEST_PRODUCT_ID = 'your_product_id_here';
  const TEST_AUTH_TOKEN = 'your_auth_token_here';
  
  console.log('📋 Test Parameters:', {
    orderId: TEST_ORDER_ID,
    productId: TEST_PRODUCT_ID,
    hasAuthToken: !!TEST_AUTH_TOKEN
  });
  
  try {
    // 1. Test API Health Check
    console.log('\n🏥 Testing API Health...');
    const healthResponse = await fetch(`${API_BASE_URL}/mobile-delivery/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check Result:', healthData);
    
    // 2. Test Order Details Endpoint
    console.log('\n📋 Testing Order Details...');
    const orderResponse = await fetch(`${API_BASE_URL}/mobile-delivery/orders/${TEST_ORDER_ID}`, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!orderResponse.ok) {
      console.log('❌ Order Details Failed:', orderResponse.status, orderResponse.statusText);
      const errorText = await orderResponse.text();
      console.log('Error Details:', errorText);
    } else {
      const orderData = await orderResponse.json();
      console.log('✅ Order Details Success:', {
        orderId: orderData.data?._id,
        hasProductChecklist: !!orderData.data?.productChecklist,
        checklistLength: orderData.data?.productChecklist?.length || 0,
        orderStatus: orderData.data?.status
      });
    }
    
    // 3. Test Debug Checklist Endpoint
    console.log('\n🔧 Testing Debug Checklist Endpoint...');
    const debugResponse = await fetch(`${API_BASE_URL}/mobile-delivery/debug/order/${TEST_ORDER_ID}/checklist`, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!debugResponse.ok) {
      console.log('❌ Debug Checklist Failed:', debugResponse.status, debugResponse.statusText);
    } else {
      const debugData = await debugResponse.json();
      console.log('✅ Debug Checklist Result:', debugData.data);
    }
    
    // 4. Test Toggle Product Endpoint
    console.log('\n🔄 Testing Toggle Product...');
    const toggleResponse = await fetch(`${API_BASE_URL}/mobile-delivery/orders/${TEST_ORDER_ID}/toggle-product`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: TEST_PRODUCT_ID,
        collected: true,
        notes: 'Debug test'
      })
    });
    
    if (!toggleResponse.ok) {
      console.log('❌ Toggle Product Failed:', toggleResponse.status, toggleResponse.statusText);
      const errorText = await toggleResponse.text();
      console.log('Error Details:', errorText);
    } else {
      const toggleData = await toggleResponse.json();
      console.log('✅ Toggle Product Success:', toggleData);
    }
    
  } catch (error) {
    console.error('🚨 Debug Script Error:', error);
  }
}

// Instructions for the user
console.log(`
🚀 DEBUGGING INSTRUCTIONS:

1. First, make sure your backend server is running on port 5055
2. Update the TEST_ORDER_ID with the actual order ID (646625 from your screenshot)
3. Get the AUTH_TOKEN from your mobile app:
   - Add this to your ProductChecklistScreen.tsx temporarily:
   - import AsyncStorage from '@react-native-async-storage/async-storage';
   - const token = await AsyncStorage.getItem('authToken');
   - console.log('Auth Token:', token);
4. Get a PRODUCT_ID from the order (Premium T-Shirt or Green Leaf Lettuce)
5. Run this debug script

Alternatively, you can run these tests directly in your browser or Postman:

🔗 Health Check: GET ${API_BASE_URL}/mobile-delivery/health
🔗 Order Details: GET ${API_BASE_URL}/mobile-delivery/orders/646625
🔗 Debug Checklist: GET ${API_BASE_URL}/mobile-delivery/debug/order/646625/checklist
🔗 Toggle Product: POST ${API_BASE_URL}/mobile-delivery/orders/646625/toggle-product

Make sure to include the Authorization header: Bearer YOUR_TOKEN
`);

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { debugProductChecklistAPI };
} 