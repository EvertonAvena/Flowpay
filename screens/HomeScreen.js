import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [monthlyBillsCount, setMonthlyBillsCount] = useState(0);
  const [weeklySpending, setWeeklySpending] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expenseItems, setExpenseItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replace useEffect with useFocusEffect for real-time refresh
  useFocusEffect(
    React.useCallback(() => {
      fetchAll();
    }, [])
  );

  useEffect(() => {
    // When month or category changes, re-fetch expenses part
    fetchExpensesForMonth();
  }, [selectedMonth, selectedCategory]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // 1. Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'No user found. Please log in again.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      // 2. Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profile')
        .select('fullname, username, email, balance, coin_balance')
        .eq('id', user.id)
        .single();
      if (profileError || !profileData) {
        Alert.alert('Error', 'Profile not found.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }
      setProfile(profileData);

      // 3. Fetch monthly expenses from bills table (use due_date)
      await fetchExpensesForMonth();

      // 4. Fetch weekly spending
      const now = new Date();
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      const { data: weekData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', firstDayOfWeek.toISOString().slice(0, 10));
      const weekTotal = weekData ? weekData.reduce((sum, row) => sum + Number(row.amount), 0) : 0;
      setWeeklySpending(weekTotal);

      // 5. Fetch recent transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('type, amount, description, created_at, status, counterparty, recipient_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setTransactions(txData || []);
      // Also fetch expense items for the current selected month
      await fetchExpensesForMonth();
    } catch (error) {
      console.error('Error fetching home data:', error);
      Alert.alert('Error', 'Could not fetch home data.');
    }
    setLoading(false);
  };

  // Fetch expenses for the selected month and category
  const fetchExpensesForMonth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const start = new Date(selectedMonth);
      start.setDate(1);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);

      // Query bills where created_at is within the selected month
      let query = supabase
        .from('bills')
        .select('id, amount, bill_type, provider, reference, recipient_name, created_at')
        .eq('user_id', user.id)
        .gte('created_at', start.toISOString().slice(0, 10))
        .lte('created_at', end.toISOString().slice(0, 10))
        .order('created_at', { ascending: false });

      if (selectedCategory && selectedCategory !== 'all') {
        // Treat selectedCategory as bill_type when filtering bills
        query = query.eq('bill_type', selectedCategory);
      }

      const { data } = await query;
      const items = data || [];
      setExpenseItems(items);

      // Update monthly bills count based on returned bills
      setMonthlyBillsCount(items.length);
    } catch (err) {
      console.error('Failed to fetch expenses for month:', err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // DON'T clear saved credentials - keep them for fingerprint login
              // User can still use fingerprint to login as the saved account
              
              // Sign out from Supabase
              await supabase.auth.signOut();
              
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (error) {
              console.error("Logout error:", error);
            }
          }
        }
      ]
    );
  };

  // Function to get initials from full name
  const getInitials = (fullname) => {
    if (!fullname) return 'U';
    
    const names = fullname.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    // Get first letter of first name and first letter of last name
    const firstInitial = names[0].charAt(0).toUpperCase();
    const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
    
    return firstInitial + lastInitial;
  };

  // Choose display name
  const displayName = profile?.fullname || profile?.username || profile?.email || 'User';

  return (
    <ImageBackground 
      source={require('../assets/flowpay_bg.png')}
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ marginTop: -70 }}
    >
      <StatusBar barStyle="light-content" />
      <View
        style={styles.gradient}
      >
        {/* Header with Profile */}
        <SafeAreaView style={styles.header}>
          <Image
            source={require('../assets/FlowPay_NoBg_Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleLogout}
          >
            <LinearGradient
              colors={['#0D7A5F', '#179C7D', '#20B890']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.userIcon}
            >
              <Text style={styles.userIconText}>
                {getInitials(profile?.fullname)}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              ₱{profile ? Number(profile.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </Text>
            <TouchableOpacity style={styles.infoButton}>
              <Text style={styles.infoButtonText}>?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Transfer')}>
            <View style={styles.iconCircle}>
              <Ionicons name="swap-horizontal" size={18} color="white" />
            </View>
            <Text style={styles.actionText}>Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PayBills')}>
            <View style={styles.iconCircle}>
              <Ionicons name="receipt" size={18} color="white" />
            </View>
            <Text style={styles.actionText}>Pay Bills</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Statistics Cards Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statsCard, styles.expensesCard]}>
            <Text style={styles.statsLabel}>Monthly Bills</Text>
            <Text style={styles.statsAmount}>
              {monthlyBillsCount} bills
            </Text>
            <View style={styles.chartContainer}>
              <View style={[styles.bar, { height: 30 }]} />
              <View style={[styles.bar, { height: 60 }]} />
              <View style={[styles.bar, { height: 40 }]} />
              <View style={[styles.bar, { height: 50 }]} />
              <View style={[styles.bar, { height: 35 }]} />
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Weekly Spending</Text>
              <Text style={styles.statsAmount}>
                ₱{Number(weeklySpending).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Filters</Text>
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => {
                    const m = new Date(selectedMonth);
                    m.setMonth(m.getMonth() - 1);
                    setSelectedMonth(m);
                  }}>
                    <Text style={{ fontSize: 18 }}>{'<'}</Text>
                  </TouchableOpacity>
                  <Text style={{ fontWeight: '600' }}>{selectedMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</Text>
                  <TouchableOpacity onPress={() => {
                    const m = new Date(selectedMonth);
                    m.setMonth(m.getMonth() + 1);
                    setSelectedMonth(m);
                  }}>
                    <Text style={{ fontSize: 18 }}>{'>'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ marginTop: 10, flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => setSelectedCategory('all')} style={[styles.filterButton, selectedCategory === 'all' && styles.filterButtonActive]}>
                    <Text>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedCategory('food')} style={[styles.filterButton, selectedCategory === 'food' && styles.filterButtonActive]}>
                    <Text>Food</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedCategory('transport')} style={[styles.filterButton, selectedCategory === 'transport' && styles.filterButtonActive]}>
                    <Text>Transport</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Expenses</Text>
        <ScrollView style={styles.scrollableSection} showsVerticalScrollIndicator={false}>
          <View style={styles.recentActivityContainer}>
            {expenseItems.length === 0 && (
              <Text style={{ color: '#999', textAlign: 'center', marginTop: 10 }}>No expenses for this month.</Text>
            )}
            {expenseItems.map((e, idx) => (
              <View style={styles.transactionItem} key={e.id || idx}>
                <View style={styles.transactionLeft}>
                  <View style={[styles.transactionIcon, styles.receivedIcon]}>
                    <Ionicons name="receipt" size={20} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.transactionTitle}>{e.description || e.bill_type || e.provider}</Text>
                    <Text style={styles.transactionDate}>{new Date(e.created_at || e.due_date || e.date).toLocaleDateString()}</Text>
                  </View>
                </View>
                <Text style={[styles.transactionAmount, Number(e.amount) >= 0 ? styles.positiveAmount : styles.negativeAmount]}>₱{Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            ))}

            <View style={{ height: 80 }} />
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  gradient: {
    paddingTop: 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 100,
    marginTop: -70,
    marginLeft: -60,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userIconText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  balanceSection: {
    paddingHorizontal: 25,
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'white',
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
  },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  infoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 5,
    marginTop: -25,
    gap: 20, // Moderate space between the two buttons
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A90A4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  scrollableSection: {
    flex: 1,
    marginTop: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    height: 180,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expensesCard: {
    width: '47%',
    height: 180,
  },
  rightColumn: {
    width: '47%',
    justifyContent: 'space-between',
    height: 180,
    gap: 15, // Adds spacing between Weekly Spending and Coin Balance
  },
  statsLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  statsAmount: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
    marginTop: -10,
  },
  bar: {
    width: 15,
    backgroundColor: '#4A90A4',
    borderRadius: 4,
  },
  recentActivityContainer: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  receivedIcon: {
    backgroundColor: '#E8F5E8',
  },
  transferIcon: {
    backgroundColor: '#FFE8E8',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  filterButtonActive: {
    backgroundColor: '#D1FAE5',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#FF5252',
  },
});