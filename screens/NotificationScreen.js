import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function NotificationScreen({ navigation }) {
  const notifications = [
    {
      id: '1',
      title: 'Payment Received',
      message: 'You have received ₱50.00 from John Doe',
      time: '2 hours ago',
      isRead: false,
      type: 'transaction'
    },
    {
      id: '2',
      title: 'Weekly Summary',
      message: 'Your spending this week was 15% less than last week. Great job!',
      time: '1 day ago',
      isRead: true,
      type: 'summary'
    },
    {
      id: '3',
      title: 'Bill Payment Reminder',
      message: 'Your electricity bill is due in 3 days',
      time: '2 days ago',
      isRead: false,
      type: 'reminder'
    },
    {
      id: '4',
      title: 'Security Alert',
      message: 'A new device was used to log into your account',
      time: '3 days ago',
      isRead: true,
      type: 'security'
    },
    {
      id: '5',
      title: 'Promotion',
      message: 'Transfer money with zero fees this weekend!',
      time: '5 days ago',
      isRead: true,
      type: 'promo'
    },
  ];

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