import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

function maskName(name = '') {
  // Mask all but first and last letter of each word
  return name.split(' ').map(word =>
    word.length <= 2
      ? word
      : word[0] + '*'.repeat(word.length - 2) + word[word.length - 1]
  ).join(' ');
}

function maskAccount(account = '') {
  // Mask all but last 4 digits
  if (!account) return '';
  const str = account.toString();
  return str.length <= 4 ? str : '+****' + str.slice(-4);
}

export default function TransferScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleTransfer = async () => {
    if (!amount || !recipientAccountNumber || !recipientName) {
      Alert.alert('Error', 'Please enter recipient account number, name, and amount.');
      return;
    }
    const transferAmount = Math.abs(Number(amount));
    if (transferAmount <= 0) {
      Alert.alert('Error', 'Amount must be greater than zero.');
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'No user found.');
        return;
      }

      // 1. Get sender profile
      const { data: senderProfile, error: senderError } = await supabase
        .from('profile')
        .select('id, balance, account_number, fullname')
        .eq('id', user.id)
        .single();
      if (senderError || !senderProfile) {
        Alert.alert('Error', 'Sender profile not found.');
        return;
      }

      // 2. Get recipient profile by account number
      const trimmedAccountNumber = recipientAccountNumber.trim();
      const { data: recipientProfile, error: recipientError } = await supabase
        .from('profile')
        .select('id, balance, account_number, fullname')
        .eq('account_number', trimmedAccountNumber)
        .single();
      if (recipientError || !recipientProfile) {
        Alert.alert('Error', 'Recipient not found');
        return;
      }
      if (recipientProfile.id === senderProfile.id) {
        Alert.alert('Error', 'You cannot transfer to your own account.');
        return;
      }

      // 3. Check recipient name (case-sensitive, must match exactly)
      if (recipientProfile.fullname !== recipientName) {
        Alert.alert('Error', 'Recipient name does not match our records. Please check the spelling and case.');
        return;
      }

      // 4. Check sender balance
      if (Number(senderProfile.balance) < transferAmount) {
        Alert.alert('Error', 'Insufficient balance.');
        return;
      }

      // 5. Update balances
      const { error: updateSenderError } = await supabase
        .from('profile')
        .update({ balance: Number(senderProfile.balance) - transferAmount })
        .eq('id', senderProfile.id);
      if (updateSenderError) throw updateSenderError;

      const { error: updateRecipientError } = await supabase
        .from('profile')
        .update({ balance: Number(recipientProfile.balance) + transferAmount })
        .eq('id', recipientProfile.id);
      if (updateRecipientError) throw updateRecipientError;

      // 6. Insert transaction for sender (save recipient_name)
      console.log('Inserting sender transaction:', {
        user_id: senderProfile.id,
        type: 'transfer',
        amount: -transferAmount,
        recipient_name: recipientProfile.fullname,
        counterparty: recipientAccountNumber
      });
      
      const { data: senderTxData, error: txError } = await supabase.from('transactions').insert([{
        user_id: senderProfile.id,
        type: 'transfer',
        amount: -transferAmount,
        description: description || `Transfer to ${recipientProfile.fullname}`,
        status: 'completed',
        counterparty: recipientAccountNumber,
        recipient_name: recipientProfile.fullname,
        created_at: new Date().toISOString()
      }]).select();
      
      if (txError) {
        console.error('Error inserting sender transaction:', txError);
        throw txError;
      }
      console.log('Sender transaction inserted:', senderTxData);

      // 7. Insert transaction for recipient
      console.log('Inserting recipient transaction:', {
        user_id: recipientProfile.id,
        type: 'received',
        amount: transferAmount,
        recipient_name: senderProfile.fullname,
        counterparty: senderProfile.account_number
      });
      
      const { data: recipientTxData, error: txError2 } = await supabase.from('transactions').insert([{
        user_id: recipientProfile.id,
        type: 'received',
        amount: transferAmount,
        description: description || `Received from ${senderProfile.fullname}`,
        status: 'completed',
        counterparty: senderProfile.account_number,
        recipient_name: senderProfile.fullname,
        created_at: new Date().toISOString()
      }]).select();
      
      if (txError2) {
        console.error('Error inserting recipient transaction:', txError2);
        // Don't throw here - sender transaction already succeeded
      } else {
        console.log('Recipient transaction inserted:', recipientTxData);
      }

      // 8. Show receipt modal
      setReceipt({
        amount: transferAmount,
        to: maskName(recipientProfile.fullname),
        toAccount: recipientProfile.account_number,
        from: maskName(senderProfile.fullname),
        fromAccount: senderProfile.account_number,
        date: new Date().toLocaleString(),
        description: description || `Transfer to ${recipientAccountNumber}`,
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Transfer failed.');
    }
  };

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
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transfer</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Recipient Account Number"
          value={recipientAccountNumber}
          onChangeText={text => setRecipientAccountNumber(text.replace(/\s/g, ''))}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Recipient Full Name (case-sensitive)"
          value={recipientName}
          onChangeText={setRecipientName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
        />
        <TouchableOpacity style={styles.button} onPress={handleTransfer}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Receipt Modal */}
      <Modal
        visible={!!receipt}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setReceipt(null);
          navigation.goBack();
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.receiptCard}>
            <Text style={styles.receiptHeader}>Transfer Receipt</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>From:</Text>
              <Text style={styles.receiptValueCenter}>
                {receipt?.from}
                {'\n'}
                <Text style={styles.receiptSubValue}>({receipt?.fromAccount})</Text>
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>To:</Text>
              <Text style={styles.receiptValueCenter}>
                {receipt?.to}
                {'\n'}
                <Text style={styles.receiptSubValue}>({receipt?.toAccount})</Text>
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount:</Text>
              <Text style={styles.receiptValue}>₱{receipt?.amount}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date:</Text>
              <Text style={styles.receiptValue}>{receipt?.date}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Description:</Text>
              <Text style={styles.receiptValue}>{receipt?.description}</Text>
            </View>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                setReceipt(null);
                navigation.goBack();
              }}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transaction Detail Modal */}
      <Modal
        visible={!!selectedTransaction}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.gcashReceiptCard}>
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <View style={styles.gcashIconCircle}>
                <Text style={{ fontSize: 30, color: '#179C7D' }}>✉️</Text>
              </View>
              <Text style={styles.gcashDate}>
                {selectedTransaction ? new Date(selectedTransaction.created_at).toLocaleString() : ''}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.gcashTitle}>Express Send Notification</Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 18, color: '#179C7D' }}>🔗</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gcashDivider} />
            <Text style={styles.gcashBodyText}>
              You have sent PHP {Math.abs(Number(selectedTransaction?.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {maskName(selectedTransaction?.recipient_name || selectedTransaction?.counterparty)}
              </Text>
              {' '}({maskAccount(selectedTransaction?.counterparty)}) on{' '}
              {selectedTransaction ? new Date(selectedTransaction.created_at).toLocaleString() : ''} with MSG: {selectedTransaction?.description || '-'}.
              {'\n'}Your new balance is PHP {selectedTransaction?.balance_after !== undefined ? Number(selectedTransaction.balance_after).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '----'}.
              {'\n'}Ref. No. {selectedTransaction?.id?.slice(0, 12) || '----'}.
            </Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
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
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 30,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#179C7D', marginBottom: 30, alignSelf: 'center' },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  button: {
    backgroundColor: '#179C7D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  receiptHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#179C7D',
    marginBottom: 18,
    letterSpacing: 1,
    textAlign: 'center',
  },
  receiptRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  receiptLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600',
    flex: 1.2,
    textAlign: 'left',
  },
  receiptValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  receiptValueCenter: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'center',
  },
  receiptSubValue: {
    fontSize: 13,
    color: '#888',
    fontWeight: 'normal',
  },
  doneButton: {
    backgroundColor: '#179C7D',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginTop: 24,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gcashReceiptCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    width: '90%',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  gcashIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#e6f7f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gcashDate: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  gcashTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2366d1',
    marginBottom: 6,
  },
  gcashDivider: {
    height: 1,
    backgroundColor: '#eee',
    alignSelf: 'stretch',
    width: '100%',
    marginVertical: 12,
  },
  gcashBodyText: {
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
    lineHeight: 22,
  }
});