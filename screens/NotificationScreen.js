import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]); // fallback/static notifications
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);

  // static fallback notifications for other types
  useEffect(() => {
    setNotifications([
      { id: 'n1', title: 'Payment Received', message: 'You have received ₱50.00 from John Doe', time: '2 hours ago', isRead: false, type: 'transaction' },
    ]);
  }, []);

  useEffect(() => {
    // fetch bills when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserBills();
    });
    // initial load
    fetchUserBills();
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  async function fetchUserBills() {
    setLoadingBills(true);
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setBills([]);
        setLoadingBills(false);
        return;
      }

      // Select bill rows and include the related profile (user) fields so
      // we can autofill recipient_name / email when admin didn't store them on the bill row.
      // This requires the foreign key relation (bills.user_id -> profile.id) exists in the DB.
      const { data, error } = await supabase
        .from('bills')
        .select('*, profile (id, fullname, email, account_number)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setBills(data || []);
    } catch (e) {
      console.error('Failed to load bills for notifications', e);
      setBills([]);
    } finally {
      setLoadingBills(false);
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'transaction':
        return { name: 'cash', color: '#10B981' };
      case 'summary':
        return { name: 'bar-chart', color: '#3B82F6' };
      case 'reminder':
        return { name: 'alarm', color: '#F59E0B' };
      case 'security':
        return { name: 'shield-checkmark', color: '#EF4444' };
      case 'promo':
        return { name: 'gift', color: '#8B5CF6' };
      default:
        return { name: 'mail', color: '#6B7280' };
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'transaction':
        return '#e3f7e8';
      case 'summary':
        return '#e6f0ff';
      case 'reminder':
        return '#fff2e0';
      case 'security':
        return '#ffe0e0';
      case 'promo':
        return '#f0e6ff';
      default:
        return '#f5f5f5';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#179C7D', '#179C7D', '#0088cc']}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Render admin-created bills as actionable notifications */}
        {bills.map((bill) => {
          const iconData = getNotificationIcon('reminder');
          return (
            <TouchableOpacity
              key={bill.id}
              style={[styles.notificationItem, styles.unreadNotification]}
              onPress={() => {
                navigation.navigate('PayBills', {
                  fromBill: true,
                  billId: bill.id,
                  bill_type: bill.bill_type,
                  amount: bill.amount,
                  due_date: bill.due_date,
                  provider: bill.provider || null,
                  reference: bill.reference || null,
                  // Prefer explicit recipient fields stored on the bill, fallback to joined profile
                  recipient_name: bill.recipient_name || bill.profile?.fullname || null,
                  recipient_email: bill.recipient_email || bill.profile?.email || null,
                  account_number: bill.account_number || bill.profile?.account_number || null,
                  user_id: bill.user_id || null,
                });
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: getNotificationColor('reminder') }]}>
                <Ionicons name={iconData.name} size={24} color={iconData.color} />
              </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{bill.bill_type || 'Bill Due'}</Text>
                    <Text style={styles.notificationTime}>{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'Due date N/A'}</Text>
                  </View>
                  <Text style={styles.notificationMessage}>You have a bill of ₱{Number(bill.amount ?? 0).toLocaleString()} due {bill.due_date ? new Date(bill.due_date).toLocaleDateString() : ''}</Text>

                  {/* Small inline Pay Now button that opens PayBills and auto-opens confirmation */}
                  <View style={{ marginTop: 10, flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('PayBills', {
                          fromBill: true,
                          billId: bill.id,
                          bill_type: bill.bill_type,
                          amount: bill.amount,
                          due_date: bill.due_date,
                          provider: bill.provider || null,
                          reference: bill.reference || null,
                          recipient_name: bill.recipient_name || null,
                          recipient_email: bill.recipient_email || null,
                          user_id: bill.user_id || null,
                          autoConfirm: true,
                        });
                      }}
                      style={{
                        backgroundColor: '#0D7A5F',
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '600' }}>Pay Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
            </TouchableOpacity>
          );
        })}

        {/* Other static notifications */}
        {notifications.map((notification) => {
          const iconData = getNotificationIcon(notification.type);
          return (
            <TouchableOpacity 
              key={notification.id} 
              style={[
                styles.notificationItem,
                notification.isRead ? styles.readNotification : styles.unreadNotification
              ]}
            >
              <View 
                style={[
                  styles.iconContainer,
                  { backgroundColor: getNotificationColor(notification.type) }
                ]}
              >
                <Ionicons name={iconData.name} size={24} color={iconData.color} />
              </View>
              <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
            </View>
          </TouchableOpacity>
        );
        })}

        {/* Empty state for when there are no notifications */}
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateMessage}>You're all caught up! Check back later for updates.</Text>
          </View>
        )}
        
        {/* Add spacer for bottom navigation */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  markAllButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  markAllText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 15,
    paddingBottom: 80, // Add enough padding to account for the bottom nav
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#179C7D',
  },
  readNotification: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 20,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});