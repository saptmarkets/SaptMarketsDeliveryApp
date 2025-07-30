import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ApiService from '../services/api';
import { Driver } from '../types';

interface EarningsScreenProps {
  driver: Driver;
  onGoBack: () => void;
}

interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  avgPerDelivery: number;
  deliveriesCount: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  type: 'delivery' | 'bonus' | 'tip';
  orderId?: string;
  description: string;
  status: 'completed' | 'pending';
}

const EarningsScreen: React.FC<EarningsScreenProps> = ({ driver, onGoBack }) => {
  const [earnings, setEarnings] = useState<EarningsData>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
    avgPerDelivery: 0,
    deliveriesCount: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      total: 0,
    },
  });
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const fetchEarningsData = async () => {
    try {
      const response = await ApiService.getTodayEarnings();
      if (response.success && response.data) {
        // Use real data from API
        setEarnings({
          today: response.data.todayEarnings || 0,
          thisWeek: response.data.weekEarnings || 0,
          thisMonth: response.data.monthEarnings || 0,
          total: response.data.monthEarnings || 0, // Use month as total for now
          avgPerDelivery: response.data.avgPerDelivery || 0,
          deliveriesCount: {
            today: response.data.todayDeliveries || 0,
            thisWeek: response.data.weekDeliveries || 0,
            thisMonth: response.data.monthDeliveries || 0,
            total: response.data.monthDeliveries || 0, // Use month as total for now
          },
        });
      } else {
        // Show zeros if no data available
        setEarnings({
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          total: 0,
          avgPerDelivery: 0,
          deliveriesCount: {
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
            total: 0,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      // Show zeros if API fails
      setEarnings({
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        total: 0,
        avgPerDelivery: 0,
        deliveriesCount: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          total: 0,
        },
      });
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      // Get real completed orders for this driver only
      const response = await ApiService.getCompletedOrders();
      if (response.success && response.data) {
        const realHistory: PaymentHistory[] = response.data.map((order: any, index: number) => ({
          id: order._id || `order-${index}`,
          date: order.deliveredAt || order.updatedAt || new Date().toISOString(),
          amount: order.financial?.total || order.total || 0,
          type: 'delivery' as const,
          orderId: `#${order.invoice || order._id}`,
          description: `Delivery payment - Order #${order.invoice || order._id}`,
          status: 'completed' as const,
        }));
        setPaymentHistory(realHistory);
      } else {
        setPaymentHistory([]);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setPaymentHistory([]);
    }
  };

  useEffect(() => {
    fetchEarningsData();
    fetchPaymentHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchEarningsData(), fetchPaymentHistory()]);
    setRefreshing(false);
  };

  const getSelectedEarnings = () => {
    switch (selectedPeriod) {
      case 'today':
        return earnings.today;
      case 'week':
        return earnings.thisWeek;
      case 'month':
        return earnings.thisMonth;
      default:
        return earnings.today;
    }
  };

  const getSelectedDeliveries = () => {
    switch (selectedPeriod) {
      case 'today':
        return earnings.deliveriesCount.today;
      case 'week':
        return earnings.deliveriesCount.thisWeek;
      case 'month':
        return earnings.deliveriesCount.thisMonth;
      default:
        return earnings.deliveriesCount.today;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return 'local-shipping';
      case 'tip':
        return 'attach-money';
      case 'bonus':
        return 'card-giftcard';
      default:
        return 'payment';
    }
  };

  const renderSeparator = () => <View style={styles.separator} />;

  const renderPaymentItem = ({ item }: { item: PaymentHistory }) => (
    <TouchableOpacity style={styles.paymentItem}>
      <View style={styles.paymentLeft}>
        <Icon name={getPaymentIcon(item.type)} size={24} color="#6b7280" />
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentDescription}>{item.description}</Text>
          {item.orderId && (
            <Text style={styles.paymentOrderId}>Order: {item.orderId}</Text>
          )}
          <Text style={styles.paymentDate}>{formatDate(item.date)}</Text>
        </View>
      </View>
      <View style={styles.paymentRight}>
        <Text style={[
          styles.paymentAmount,
          { color: item.status === 'pending' ? '#ffc107' : '#28a745' }
        ]}>
          +﷼ {item.amount.toFixed(2)}
        </Text>
        <Text style={[
          styles.paymentStatus,
          { color: item.status === 'pending' ? '#ffc107' : '#28a745' }
        ]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'today' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('today')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'today' && styles.periodButtonTextActive
            ]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'week' && styles.periodButtonTextActive
            ]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'month' && styles.periodButtonTextActive
            ]}>
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Earnings Card */}
        <View style={styles.mainEarningsCard}>
          <Text style={styles.mainEarningsLabel}>
            {selectedPeriod === 'today' ? "Today's Earnings" : 
             selectedPeriod === 'week' ? "This Week's Earnings" : 
             "This Month's Earnings"}
          </Text>
          <Text style={styles.mainEarningsAmount}>
            ﷼ {getSelectedEarnings().toFixed(2)}
          </Text>
          <Text style={styles.deliveriesCount}>
            {getSelectedDeliveries()} deliveries completed
          </Text>
        </View>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>﷼ {earnings.avgPerDelivery.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg per Delivery</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{earnings.deliveriesCount.total}</Text>
            <Text style={styles.statLabel}>Total Deliveries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>﷼ {earnings.total.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.8⭐</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Weekly Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Breakdown</Text>
          <View style={styles.weeklyBreakdown}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const amount = Math.random() * 150; // Mock data
              const maxHeight = 80;
              const height = (amount / 150) * maxHeight;
              
              return (
                <View key={day} style={styles.dayColumn}>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { height: height }]} />
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                  <Text style={styles.dayAmount}>${amount.toFixed(0)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Payment History */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Payment History</Text>
            <TouchableOpacity onPress={() => Alert.alert('Info', 'View all payments feature coming soon!')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={paymentHistory.slice(0, 5)}
            renderItem={renderPaymentItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={renderSeparator}
          />
        </View>

        {/* Payout Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payout Information</Text>
          <View style={styles.payoutInfo}>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Next Payout:</Text>
              <Text style={styles.payoutValue}>Friday, Dec 22</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Pending Amount:</Text>
              <Text style={styles.payoutValue}>$185.50</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Payment Method:</Text>
              <Text style={styles.payoutValue}>Bank Transfer</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.payoutButton}
            onPress={() => Alert.alert('Info', 'Payout settings feature coming soon!')}
          >
            <Text style={styles.payoutButtonText}>Payout Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007bff',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  mainEarningsCard: {
    backgroundColor: '#007bff',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mainEarningsLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  mainEarningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  deliveriesCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  weeklyBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dayAmount: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentInfo: {
    marginLeft: 12,
  },
  paymentDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  paymentOrderId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
    color: '#999',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  paymentStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginVertical: 4,
  },
  payoutInfo: {
    marginBottom: 16,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  payoutLabel: {
    fontSize: 14,
    color: '#666',
  },
  payoutValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  payoutButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  payoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EarningsScreen;