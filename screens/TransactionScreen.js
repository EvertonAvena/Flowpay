import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

export default function TransactionScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'income', 'expense'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTransactions([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setTransactions([]);
    }
    setLoading(false);
  };

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    if (activeTab === 'income') return transaction.type === 'received';
    if (activeTab === 'expense') return transaction.type === 'sent' || transaction.type === 'bill' || transaction.type === 'transfer';
    return true;
  });

  // Helper for icon and color
  const getIcon = (type) => {
    if (type === 'received') return { icon: 'arrow-down-circle', bg: '#e3f7e8', color: '#10B981' };
    if (type === 'sent' || type === 'transfer') return { icon: 'arrow-up-circle', bg: '#ffe0e0', color: '#EF4444' };
    if (type === 'bill') return { icon: 'receipt', bg: '#fff2e0', color: '#F59E0B' };
    return { icon: 'swap-horizontal-outline', bg: '#ffe0e0', color: '#EF4444' };
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#179C7D', '#179C7D', '#0088cc']}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity style={styles.filterButton} onPress={fetchTransactions}>
            <Text style={styles.filterButtonText}>Refresh</Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'income' && styles.activeTab]}
            onPress={() => setActiveTab('income')}
          >
            <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'expense' && styles.activeTab]}
            onPress={() => setActiveTab('expense')}
          >
            <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>
              Expense
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Month Heading */}
        <Text style={styles.monthHeading}>
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>

        {/* Transaction List */}
        {filteredTransactions.map((transaction) => {
          const { icon, bg, color } = getIcon(transaction.type);
          const isIncome = transaction.type === 'received';
          return (
            <TouchableOpacity 
              key={transaction.id} 
              style={styles.transactionItem}
              onPress={() => setSelectedTransaction(transaction)}
            >
              <View 
                style={[
                  styles.iconContainer,
                  { backgroundColor: bg }
                ]}
              >
                <Ionicons name={icon} size={24} color={color} />
              </View>
              <View style={styles.transactionContent}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {transaction.type === 'transfer'
                      ? `Transfer to ${transaction.recipient_name || transaction.counterparty}`
                      : transaction.description || (isIncome ? 'Money Received' : 'Money Sent')}
                  </Text>
                  <Text style={styles.transactionSubtitle}>
                    {isIncome
                      ? `From: ${transaction.counterparty || 'Unknown'}`
                      : transaction.type === 'transfer'
                        ? `To: ${transaction.recipient_name || transaction.counterparty || 'Unknown'}`
                        : `To: ${transaction.counterparty || 'Unknown'}`}
                  </Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text 
                    style={[
                      styles.transactionAmount,
                      isIncome ? styles.incomeAmount : styles.expenseAmount
                    ]}
                  >
                    {isIncome ? '+' : '-'}₱{Math.abs(Number(transaction.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Empty state for when there are no transactions */}
        {filteredTransactions.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Transactions</Text>
            <Text style={styles.emptyStateMessage}>
              You don't have any {activeTab !== 'all' ? activeTab : ''} transactions yet
            </Text>
          </View>
        )}
        
        {/* Add spacer for bottom navigation */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Receipt Modal */}
      <Modal
        visible={!!selectedTransaction}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.receiptContainer}>
            <Text style={styles.receiptTitle}>Transaction Receipt</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Type:</Text>
              <Text style={styles.receiptValue}>{selectedTransaction?.type?.toUpperCase()}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount:</Text>
              <Text style={[
                styles.receiptValue,
                Number(selectedTransaction?.amount) >= 0 ? styles.incomeAmount : styles.expenseAmount
              ]}>
                {Number(selectedTransaction?.amount) >= 0 ? '+' : '-'}₱{Math.abs(Number(selectedTransaction?.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date:</Text>
              <Text style={styles.receiptValue}>{selectedTransaction ? new Date(selectedTransaction.created_at).toLocaleString() : ''}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Description:</Text>
              <Text style={styles.receiptValue}>{selectedTransaction?.description || '-'}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>
                {selectedTransaction?.type === 'received' ? 'From:' : 'To:'}
              </Text>
              <Text style={styles.receiptValue}>
                {selectedTransaction?.type === 'transfer'
                  ? selectedTransaction?.recipient_name || selectedTransaction?.counterparty
                  : selectedTransaction?.counterparty || '-'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.button, { marginTop: 24 }]}
              onPress={() => setSelectedTransaction(null)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#179C7D',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  monthHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 5,
  },
  transactionItem: {
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  transactionDetails: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  incomeAmount: {
    color: '#2ecc71',
  },
  expenseAmount: {
    color: '#e74c3c',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
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
  },
  // Modal styles
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  receiptContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  receiptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#179C7D',
    marginBottom: 18,
    letterSpacing: 1,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 6,
  },
  receiptLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600',
    flex: 1,
  },
  receiptValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#179C7D',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold'
  },
});