import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { RefreshControl, Modal, Alert, Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [monthlyBillsCount, setMonthlyBillsCount] = useState(0);
  const [weeklySpending, setWeeklySpending] = useState(0);
  const [weeklyItems, setWeeklyItems] = useState([]);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expenseItems, setExpenseItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
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
        .select('id, amount, description, provider, reference, date, created_at')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', firstDayOfWeek.toISOString().slice(0, 10));
      const weekTotal = weekData ? weekData.reduce((sum, row) => sum + Number(row.amount), 0) : 0;
      setWeeklySpending(weekTotal);
      setWeeklyItems(weekData || []);

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
      setRefreshing(true);
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
    finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const formatCurrency = (value) => {
    const n = Number(value) || 0;
    return `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString();
    } catch (e) {
      return d;
    }
  };

  const openExpenseDetail = (item) => {
    setSelectedExpense(item);
    setShowExpenseModal(true);
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
          <TouchableOpacity style={[styles.statsCard, styles.expensesCard]} onPress={() => setShowMonthlyModal(true)} activeOpacity={0.9}>
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
          </TouchableOpacity>

          <View style={styles.rightColumn}>
            <TouchableOpacity style={styles.statsCard} onPress={() => setShowWeeklyModal(true)} activeOpacity={0.9}>
              <Text style={styles.statsLabel}>Weekly Spending</Text>
              <Text style={styles.statsAmount}>
                ₱{Number(weeklySpending).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </TouchableOpacity>

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

                <View style={[styles.filtersContainer, { marginTop: 10 }]}>
                  <TouchableOpacity onPress={() => setSelectedCategory('all')} style={[styles.filterButton, selectedCategory === 'all' && styles.filterButtonActive]}>
                    <Text style={[styles.filterButtonText, selectedCategory === 'all' && styles.filterButtonTextActive]}>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedCategory('food')} style={[styles.filterButton, selectedCategory === 'food' && styles.filterButtonActive]}>
                    <Text style={[styles.filterButtonText, selectedCategory === 'food' && styles.filterButtonTextActive]}>Food</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedCategory('transport')} style={[styles.filterButton, selectedCategory === 'transport' && styles.filterButtonActive]}>
                    <Text style={[styles.filterButtonText, selectedCategory === 'transport' && styles.filterButtonTextActive]}>Transport</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Expenses</Text>
        <ScrollView
          style={styles.scrollableSection}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.recentActivityContainer}>
            {expenseItems.length === 0 && (
              <Text style={{ color: '#999', textAlign: 'center', marginTop: 10 }}>No expenses for this month.</Text>
            )}
            {/* Expense detail modal */}
            <Modal
              visible={showExpenseModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowExpenseModal(false)}
            >
              <View style={styles.expenseModalBackground}>
                <View style={styles.expenseModalCard}>
                  <Text style={styles.expenseModalTitle}>{selectedExpense?.description || selectedExpense?.bill_type || 'Expense Detail'}</Text>
                  <View style={styles.expenseModalRow}>
                    <Text style={styles.expenseModalLabel}>Amount</Text>
                    <Text style={styles.expenseModalValue}>{formatCurrency(selectedExpense?.amount)}</Text>
                  </View>
                  <View style={styles.expenseModalRow}>
                    <Text style={styles.expenseModalLabel}>Date</Text>
                    <Text style={styles.expenseModalValue}>{formatDate(selectedExpense?.created_at || selectedExpense?.due_date || selectedExpense?.date)}</Text>
                  </View>
                  <View style={styles.expenseModalRow}>
                    <Text style={styles.expenseModalLabel}>Provider</Text>
                    <Text style={styles.expenseModalValue}>{selectedExpense?.provider || '-'}</Text>
                  </View>
                  <View style={styles.expenseModalRow}>
                    <Text style={styles.expenseModalLabel}>Reference</Text>
                    <Text style={styles.expenseModalValue}>{selectedExpense?.reference || '-'}</Text>
                  </View>
                  <View style={{ marginTop: 16, alignItems: 'flex-end' }}>
                    <TouchableOpacity style={[styles.button, { paddingHorizontal: 18 }]} onPress={() => setShowExpenseModal(false)}>
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            {/* Monthly bills modal */}
            <Modal visible={showMonthlyModal} transparent animationType="slide" onRequestClose={() => setShowMonthlyModal(false)}>
              <View style={styles.expenseModalBackground}>
                <View style={styles.expenseModalCard}>
                  <Text style={styles.expenseModalTitle}>Monthly Bills ({monthlyBillsCount})</Text>
                  <View style={{ maxHeight: 320 }}>
                    {(expenseItems || []).map((b, i) => (
                      <View key={b.id || i} style={styles.modalListItem}>
                        <View style={styles.modalListLeft}>
                          <Text style={styles.modalListTitle}>{b.bill_type || b.provider || 'Bill'}</Text>
                          <Text style={styles.modalListSubtitle}>{formatDate(b.created_at || b.due_date || b.date)} • {b.reference || ''}</Text>
                        </View>
                        <Text style={[styles.transactionAmount, Number(b.amount) >= 0 ? styles.positiveAmount : styles.negativeAmount]}>{formatCurrency(b.amount)}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ marginTop: 12, alignItems: 'flex-end' }}>
                    <TouchableOpacity style={[styles.button, { paddingHorizontal: 18 }]} onPress={() => setShowMonthlyModal(false)}>
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Weekly spending modal */}
            <Modal visible={showWeeklyModal} transparent animationType="slide" onRequestClose={() => setShowWeeklyModal(false)}>
              <View style={styles.expenseModalBackground}>
                <View style={styles.expenseModalCard}>
                  <Text style={styles.expenseModalTitle}>Weekly Spending</Text>
                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ color: '#666' }}>Total: <Text style={{ fontWeight: '700', color: '#111' }}>{formatCurrency(weeklySpending)}</Text></Text>
                  </View>
                  <View style={{ maxHeight: 320 }}>
                    {(weeklyItems || []).map((w, i) => (
                      <View key={w.id || i} style={styles.modalListItem}>
                        <View style={styles.modalListLeft}>
                          <Text style={styles.modalListTitle}>{w.description || w.provider || 'Expense'}</Text>
                          <Text style={styles.modalListSubtitle}>{formatDate(w.date || w.created_at)}</Text>
                        </View>
                        <Text style={[styles.transactionAmount, Number(w.amount) >= 0 ? styles.positiveAmount : styles.negativeAmount]}>{formatCurrency(w.amount)}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ marginTop: 12, alignItems: 'flex-end' }}>
                    <TouchableOpacity style={[styles.button, { paddingHorizontal: 18 }]} onPress={() => setShowWeeklyModal(false)}>
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {expenseItems.map((e, idx) => (
              <TouchableOpacity
                key={e.id || idx}
                style={styles.transactionItem}
                activeOpacity={0.8}
                onPress={() => openExpenseDetail(e)}
              >
                <View style={styles.transactionLeft}>
                  <View style={[styles.transactionIcon, styles.receivedIcon]}>
                    <Ionicons name="receipt" size={20} color="#10B981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.transactionTitle}>{e.description || e.bill_type || e.provider || 'Expense'}</Text>
                    <Text style={styles.transactionDate}>{formatDate(e.created_at || e.due_date || e.date)}</Text>
                    <Text style={styles.transactionMeta} numberOfLines={1} ellipsizeMode="tail">{e.provider ? `Provider: ${e.provider}` : e.reference ? `Ref: ${e.reference}` : ''}</Text>
                  </View>
                </View>
                <Text style={[styles.transactionAmount, Number(e.amount) >= 0 ? styles.positiveAmount : styles.negativeAmount]}>{formatCurrency(e.amount)}</Text>
              </TouchableOpacity>
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
    // use margin on children for spacing instead of unsupported `gap`
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.4,
    marginRight: 12,
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
    // spacing handled by justifyContent and margins
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
  expenseModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  expenseModalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  expenseModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  expenseModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  expenseModalLabel: { color: '#666', fontSize: 13 },
  expenseModalValue: { color: '#111', fontSize: 14, fontWeight: '600' },
  modalListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalListLeft: { flex: 1 },
  modalListTitle: { fontWeight: '600', color: '#111' },
  modalListSubtitle: { color: '#666', fontSize: 12, marginTop: 4 },
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
  transactionMeta: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#065F46',
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // allow buttons to wrap on small screens
    flexWrap: 'wrap',
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