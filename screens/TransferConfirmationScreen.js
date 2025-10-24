import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

export default function TransferConfirmationScreen({ navigation, route }) {
  const { recipientId, recipientAccountNumber, recipientName, recipientEmail, amount } = route.params || {};
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadRecipient = async () => {
      try {
        // If QR already provided enough info, use it directly
        if ((recipientName || recipientEmail || recipientAccountNumber) && !recipientId) {
          setRecipient({
            id: recipientId || null,
            account_number: recipientAccountNumber || null,
            fullname: recipientName || null,
            email: recipientEmail || null
          });
          setLoading(false);
          return;
        }

        // If we have a supabase UUID id, fetch by id
        if (recipientId) {
          const { data: profileData, error } = await supabase
            .from('profile')
            .select('*')
            .eq('id', recipientId)
            .single();
          if (!error && profileData && !cancelled) {
            setRecipient(profileData);
            setLoading(false);
            return;
          }
        }

        // As fallback, try to fetch by account_number column if we received one
        if (recipientAccountNumber) {
          const { data: profileData2, error: err2 } = await supabase
            .from('profile')
            .select('*')
            .eq('account_number', recipientAccountNumber)
            .single();
          if (!err2 && profileData2 && !cancelled) {
            setRecipient(profileData2);
            setLoading(false);
            return;
          }
        }

        // If nothing found, use passed name/email if present
        if (!cancelled) {
          setRecipient({
            id: recipientId || null,
            account_number: recipientAccountNumber || null,
            fullname: recipientName || null,
            email: recipientEmail || null
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch recipient profile', err);
        if (!cancelled) {
          setRecipient({
            id: recipientId || null,
            account_number: recipientAccountNumber || null,
            fullname: recipientName || null,
            email: recipientEmail || null
          });
          setLoading(false);
        }
      }
    };

    loadRecipient();
    return () => { cancelled = true; };
  }, [recipientId, recipientAccountNumber, recipientName, recipientEmail]);
  
  const [transferring, setTransferring] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [amountState, setAmountState] = useState(amount || '');
  const [note, setNote] = useState('');
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        navigation.goBack();
        return;
      }

      // Fetch user profile and balance
      const { data: userProfileData, error: userError } = await supabase
        .from('profile')
        .select('id, fullname, username, email, account_number, balance')
        .eq('id', user.id)
        .single();

      if (userError || !userProfileData) {
        Alert.alert('Error', 'Failed to fetch user profile');
        navigation.goBack();
        return;
      }

      setUserProfile(userProfileData);
      setUserBalance(userProfileData.balance || 0);
      
    } catch (error) {
      console.error('Error fetching profiles:', error);
      Alert.alert('Error', 'Failed to load transfer details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!amountState || parseFloat(amountState) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const transferAmount = parseFloat(amountState);
    if (transferAmount > userBalance) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance for this transfer');
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Send ₱${transferAmount.toFixed(2)} to ${recipient.fullname || recipient.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: processTransfer }
      ]
    );
  };

  const processTransfer = async () => {
    try {
      setTransferring(true);
      const transferAmount = parseFloat(amountState);

      // Resolve recipient record first (avoid querying id = null)
      let resolvedRecipient = null;
      if (recipient?.id) {
        const { data: recById, error: recIdErr } = await supabase
          .from('profile')
          .select('id, balance, fullname, username, account_number, email')
          .eq('id', recipient.id)
          .single();
        if (recIdErr) {
          console.error('Recipient lookup by id error:', recIdErr);
        } else {
          resolvedRecipient = recById;
        }
      } else if (recipient?.account_number) {
        const { data: recByAcct, error: recAcctErr } = await supabase
          .from('profile')
          .select('id, balance, fullname, username, account_number, email')
          .eq('account_number', recipient.account_number)
          .single();
        if (recAcctErr) {
          console.error('Recipient lookup by account_number error:', recAcctErr);
        } else {
          resolvedRecipient = recByAcct;
        }
      }

      if (!resolvedRecipient) {
        Alert.alert('Recipient Not Found', 'Could not find the recipient account. Transfer cancelled.');
        setTransferring(false);
        return;
      }

      // Generate unique transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // First, update sender's balance (deduct amount)
      const { data: senderUpdate, error: senderError } = await supabase
        .from('profile')
        .update({
          balance: userBalance - transferAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id)
        .select('balance')
        .single();

      if (senderError) {
        console.error('Sender update error:', senderError);
        Alert.alert('Transfer Failed', 'Failed to deduct amount from your account');
        setTransferring(false);
        return;
      }

      // Use resolvedRecipient to get current balance and id
      const recipientIdResolved = resolvedRecipient.id;
      const recipientCurrentBalance = resolvedRecipient.balance || 0;

      // Update recipient's balance (add amount)
      const { data: recipientUpdate, error: recipientError } = await supabase
        .from('profile')
        .update({
          balance: recipientCurrentBalance + transferAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipientIdResolved)
        .select('balance')
        .single();

      if (recipientError) {
        console.error('Recipient update error:', recipientError);
        // Rollback sender's balance
        await supabase
          .from('profile')
          .update({ balance: userBalance, updated_at: new Date().toISOString() })
          .eq('id', userProfile.id);

        Alert.alert('Transfer Failed', 'Failed to add amount to recipient account');
        setTransferring(false);
        return;
      }

      // Record the transaction (sender)
      const transactionData = {
        user_id: userProfile.id,
        type: 'transfer_sent',
        amount: transferAmount,
        description: `Transfer to ${resolvedRecipient.fullname || resolvedRecipient.username}${note ? ` - ${note}` : ''}`,
        status: 'completed',
        counterparty: resolvedRecipient.fullname || resolvedRecipient.username,
        recipient_name: resolvedRecipient.fullname || resolvedRecipient.username
      };

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData);

      // Record transaction for recipient
      const recipientTransactionData = {
        user_id: recipientIdResolved,
        type: 'transfer_received',
        amount: transferAmount,
        description: `Transfer from ${userProfile.fullname || userProfile.username}${note ? ` - ${note}` : ''}`,
        status: 'completed',
        counterparty: userProfile.fullname || userProfile.username,
        recipient_name: userProfile.fullname || userProfile.username
      };

      const { error: recipientTransactionError } = await supabase
        .from('transactions')
        .insert(recipientTransactionData);

      if (transactionError || recipientTransactionError) {
        console.log('Transaction recording failed:', transactionError || recipientTransactionError);
      }

      Alert.alert(
        'Transfer Successful',
        `₱${transferAmount.toFixed(2)} has been sent to ${resolvedRecipient.fullname || resolvedRecipient.username}`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }]
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Transfer processing error:', error);
      Alert.alert('Transfer Failed', 'Something went wrong. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#179C7D', '#179C7D', '#0088cc']}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transfer Confirmation</Text>
            <View style={styles.placeholder} />
          </SafeAreaView>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#179C7D" />
          <Text style={styles.loadingText}>Loading transfer details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#179C7D', '#179C7D', '#0088cc']}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transfer Confirmation</Text>
          <View style={styles.placeholder} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* From Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>From</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>
                {userProfile?.fullname || userProfile?.username || 'Your Account'}
              </Text>
              <Text style={styles.accountNumber}>
                Account: {userProfile?.account_number || 'N/A'}
              </Text>
              <Text style={styles.accountBalance}>
                Balance: ₱{userBalance.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* To Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>To</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>
                {recipient?.fullname || recipient?.username || recipientName}
              </Text>
              <Text style={styles.accountNumber}>
                Account: {recipient?.account_number || 'N/A'}
              </Text>
              <Text style={styles.qrCodeLabel}>QR Code Recipient</Text>
            </View>
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <View style={styles.amountCard}>
            {amount ? (
              // QR code has preset amount - show as readonly
              <View style={styles.presetAmountContainer}>
                <Text style={styles.presetAmountLabel}>Preset Amount</Text>
                <Text style={styles.presetAmount}>₱{parseFloat(amount).toFixed(2)}</Text>
                <Text style={styles.presetAmountNote}>
                  This amount was set by the QR code and cannot be changed
                </Text>
              </View>
            ) : (
              // No preset amount - allow user to input
              <View style={styles.inputAmountContainer}>
                <Text style={styles.inputLabel}>Enter Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₱</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amountState}
                    onChangeText={setAmountState}
                    placeholder="0.00"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
                <Text style={styles.inputNote}>
                  Enter the amount you want to send
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Note Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note for this transfer..."
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />
        </View>

        {/* Transfer Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Transfer Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Amount:</Text>
            <Text style={styles.summaryValue}>
              ₱{amountState ? parseFloat(amountState).toFixed(2) : '0.00'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Transaction Fee:</Text>
            <Text style={styles.summaryValue}>₱0.00</Text>
          </View>
          <View style={[styles.summaryItem, styles.totalItem]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              ₱{amountState ? parseFloat(amountState).toFixed(2) : '0.00'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Transfer Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.transferButton,
            (!amountState || parseFloat(amountState) <= 0 || transferring) && styles.transferButtonDisabled
          ]}
          onPress={handleTransfer}
          disabled={!amountState || parseFloat(amountState) <= 0 || transferring}
        >
          {transferring ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.transferButtonText}>
              Send ₱{amountState ? parseFloat(amountState).toFixed(2) : '0.00'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  accountCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  accountBalance: {
    fontSize: 14,
    color: '#179C7D',
    fontWeight: '600',
  },
  qrCodeLabel: {
    fontSize: 12,
    color: '#179C7D',
    backgroundColor: '#e8f5f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  amountCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  presetAmountContainer: {
    alignItems: 'center',
  },
  presetAmountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  presetAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#179C7D',
    marginBottom: 10,
  },
  presetAmountNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputAmountContainer: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#179C7D',
    textAlign: 'center',
    minWidth: 150,
    paddingVertical: 5,
  },
  inputNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  noteInput: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summarySection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 10,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#179C7D',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  transferButton: {
    backgroundColor: '#179C7D',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  transferButtonDisabled: {
    backgroundColor: '#ccc',
  },
  transferButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});